import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, mkdtemp, open, readdir, readFile, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import { PROCESSOR_API_VERSION, PROCESSOR_CAPABILITIES, verifyToken, type ProcessorErrorBody } from "@expensico/processing-contract";
import { config } from "./config.ts";
import { ConversionError, compressPdf, officeToPdf } from "./convert.ts";
import { ALLOWED, extensionOf, magicMatches, parseOperation, safeBaseName } from "./validate.ts";

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? "info",
    // Never log request bodies, file names or auth headers.
    redact: ["req.headers.authorization", "req.headers.cookie"],
  },
  bodyLimit: 1024 * 64,
  trustProxy: true,
  genReqId: () => randomUUID(),
});

const fail = (code: ProcessorErrorBody["error"]["code"], message: string): ProcessorErrorBody => ({ error: { code, message } });

await app.register(cors, {
  origin: (origin, cb) => cb(null, !origin ? false : config.allowedOrigins.includes(origin)),
  methods: ["POST", "GET"],
  allowedHeaders: ["Authorization", "Content-Type"],
  maxAge: 600,
});
await app.register(rateLimit, { max: 30, timeWindow: "10 minutes", errorResponseBuilder: () => fail("rate-limited", "Too many requests") });
await app.register(multipart, { limits: { fileSize: config.maxFileBytes, files: 1, fields: 4, fieldSize: 1024, parts: 6 } });

await mkdir(config.tmpRoot, { recursive: true, mode: 0o700 });

let active = 0;

app.get("/health", async () => ({ ok: true, active }));
app.get(`/${PROCESSOR_API_VERSION}/capabilities`, async () => ({ capabilities: PROCESSOR_CAPABILITIES, maxFileBytes: config.maxFileBytes }));

app.post(`/${PROCESSOR_API_VERSION}/process`, async (req, reply) => {
  const auth = req.headers.authorization ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return reply.code(401).send(fail("unauthorized", "Missing token"));
  if (!req.isMultipart()) return reply.code(400).send(fail("bad-request", "Expected multipart/form-data"));
  if (active >= config.maxConcurrent) return reply.code(503).header("Retry-After", "10").send(fail("rate-limited", "Server busy, try again shortly"));

  active++;
  const jobDir = await mkdtemp(join(config.tmpRoot, "job-"));
  try {
    let opRaw: unknown;
    let inputPath: string | null = null;
    let ext = "";
    for await (const part of req.parts()) {
      if (part.type === "field" && part.fieldname === "operation") opRaw = part.value;
      else if (part.type === "file" && part.fieldname === "file" && !inputPath) {
        ext = extensionOf(part.filename);
        inputPath = join(jobDir, `input.${ext || "bin"}`);
        await pipeline(part.file, createWriteStream(inputPath, { flags: "wx", mode: 0o600 }));
        if (part.file.truncated) return reply.code(413).send(fail("too-large", "File too large"));
      } else if (part.type === "file") {
        part.file.resume();
      }
    }
    const op = parseOperation(opRaw);
    if (!op) return reply.code(400).send(fail("bad-request", "Unknown operation"));
    const v = await verifyToken(token, config.secret, op.kind);
    if (!v.ok) return reply.code(401).send(fail("unauthorized", v.reason === "expired" ? "Token expired" : "Invalid token"));
    if (!inputPath) return reply.code(400).send(fail("bad-request", "No file uploaded"));
    if (!ALLOWED[op.kind].has(ext)) return reply.code(415).send(fail("unsupported", `.${ext || "?"} files aren't supported for this operation`));

    const fh = await open(inputPath, "r");
    const head = new Uint8Array(1024);
    await fh.read(head, 0, 1024, 0);
    await fh.close();
    if (!magicMatches(ext, head)) return reply.code(422).send(fail("invalid-file", "The file contents don't match its type"));

    const output = op.kind === "office-to-pdf" ? await officeToPdf(jobDir, inputPath) : await compressPdf(jobDir, inputPath, op.level ?? "ebook");
    const bytes = await readFile(output);
    req.log.info({ op: op.kind, inBytes: (await stat(inputPath)).size, outBytes: bytes.length }, "job complete");
    return reply
      .header("Content-Type", "application/pdf")
      .header("Content-Disposition", `attachment; filename="${safeBaseName("converted.pdf")}"`)
      .header("Cache-Control", "no-store")
      .send(bytes);
  } catch (err) {
    if (err instanceof ConversionError) {
      req.log.warn({ code: err.code }, "conversion failed");
      return reply.code(err.code === "timeout" ? 504 : 422).send(fail(err.code, err.code === "encrypted" ? "The file is password-protected" : err.code === "timeout" ? "Conversion timed out" : "The file couldn't be converted"));
    }
    if ((err as { code?: string }).code === "FST_REQ_FILE_TOO_LARGE") return reply.code(413).send(fail("too-large", "File too large"));
    req.log.error({ err: (err as Error).message }, "unexpected error");
    return reply.code(500).send(fail("failed", "Unexpected error"));
  } finally {
    active--;
    // Always delete the job directory: input, output and LibreOffice profile.
    await rm(jobDir, { recursive: true, force: true });
  }
});

/** Safety net: remove any job directory older than 15 minutes (e.g. after a crash). */
async function sweep() {
  const cutoff = Date.now() - 15 * 60 * 1000;
  for (const name of await readdir(config.tmpRoot).catch(() => [] as string[])) {
    const p = join(config.tmpRoot, name);
    const s = await stat(p).catch(() => null);
    if (s && s.mtimeMs < cutoff) await rm(p, { recursive: true, force: true });
  }
}
setInterval(() => void sweep(), 5 * 60 * 1000).unref();
await sweep();

await app.listen({ port: config.port, host: config.host });

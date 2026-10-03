import type { ProcessorErrorBody, ProcessorOperation } from "@expensico/processing-contract";
import { PROCESSOR_API_VERSION, PROCESSOR_LIMITS } from "@expensico/processing-contract";
import { processorConfig } from "@/config/site";
import { ToolError } from "@/lib/files/errors";
import { formatBytes, replaceExtension } from "@/lib/format";
import type { ConversionDef } from "@/lib/convert/catalog";
import { FORMATS } from "@/lib/convert/formats";
import type { ConversionInput, ConversionResult, ProcessingEngine } from "./types";

async function getToken(op: ProcessorOperation["kind"], signal: AbortSignal): Promise<string> {
  let res: Response;
  try {
    res = await fetch("/api/processing-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op }),
      signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw new ToolError("cancelled");
    throw new ToolError("network");
  }
  if (res.status === 429) throw new ToolError("rate-limited");
  if (!res.ok) throw new ToolError("server-unavailable");
  const body = (await res.json()) as { token?: string };
  if (!body.token) throw new ToolError("server-unavailable");
  return body.token;
}

function mapError(status: number, body: ProcessorErrorBody | null): ToolError {
  const code = body?.error?.code;
  if (status === 413 || code === "too-large") return new ToolError("too-large", `The limit for server conversions is ${formatBytes(PROCESSOR_LIMITS.maxFileBytes, 0)}.`);
  if (status === 429 || code === "rate-limited") return new ToolError("rate-limited");
  if (code === "encrypted") return new ToolError("encrypted");
  if (code === "unsupported") return new ToolError("unsupported", body?.error.message);
  if (code === "invalid-file") return new ToolError("corrupted", body?.error.message);
  if (code === "timeout") return new ToolError("conversion-failed", "The document took too long to convert. Very large or complex files may not be supported.");
  if (status >= 500) return new ToolError("server-unavailable");
  return new ToolError("conversion-failed", body?.error?.message);
}

/** Upload with progress via XHR (fetch has no upload progress in most browsers). */
function upload(url: string, form: FormData, token: string, input: ConversionInput): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.responseType = "blob";
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.timeout = (PROCESSOR_LIMITS.timeoutSeconds + 60) * 1000;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) input.onProgress({ value: (e.loaded / e.total) * 0.5, label: "Uploading securely…" });
    };
    xhr.upload.onload = () => input.onProgress({ label: "Converting on the server…" });

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response as Blob);
        return;
      }
      let body: ProcessorErrorBody | null = null;
      try {
        body = JSON.parse(await (xhr.response as Blob).text());
      } catch {
        body = null;
      }
      reject(mapError(xhr.status, body));
    };
    xhr.onerror = () => reject(new ToolError("network"));
    xhr.ontimeout = () => reject(new ToolError("conversion-failed", "The server took too long to respond."));
    xhr.onabort = () => reject(new ToolError("cancelled"));
    input.signal.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(form);
  });
}

function operationFor(def: ConversionDef): ProcessorOperation {
  if (def.impl === "server-office") return { kind: "office-to-pdf" };
  throw new ToolError("unsupported");
}

export const remoteEngine: ProcessingEngine = {
  kind: "remote",
  async convert(def, input): Promise<ConversionResult> {
    if (!processorConfig.url) throw new ToolError("server-unavailable");
    const file = input.files[0];
    if (file.size > PROCESSOR_LIMITS.maxFileBytes) {
      throw new ToolError("too-large", `Server conversions accept files up to ${formatBytes(PROCESSOR_LIMITS.maxFileBytes, 0)}.`);
    }
    const op = operationFor(def);
    input.onProgress({ label: "Preparing secure upload…" });
    const token = await getToken(op.kind, input.signal);

    const form = new FormData();
    form.append("operation", JSON.stringify(op));
    form.append("file", file, file.name);

    const blob = await upload(`${processorConfig.url}/${PROCESSOR_API_VERSION}/process`, form, token, input);
    input.onProgress({ value: 1, label: "Done" });
    return {
      files: [{ name: replaceExtension(file.name, FORMATS[def.to].extensions[0]), blob: new Blob([blob], { type: FORMATS[def.to].mime }), preview: def.to === "pdf" ? "pdf" : "none", sourceSize: file.size }],
      warnings: [],
    };
  },
};

/** Server-side PDF compression via Ghostscript (used by the Compress PDF tool's optional mode). */
export async function remoteCompressPdf(file: File, level: "screen" | "ebook" | "printer", input: Omit<ConversionInput, "files" | "options">): Promise<Blob> {
  if (!processorConfig.url) throw new ToolError("server-unavailable");
  if (file.size > PROCESSOR_LIMITS.maxFileBytes) throw new ToolError("too-large", `Server compression accepts files up to ${formatBytes(PROCESSOR_LIMITS.maxFileBytes, 0)}.`);
  input.onProgress({ label: "Preparing secure upload…" });
  const token = await getToken("pdf-compress", input.signal);
  const form = new FormData();
  form.append("operation", JSON.stringify({ kind: "pdf-compress", level } satisfies ProcessorOperation));
  form.append("file", file, file.name);
  const blob = await upload(`${processorConfig.url}/${PROCESSOR_API_VERSION}/process`, form, token, { ...input, files: [file], options: {} });
  return new Blob([blob], { type: "application/pdf" });
}

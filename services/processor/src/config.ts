import { PROCESSOR_LIMITS } from "@expensico/processing-contract";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable ${name}`);
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 8080),
  host: process.env.HOST ?? "0.0.0.0",
  /** Shared with the web app (PROCESSOR_SHARED_SECRET). At least 32 characters. */
  secret: required("PROCESSOR_SHARED_SECRET"),
  /** Comma-separated list of allowed browser origins, e.g. https://expensico.com,https://www.expensico.com */
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  maxFileBytes: Number(process.env.MAX_FILE_BYTES ?? PROCESSOR_LIMITS.maxFileBytes),
  timeoutMs: Number(process.env.CONVERSION_TIMEOUT_SECONDS ?? PROCESSOR_LIMITS.timeoutSeconds) * 1000,
  maxConcurrent: Number(process.env.MAX_CONCURRENT_JOBS ?? 2),
  tmpRoot: process.env.TMP_DIR ?? "/tmp/expensico-jobs",
  sofficeBin: process.env.SOFFICE_BIN ?? "soffice",
  gsBin: process.env.GS_BIN ?? "gs",
};

if (config.secret.length < 32) throw new Error("PROCESSOR_SHARED_SECRET must be at least 32 characters");

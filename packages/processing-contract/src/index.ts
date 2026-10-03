/**
 * Contract between the Expensico web app and the processor service.
 *
 * Runtime-agnostic: uses only Web Crypto and standard APIs, so it works in browsers,
 * Node 20+, Cloudflare Workers and the processor container alike.
 */

export const PROCESSOR_API_VERSION = "v1";

/** Operations the processor can perform. */
export type ProcessorOperation =
  | { kind: "office-to-pdf" }
  | { kind: "pdf-compress"; level: "screen" | "ebook" | "printer" };

export interface ProcessorCapability {
  operation: ProcessorOperation["kind"];
  inputExtensions: string[];
  output: string;
}

export const PROCESSOR_CAPABILITIES: ProcessorCapability[] = [
  { operation: "office-to-pdf", inputExtensions: ["docx", "doc", "odt", "rtf", "xlsx", "xls", "ods", "pptx", "ppt", "odp"], output: "pdf" },
  { operation: "pdf-compress", inputExtensions: ["pdf"], output: "pdf" },
];

export const PROCESSOR_LIMITS = {
  /** Maximum upload size in bytes. */
  maxFileBytes: 50 * 1024 * 1024,
  /** Seconds a single conversion may run before it is killed. */
  timeoutSeconds: 120,
  /** Job tokens are valid for this many seconds. */
  tokenTtlSeconds: 300,
};

export interface ProcessorErrorBody {
  error: {
    code: "bad-request" | "unauthorized" | "too-large" | "unsupported" | "invalid-file" | "encrypted" | "timeout" | "rate-limited" | "failed";
    message: string;
  };
}

// ───────────────────────── Job tokens ─────────────────────────
//
// The web app issues short-lived HMAC tokens from a server route; the browser sends the
// file directly to the processor with that token. This keeps the processor from being an
// open conversion API without routing large uploads through serverless functions.

export interface TokenPayload {
  /** Expiry, seconds since epoch. */
  exp: number;
  /** Random nonce. */
  n: string;
  /** Operation the token authorises. */
  op: ProcessorOperation["kind"];
}

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signToken(payload: TokenPayload, secret: string): Promise<string> {
  if (!secret || secret.length < 32) throw new Error("Processor secret must be at least 32 characters");
  const body = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(secret), new TextEncoder().encode(body)));
  return `${body}.${b64url(sig)}`;
}

export type VerifyResult = { ok: true; payload: TokenPayload } | { ok: false; reason: "malformed" | "signature" | "expired" | "operation" };

export async function verifyToken(token: string, secret: string, expectedOp: ProcessorOperation["kind"], nowSeconds = Math.floor(Date.now() / 1000)): Promise<VerifyResult> {
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { ok: false, reason: "malformed" };
  let sig: Uint8Array;
  try {
    sig = b64urlDecode(parts[1]);
  } catch {
    return { ok: false, reason: "malformed" };
  }
  // crypto.subtle.verify is constant-time.
  const valid = await crypto.subtle.verify("HMAC", await hmacKey(secret), sig as BufferSource, new TextEncoder().encode(parts[0]));
  if (!valid) return { ok: false, reason: "signature" };
  let payload: TokenPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(b64urlDecode(parts[0])));
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (typeof payload.exp !== "number" || payload.exp < nowSeconds) return { ok: false, reason: "expired" };
  if (payload.op !== expectedOp) return { ok: false, reason: "operation" };
  return { ok: true, payload };
}

export function randomNonce(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return b64url(bytes);
}

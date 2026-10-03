import { base64ToBytes, bytesToBase64 } from "./encoding";

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  parts: [string, string, string];
}

function decodePart(part: string, label: string): Record<string, unknown> {
  let json: string;
  try {
    json = new TextDecoder("utf-8", { fatal: true }).decode(base64ToBytes(part));
  } catch {
    throw new Error(`The ${label} isn't valid Base64URL.`);
  }
  try {
    const v = JSON.parse(json);
    if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error();
    return v;
  } catch {
    throw new Error(`The ${label} isn't a JSON object.`);
  }
}

export function decodeJwt(token: string): DecodedJwt {
  const t = token.trim().replace(/^Bearer\s+/i, "");
  const parts = t.split(".");
  if (parts.length === 5) throw new Error("This looks like an encrypted JWT (JWE). Its payload can't be read without the decryption key.");
  if (parts.length !== 3) throw new Error(`A JWT has three parts separated by dots; this has ${parts.length}.`);
  return { header: decodePart(parts[0], "header"), payload: decodePart(parts[1], "payload"), signature: parts[2], parts: parts as [string, string, string] };
}

export type TimeStatus = { kind: "valid" | "expired" | "not-yet-valid" | "no-expiry"; exp?: Date; nbf?: Date; iat?: Date };

export function timeStatus(payload: Record<string, unknown>, now = Date.now()): TimeStatus {
  const toDate = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? new Date(v * 1000) : undefined);
  const exp = toDate(payload.exp);
  const nbf = toDate(payload.nbf);
  const iat = toDate(payload.iat);
  if (nbf && nbf.getTime() > now) return { kind: "not-yet-valid", exp, nbf, iat };
  if (!exp) return { kind: "no-expiry", nbf, iat };
  return { kind: exp.getTime() <= now ? "expired" : "valid", exp, nbf, iat };
}

/** Verify an HS256/384/512 signature with a shared secret using Web Crypto. */
export async function verifyHmac(token: DecodedJwt, secret: string): Promise<boolean> {
  const alg = String(token.header.alg ?? "");
  const hash = ({ HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" } as Record<string, string>)[alg];
  if (!hash) throw new Error(`Only HS256, HS384 and HS512 can be verified here; this token uses ${alg || "no algorithm"}.`);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${token.parts[0]}.${token.parts[1]}`)));
  const expected = bytesToBase64(sig).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  // Constant-time-ish comparison; timing isn't a concern client-side but keep it tidy.
  if (expected.length !== token.signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ token.signature.charCodeAt(i);
  return diff === 0;
}

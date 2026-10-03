/** UTF-8 safe Base64 / Base64URL and URL helpers. */

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  return btoa(bin);
}

export function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/^data:[^,]*,/, "").replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean)) throw new Error("The input contains characters that aren't valid Base64.");
  const padded = clean + "=".repeat((4 - (clean.length % 4)) % 4);
  if (clean.length % 4 === 1) throw new Error("The Base64 input has an invalid length — it may be truncated.");
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function encodeBase64(text: string, urlSafe = false): string {
  const b64 = bytesToBase64(new TextEncoder().encode(text));
  return urlSafe ? b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : b64;
}

export function decodeBase64(b64: string): { text: string; isText: boolean; bytes: Uint8Array } {
  const bytes = base64ToBytes(b64);
  try {
    return { text: new TextDecoder("utf-8", { fatal: true }).decode(bytes), isText: true, bytes };
  } catch {
    return { text: "", isText: false, bytes };
  }
}

export interface UrlParts {
  protocol: string;
  username: string;
  host: string;
  port: string;
  pathname: string;
  hash: string;
  params: [string, string][];
}

export function parseUrl(input: string): UrlParts {
  const u = new URL(input.trim());
  return {
    protocol: u.protocol,
    username: u.username,
    host: u.hostname,
    port: u.port,
    pathname: decodeURIComponentSafe(u.pathname),
    hash: decodeURIComponentSafe(u.hash),
    params: [...u.searchParams.entries()],
  };
}

export function decodeURIComponentSafe(s: string): string {
  try {
    return decodeURIComponent(s.replace(/\+/g, " "));
  } catch {
    return s;
  }
}

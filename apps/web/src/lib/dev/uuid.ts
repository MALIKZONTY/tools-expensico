function hex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function format(h: string): string {
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

export function uuidV4(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  return format(hex(b));
}

/** UUID v7 (RFC 9562): 48-bit Unix ms timestamp + random bits; sorts by creation time. */
export function uuidV7(now = Date.now()): string {
  const b = crypto.getRandomValues(new Uint8Array(16));
  let ts = now;
  for (let i = 5; i >= 0; i--) {
    b[i] = ts % 256;
    ts = Math.floor(ts / 256);
  }
  b[6] = (b[6] & 0x0f) | 0x70;
  b[8] = (b[8] & 0x3f) | 0x80;
  return format(hex(b));
}

export interface UuidInfo {
  valid: boolean;
  version?: number;
  variant?: string;
  timestamp?: Date;
}

export function inspectUuid(input: string): UuidInfo {
  const s = input.trim().toLowerCase().replace(/^urn:uuid:/, "").replace(/^\{|\}$/g, "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(s)) return { valid: false };
  if (s === "00000000-0000-0000-0000-000000000000") return { valid: true, version: 0, variant: "Nil UUID" };
  const version = parseInt(s[14], 16);
  const v = parseInt(s[19], 16);
  const variant = v >= 8 && v <= 11 ? "RFC 9562" : v >= 12 && v <= 13 ? "Microsoft (legacy)" : v < 8 ? "NCS (legacy)" : "Reserved";
  let timestamp: Date | undefined;
  if (version === 7) timestamp = new Date(parseInt(s.replace(/-/g, "").slice(0, 12), 16));
  return { valid: true, version, variant, timestamp };
}

/**
 * Upload validation: extension allowlist, magic-byte check and filename sanitising.
 * Pure functions — covered by validate.test.ts.
 */

export type Operation = "office-to-pdf" | "pdf-compress";

const OFFICE_ZIP = new Set(["docx", "xlsx", "pptx", "odt", "ods", "odp"]);
const OFFICE_OLE = new Set(["doc", "xls", "ppt"]);

export const ALLOWED: Record<Operation, Set<string>> = {
  "office-to-pdf": new Set([...OFFICE_ZIP, ...OFFICE_OLE, "rtf"]),
  "pdf-compress": new Set(["pdf"]),
};

export function extensionOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(i + 1).toLowerCase() : "";
}

/** Strip directories and anything unsafe; keep a short, predictable name. */
export function safeBaseName(name: string): string {
  const base = (name.split(/[\\/]/).pop() ?? "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f<>:"|?*;$`'&(){}[\]!#%^~]/g, "")
    .replace(/\s+/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 100);
  return base || "document";
}

const startsWith = (b: Uint8Array, sig: number[]) => sig.every((v, i) => b[i] === v);

/** Check that the first bytes match what the extension claims. */
export function magicMatches(ext: string, head: Uint8Array): boolean {
  if (ext === "pdf") return new TextDecoder().decode(head.subarray(0, 1024)).includes("%PDF-");
  if (OFFICE_ZIP.has(ext)) return startsWith(head, [0x50, 0x4b, 0x03, 0x04]);
  if (OFFICE_OLE.has(ext)) return startsWith(head, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  if (ext === "rtf") return new TextDecoder().decode(head.subarray(0, 5)) === "{\\rtf";
  return false;
}

export function parseOperation(raw: unknown): { kind: Operation; level?: "screen" | "ebook" | "printer" } | null {
  if (typeof raw !== "string" || raw.length > 200) return null;
  let v: unknown;
  try {
    v = JSON.parse(raw);
  } catch {
    return null;
  }
  const o = v as { kind?: unknown; level?: unknown };
  if (o.kind === "office-to-pdf") return { kind: "office-to-pdf" };
  if (o.kind === "pdf-compress" && (o.level === "screen" || o.level === "ebook" || o.level === "printer")) return { kind: "pdf-compress", level: o.level };
  return null;
}

/**
 * Content-based file type detection (magic bytes), with the extension used only to
 * disambiguate containers (ZIP → DOCX/XLSX/PPTX…, OLE → DOC/XLS/PPT) and text formats.
 * Pure functions over bytes so they can be unit-tested in Node.
 */

import { formatFromExtension, type FormatId } from "@/lib/convert/formats";
import { getExtension } from "@/lib/format";

export interface Detection {
  /** Best guess at the real format, or undefined if unknown. */
  format?: FormatId;
  /** Format implied by the file name extension. */
  extensionFormat?: FormatId;
  /** How the format was determined. */
  method: "signature" | "container" | "text" | "extension" | "unknown";
  /** True when content and extension clearly disagree (e.g. a PNG named .pdf). */
  mismatch: boolean;
  /** Human description of the detected signature. */
  description: string;
  isText: boolean;
}

function startsWith(bytes: Uint8Array, sig: number[], offset = 0): boolean {
  if (bytes.length < offset + sig.length) return false;
  for (let i = 0; i < sig.length; i++) if (bytes[offset + i] !== sig[i]) return false;
  return true;
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  let s = "";
  for (let i = start; i < Math.min(bytes.length, start + length); i++) s += String.fromCharCode(bytes[i]);
  return s;
}

/** Heuristic: valid UTF-8 (or UTF-16 with BOM) without NUL bytes in the sample. */
export function looksLikeText(bytes: Uint8Array): boolean {
  if (bytes.length === 0) return true;
  if (startsWith(bytes, [0xff, 0xfe]) || startsWith(bytes, [0xfe, 0xff])) return true;
  let i = startsWith(bytes, [0xef, 0xbb, 0xbf]) ? 3 : 0;
  let suspicious = 0;
  while (i < bytes.length) {
    const b = bytes[i];
    if (b === 0) return false;
    if (b < 0x80) {
      if (b < 0x09 || (b > 0x0d && b < 0x20 && b !== 0x1b)) suspicious++;
      i++;
      continue;
    }
    // Validate a UTF-8 multi-byte sequence; a truncated sequence at the end of the sample is fine.
    const len = b >= 0xf0 && b <= 0xf4 ? 4 : b >= 0xe0 ? 3 : b >= 0xc2 && b <= 0xdf ? 2 : 0;
    if (len === 0) return false;
    for (let k = 1; k < len; k++) {
      if (i + k >= bytes.length) return suspicious / bytes.length < 0.02;
      if ((bytes[i + k] & 0xc0) !== 0x80) return false;
    }
    i += len;
  }
  return suspicious / bytes.length < 0.02;
}

const ZIP_FORMATS: FormatId[] = ["docx", "xlsx", "pptx", "odt", "ods", "odp", "zip"];
const OLE_FORMATS: FormatId[] = ["doc", "xls", "ppt"];
const TEXT_FORMATS: FormatId[] = ["csv", "tsv", "json", "xml", "yaml", "txt", "html", "md", "svg", "rtf"];

/** Sniff structured text formats from content when the extension is missing or generic. */
function sniffText(text: string): FormatId | undefined {
  const t = text.replace(/^﻿/, "").trimStart();
  if (t.startsWith("{\\rtf")) return "rtf";
  if (/^<svg[\s>]/i.test(t) || (/^<\?xml/i.test(t) && /<svg[\s>]/i.test(t.slice(0, 2000)))) return "svg";
  if (/^<!doctype html|^<html[\s>]/i.test(t)) return "html";
  if (/^<\?xml|^<[a-zA-Z_][\w:.-]*[\s>/]/.test(t)) return "xml";
  if (/^[[{]/.test(t)) return "json";
  return undefined;
}

export function detectFromBytes(fileName: string, head: Uint8Array, zipEntries?: string[]): Detection {
  const ext = getExtension(fileName);
  const extensionFormat = formatFromExtension(ext);
  const result = (format: FormatId | undefined, method: Detection["method"], description: string, isText = false): Detection => {
    let mismatch = false;
    if (format && extensionFormat && format !== extensionFormat) {
      const sameFamily =
        (ZIP_FORMATS.includes(format) && ZIP_FORMATS.includes(extensionFormat)) ||
        (OLE_FORMATS.includes(format) && OLE_FORMATS.includes(extensionFormat)) ||
        (TEXT_FORMATS.includes(format) && TEXT_FORMATS.includes(extensionFormat)) ||
        (format === "xml" && extensionFormat === "svg");
      mismatch = !sameFamily;
    }
    return { format, extensionFormat, method, mismatch, description, isText };
  };

  if (head.length === 0) return result(extensionFormat, "extension", "Empty file", true);

  if (startsWith(head, [0x25, 0x50, 0x44, 0x46, 0x2d])) return result("pdf", "signature", "PDF document");
  // Some PDFs have junk before the header (allowed within the first 1024 bytes).
  if (ascii(head, 0, Math.min(head.length, 1024)).includes("%PDF-")) return result("pdf", "signature", "PDF document (with leading data)");
  if (startsWith(head, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return result("png", "signature", "PNG image");
  if (startsWith(head, [0xff, 0xd8, 0xff])) return result("jpg", "signature", "JPEG image");
  if (ascii(head, 0, 6) === "GIF87a" || ascii(head, 0, 6) === "GIF89a") return result("gif", "signature", "GIF image");
  if (ascii(head, 0, 4) === "RIFF" && ascii(head, 8, 4) === "WEBP") return result("webp", "signature", "WebP image");
  if (ascii(head, 4, 4) === "ftyp" && /^(avif|avis)/.test(ascii(head, 8, 4))) return result("avif", "signature", "AVIF image");
  if (ascii(head, 4, 4) === "ftyp" && /^(heic|heix|hevc|mif1)/.test(ascii(head, 8, 4))) return result(undefined, "signature", "HEIC/HEIF image (not supported in browsers)");
  if (startsWith(head, [0x42, 0x4d]) && head.length > 14 && (extensionFormat === "bmp" || head[14] === 40 || head[14] === 12 || head[14] === 124 || head[14] === 108))
    return result("bmp", "signature", "BMP image");

  if (startsWith(head, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) {
    const f = extensionFormat && OLE_FORMATS.includes(extensionFormat) ? extensionFormat : undefined;
    return result(f, "container", "Microsoft Office 97–2003 file (OLE)");
  }

  if (startsWith(head, [0x50, 0x4b, 0x03, 0x04]) || startsWith(head, [0x50, 0x4b, 0x05, 0x06])) {
    if (zipEntries) {
      const has = (p: string) => zipEntries.some((e) => e === p || e.startsWith(p));
      if (has("word/")) return result("docx", "container", "Word document (Office Open XML)");
      if (has("xl/")) return result("xlsx", "container", "Excel workbook (Office Open XML)");
      if (has("ppt/")) return result("pptx", "container", "PowerPoint presentation (Office Open XML)");
    }
    // OpenDocument stores its MIME type uncompressed right after the first local header.
    const mimeProbe = ascii(head, 30, 80);
    if (mimeProbe.includes("application/vnd.oasis.opendocument.text")) return result("odt", "container", "OpenDocument text");
    if (mimeProbe.includes("application/vnd.oasis.opendocument.spreadsheet")) return result("ods", "container", "OpenDocument spreadsheet");
    if (mimeProbe.includes("application/vnd.oasis.opendocument.presentation")) return result("odp", "container", "OpenDocument presentation");
    if (extensionFormat && ZIP_FORMATS.includes(extensionFormat)) return result(extensionFormat, "container", "ZIP-based file");
    return result("zip", "container", "ZIP archive");
  }

  if (looksLikeText(head)) {
    const sniffed = sniffText(new TextDecoder("utf-8", { fatal: false }).decode(head));
    if (extensionFormat && TEXT_FORMATS.includes(extensionFormat)) {
      // Trust a text extension unless content is obviously a different structured format.
      if (sniffed === "html" && extensionFormat === "txt") return result("html", "text", "HTML document", true);
      return result(extensionFormat, "text", `${extensionFormat.toUpperCase()} text file`, true);
    }
    if (sniffed) return result(sniffed, "text", `${sniffed.toUpperCase()} text`, true);
    return result("txt", "text", "Plain text", true);
  }

  return result(undefined, "unknown", "Unrecognised binary data");
}

/** Read the first `n` bytes of a File. */
export async function readHead(file: Blob, n = 4096): Promise<Uint8Array> {
  return new Uint8Array(await file.slice(0, n).arrayBuffer());
}

/** Browser helper: detect a File's real format, peeking into ZIPs when needed. */
export async function detectFile(file: File): Promise<Detection> {
  const head = await readHead(file);
  let entries: string[] | undefined;
  if (startsWith(head, [0x50, 0x4b, 0x03, 0x04])) {
    try {
      const { default: JSZip } = await import("jszip");
      const zip = await JSZip.loadAsync(file);
      entries = Object.keys(zip.files).slice(0, 2000);
    } catch {
      entries = undefined;
    }
  }
  return detectFromBytes(file.name, head, entries);
}

/**
 * Lossless metadata removal: deletes metadata segments/chunks without touching pixel data.
 * - JPEG: removes APP1 (EXIF/XMP), APP2 (except ICC profile), APP13 (IPTC/Photoshop) and COM segments.
 * - PNG: removes tEXt, iTXt, zTXt, eXIf and tIME chunks.
 */

export function stripJpegMetadata(input: Uint8Array): Uint8Array {
  if (input[0] !== 0xff || input[1] !== 0xd8) throw new Error("Not a JPEG");
  const parts: Uint8Array[] = [input.subarray(0, 2)];
  let i = 2;
  while (i + 4 <= input.length) {
    if (input[i] !== 0xff) throw new Error("Corrupt JPEG segment structure");
    const marker = input[i + 1];
    // Start of scan: the rest is image data.
    if (marker === 0xda) {
      parts.push(input.subarray(i));
      break;
    }
    // Standalone markers have no length.
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      parts.push(input.subarray(i, i + 2));
      i += 2;
      continue;
    }
    const len = (input[i + 2] << 8) | input[i + 3];
    const end = i + 2 + len;
    if (end > input.length) throw new Error("Truncated JPEG");
    const isIcc = marker === 0xe2 && String.fromCharCode(...input.subarray(i + 4, i + 15)) === "ICC_PROFILE";
    const drop = marker === 0xe1 || (marker === 0xe2 && !isIcc) || marker === 0xed || marker === 0xfe;
    if (!drop) parts.push(input.subarray(i, end));
    i = end;
  }
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const PNG_DROP = new Set(["tEXt", "iTXt", "zTXt", "eXIf", "tIME"]);

export function stripPngMetadata(input: Uint8Array): Uint8Array {
  if (!PNG_SIG.every((b, k) => input[k] === b)) throw new Error("Not a PNG");
  const parts: Uint8Array[] = [input.subarray(0, 8)];
  let i = 8;
  while (i + 12 <= input.length) {
    const len = ((input[i] << 24) | (input[i + 1] << 16) | (input[i + 2] << 8) | input[i + 3]) >>> 0;
    const type = String.fromCharCode(...input.subarray(i + 4, i + 8));
    const end = i + 12 + len;
    if (end > input.length) throw new Error("Truncated PNG");
    if (!PNG_DROP.has(type)) parts.push(input.subarray(i, end));
    i = end;
    if (type === "IEND") break;
  }
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

export interface DecodedText {
  text: string;
  encoding: "utf-8" | "utf-16le" | "utf-16be" | "windows-1252";
  /** Set when we had to fall back to a guess. */
  warning?: string;
}

/**
 * Decode bytes as text. Tries UTF-8 strictly first (the overwhelmingly common case), honours
 * UTF-16 BOMs, and falls back to Windows-1252 (what Excel's "CSV" export uses on Windows).
 */
export function decodeText(bytes: Uint8Array): DecodedText {
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return { text: new TextDecoder("utf-16le").decode(bytes.subarray(2)), encoding: "utf-16le" };
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return { text: new TextDecoder("utf-16be").decode(bytes.subarray(2)), encoding: "utf-16be" };
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { text: text.replace(/^﻿/, ""), encoding: "utf-8" };
  } catch {
    return {
      text: new TextDecoder("windows-1252").decode(bytes),
      encoding: "windows-1252",
      warning: "This file isn't UTF-8 encoded, so it was read as Windows-1252 (Western European). If some characters look wrong, re-save the file as “CSV UTF-8” and try again.",
    };
  }
}

export async function readTextFile(file: Blob): Promise<DecodedText> {
  return decodeText(new Uint8Array(await file.arrayBuffer()));
}

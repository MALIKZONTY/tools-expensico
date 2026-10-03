import { describe, expect, it } from "vitest";
import { detectFromBytes, looksLikeText } from "./detect";

const bytes = (...b: number[]) => new Uint8Array(b);
const text = (s: string) => new TextEncoder().encode(s);

describe("detectFromBytes", () => {
  it("detects binary formats by signature regardless of extension", () => {
    expect(detectFromBytes("x.pdf", text("%PDF-1.7\n")).format).toBe("pdf");
    expect(detectFromBytes("photo", bytes(0xff, 0xd8, 0xff, 0xe0)).format).toBe("jpg");
    expect(detectFromBytes("a.png", bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)).format).toBe("png");
    expect(detectFromBytes("a.gif", text("GIF89a......")).format).toBe("gif");
    expect(detectFromBytes("a.webp", text("RIFF\0\0\0\0WEBPVP8 ")).format).toBe("webp");
  });

  it("flags a mismatch between extension and content", () => {
    const d = detectFromBytes("invoice.pdf", bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a));
    expect(d.format).toBe("png");
    expect(d.extensionFormat).toBe("pdf");
    expect(d.mismatch).toBe(true);
  });

  it("does not treat jpg/jpeg naming as a mismatch", () => {
    expect(detectFromBytes("a.jpeg", bytes(0xff, 0xd8, 0xff, 0xdb)).mismatch).toBe(false);
  });

  it("identifies Office Open XML containers from ZIP entries", () => {
    const zip = bytes(0x50, 0x4b, 0x03, 0x04, 0, 0);
    expect(detectFromBytes("report", zip, ["[Content_Types].xml", "word/document.xml"]).format).toBe("docx");
    expect(detectFromBytes("data.zip", zip, ["[Content_Types].xml", "xl/workbook.xml"]).format).toBe("xlsx");
    expect(detectFromBytes("deck.pptx", zip, ["ppt/presentation.xml"]).format).toBe("pptx");
    expect(detectFromBytes("files.zip", zip, ["a.txt"]).format).toBe("zip");
  });

  it("uses the extension for text formats and sniffs unknown text", () => {
    expect(detectFromBytes("data.csv", text("a,b\n1,2\n")).format).toBe("csv");
    expect(detectFromBytes("data", text('{"a":1}')).format).toBe("json");
    expect(detectFromBytes("page", text("<!DOCTYPE html><html>")).format).toBe("html");
    expect(detectFromBytes("x.txt", text("<!doctype html><p>hi")).format).toBe("html");
    expect(detectFromBytes("notes", text("hello world")).format).toBe("txt");
    expect(detectFromBytes("icon.svg", text('<svg xmlns="http://www.w3.org/2000/svg">')).format).toBe("svg");
  });

  it("rejects HEIC as unsupported rather than guessing", () => {
    const heic = new Uint8Array([0, 0, 0, 0x18, ...text("ftypheic")]);
    expect(detectFromBytes("IMG_0001.HEIC", heic).format).toBeUndefined();
  });

  it("returns undefined for unknown binary data", () => {
    expect(detectFromBytes("blob.bin", bytes(0, 1, 2, 3, 0, 0, 0xff, 0x10)).format).toBeUndefined();
  });
});

describe("looksLikeText", () => {
  it("accepts UTF-8 including multi-byte characters", () => {
    expect(looksLikeText(text("नमस्ते, ₹100 — café"))).toBe(true);
  });
  it("rejects NUL bytes and invalid UTF-8", () => {
    expect(looksLikeText(bytes(0x41, 0x00, 0x42))).toBe(false);
    expect(looksLikeText(bytes(0xc3, 0x28))).toBe(false);
  });
  it("tolerates a multi-byte sequence cut off at the end of the sample", () => {
    const t = text("abc €");
    expect(looksLikeText(t.subarray(0, t.length - 1))).toBe(true);
  });
});

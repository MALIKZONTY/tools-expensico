import { describe, expect, it } from "vitest";
import { stripJpegMetadata, stripPngMetadata } from "./strip-metadata";

function seg(marker: number, payload: number[]) {
  const len = payload.length + 2;
  return [0xff, marker, len >> 8, len & 0xff, ...payload];
}
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

describe("stripJpegMetadata", () => {
  it("removes EXIF/XMP/IPTC/comments but keeps JFIF, ICC and image data", () => {
    const jpeg = new Uint8Array([
      0xff, 0xd8,
      ...seg(0xe0, ascii("JFIF\0abc")),
      ...seg(0xe1, ascii("Exif\0\0GPS-DATA")),
      ...seg(0xe2, ascii("ICC_PROFILE\0data")),
      ...seg(0xed, ascii("Photoshop 3.0")),
      ...seg(0xfe, ascii("comment")),
      ...seg(0xdb, [1, 2, 3]),
      0xff, 0xda, 0x00, 0x02, 9, 9, 9, 0xff, 0xd9,
    ]);
    const out = stripJpegMetadata(jpeg);
    const text = String.fromCharCode(...out);
    expect(text).toContain("JFIF");
    expect(text).toContain("ICC_PROFILE");
    expect(text).not.toContain("GPS-DATA");
    expect(text).not.toContain("Photoshop");
    expect(text).not.toContain("comment");
    expect([...out.slice(-5)]).toEqual([9, 9, 9, 0xff, 0xd9]);
  });
  it("rejects non-JPEG data", () => {
    expect(() => stripJpegMetadata(new Uint8Array([1, 2, 3]))).toThrow();
  });
});

describe("stripPngMetadata", () => {
  function chunk(type: string, data: number[]) {
    const len = data.length;
    return [len >>> 24, (len >> 16) & 255, (len >> 8) & 255, len & 255, ...ascii(type), ...data, 0, 0, 0, 0];
  }
  it("drops text and exif chunks", () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...chunk("IHDR", [1, 2]), ...chunk("tEXt", ascii("Author\0Asha")), ...chunk("eXIf", [5]), ...chunk("IDAT", [7, 7]), ...chunk("IEND", [])]);
    const out = String.fromCharCode(...stripPngMetadata(png));
    expect(out).toContain("IHDR");
    expect(out).toContain("IDAT");
    expect(out).not.toContain("Asha");
    expect(out).not.toContain("eXIf");
  });
});

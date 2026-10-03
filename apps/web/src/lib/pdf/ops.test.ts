import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { deletePages, extractPages, groupsEvery, mergePdfs, optimizePdf, pageCount, pageSizeName, readInfo, rotatePages, splitPdf, stripMetadata } from "./ops";

async function makePdf(pages: number, title = "Doc"): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= pages; i++) doc.addPage([595.28, 841.89]).drawText(`${title} page ${i}`, { x: 50, y: 750, font, size: 12 });
  doc.setTitle(title);
  doc.setAuthor("Tester");
  return doc.save();
}

describe("pdf ops", () => {
  it("merges documents in order", async () => {
    const merged = await mergePdfs([await makePdf(2, "A"), await makePdf(3, "B")]);
    expect(await pageCount(merged)).toBe(5);
  });
  it("extracts, deletes and splits pages", async () => {
    const src = await makePdf(6);
    expect(await pageCount(await extractPages(src, [5, 1]))).toBe(2);
    expect(await pageCount(await deletePages(src, [1, 2]))).toBe(4);
    await expect(deletePages(src, [1, 2, 3, 4, 5, 6])).rejects.toThrow(/at least one/);
    const parts = await splitPdf(src, groupsEvery(6, 4));
    expect(await Promise.all(parts.map(pageCount))).toEqual([4, 2]);
    await expect(extractPages(src, [7])).rejects.toThrow();
  });
  it("rotates relative to existing rotation", async () => {
    const out = await rotatePages(await makePdf(2), { 1: 90, 2: -90 });
    const info = await readInfo(out);
    expect(info.pageSizes.map((p) => p.rotation)).toEqual([90, 270]);
    const again = await readInfo(await rotatePages(out, { 1: 270 }));
    expect(again.pageSizes[0].rotation).toBe(0);
  });
  it("reads and strips metadata", async () => {
    const src = await makePdf(1, "Secret plan");
    expect((await readInfo(src)).title).toBe("Secret plan");
    const clean = await readInfo(await stripMetadata(src));
    expect(clean.title ?? "").toBe("");
    expect(clean.author ?? "").toBe("");
  });
  it("optimises without changing page count", async () => {
    expect(await pageCount(await optimizePdf(await makePdf(3)))).toBe(3);
  });
  it("rejects non-PDF input", async () => {
    await expect(pageCount(new TextEncoder().encode("not a pdf"))).rejects.toThrow();
  });
  it("names page sizes", () => {
    expect(pageSizeName(595.28, 841.89)).toBe("A4");
    expect(pageSizeName(792, 612)).toBe("US Letter landscape");
    expect(groupsEvery(5, 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});

/**
 * PDF page operations with pdf-lib. Byte-in, byte-out; no DOM, so they run in tests.
 */

import { PDFDocument, degrees } from "pdf-lib";
import { ToolError } from "@/lib/files/errors";

async function load(bytes: ArrayBuffer | Uint8Array): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (err) {
    const name = (err as Error)?.constructor?.name ?? "";
    const msg = (err as Error)?.message ?? "";
    if (name === "EncryptedPDFError" || /encrypted/i.test(msg)) throw new ToolError("encrypted", "This PDF is password-protected or encrypted. Remove the protection in a PDF reader and try again.");
    throw new ToolError("corrupted", "The PDF structure couldn't be read. It may be damaged or not a real PDF.");
  }
}

export async function pageCount(bytes: ArrayBuffer | Uint8Array): Promise<number> {
  return (await load(bytes)).getPageCount();
}

function finish(doc: PDFDocument): Promise<Uint8Array> {
  doc.setProducer("Expensico (pdf-lib)");
  doc.setModificationDate(new Date());
  return doc.save({ useObjectStreams: true });
}

/** Merge whole documents in order. */
export async function mergePdfs(inputs: (ArrayBuffer | Uint8Array)[], onProgress?: (i: number) => void): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  for (let i = 0; i < inputs.length; i++) {
    onProgress?.(i);
    const src = await load(inputs[i]);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  return finish(out);
}

/** New document containing the given 1-based pages, in the given order. */
export async function extractPages(bytes: ArrayBuffer | Uint8Array, pages: number[]): Promise<Uint8Array> {
  const src = await load(bytes);
  const total = src.getPageCount();
  if (!pages.length) throw new ToolError("invalid-format", "Select at least one page.");
  if (pages.some((p) => p < 1 || p > total)) throw new ToolError("invalid-format", `Pages must be between 1 and ${total}.`);
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, pages.map((p) => p - 1));
  copied.forEach((p) => out.addPage(p));
  return finish(out);
}

export async function deletePages(bytes: ArrayBuffer | Uint8Array, remove: number[]): Promise<Uint8Array> {
  const src = await load(bytes);
  const total = src.getPageCount();
  const drop = new Set(remove);
  const keep = Array.from({ length: total }, (_, i) => i + 1).filter((p) => !drop.has(p));
  if (!keep.length) throw new ToolError("invalid-format", "You can't delete every page — at least one must remain.");
  return extractPages(bytes, keep);
}

/** Rotate pages by multiples of 90°, added to their existing rotation. Keys are 1-based pages. */
export async function rotatePages(bytes: ArrayBuffer | Uint8Array, rotations: Record<number, number>): Promise<Uint8Array> {
  const doc = await load(bytes);
  doc.getPages().forEach((page, i) => {
    const add = rotations[i + 1] ?? 0;
    if (add % 360 === 0) return;
    const current = page.getRotation().angle;
    page.setRotation(degrees((((current + add) % 360) + 360) % 360));
  });
  return finish(doc);
}

/** Split into several documents; each group is a list of 1-based pages. */
export async function splitPdf(bytes: ArrayBuffer | Uint8Array, groups: number[][]): Promise<Uint8Array[]> {
  const out: Uint8Array[] = [];
  for (const g of groups) out.push(await extractPages(bytes, g));
  return out;
}

export function groupsEvery(total: number, n: number): number[][] {
  const groups: number[][] = [];
  for (let start = 1; start <= total; start += n) groups.push(Array.from({ length: Math.min(n, total - start + 1) }, (_, i) => start + i));
  return groups;
}

/** Lossless re-save: object streams, deduplicated structure. Never changes page content. */
export async function optimizePdf(bytes: ArrayBuffer | Uint8Array): Promise<Uint8Array> {
  const doc = await load(bytes);
  return doc.save({ useObjectStreams: true, addDefaultPage: false });
}

export interface PdfInfo {
  pages: number;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  created?: Date;
  modified?: Date;
  pageSizes: { width: number; height: number; rotation: number }[];
}

export async function readInfo(bytes: ArrayBuffer | Uint8Array): Promise<PdfInfo> {
  const doc = await load(bytes);
  const safe = <T,>(fn: () => T): T | undefined => {
    try {
      return fn();
    } catch {
      return undefined;
    }
  };
  return {
    pages: doc.getPageCount(),
    title: safe(() => doc.getTitle()),
    author: safe(() => doc.getAuthor()),
    subject: safe(() => doc.getSubject()),
    keywords: safe(() => doc.getKeywords()),
    creator: safe(() => doc.getCreator()),
    producer: safe(() => doc.getProducer()),
    created: safe(() => doc.getCreationDate()),
    modified: safe(() => doc.getModificationDate()),
    pageSizes: doc.getPages().map((p) => ({ ...p.getSize(), rotation: p.getRotation().angle })),
  };
}

/** Remove document-info metadata and the XMP metadata stream. */
export async function stripMetadata(bytes: ArrayBuffer | Uint8Array): Promise<Uint8Array> {
  const doc = await load(bytes);
  doc.setTitle("");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  doc.setCreator("");
  doc.setProducer("");
  const epoch = new Date(0);
  doc.setCreationDate(epoch);
  doc.setModificationDate(epoch);
  const { PDFName } = await import("pdf-lib");
  doc.catalog.delete(PDFName.of("Metadata"));
  return doc.save({ useObjectStreams: true });
}

/** Common page sizes in points for labelling. */
export function pageSizeName(w: number, h: number): string {
  const [a, b] = [Math.min(w, h), Math.max(w, h)];
  const near = (x: number, y: number) => Math.abs(a - x) < 3 && Math.abs(b - y) < 3;
  const orient = w > h ? " landscape" : "";
  if (near(595.28, 841.89)) return `A4${orient}`;
  if (near(612, 792)) return `US Letter${orient}`;
  if (near(612, 1008)) return `US Legal${orient}`;
  if (near(841.89, 1190.55)) return `A3${orient}`;
  if (near(419.53, 595.28)) return `A5${orient}`;
  return `${Math.round((w / 72) * 25.4)} × ${Math.round((h / 72) * 25.4)} mm`;
}

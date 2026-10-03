import { ToolError, toToolError } from "@/lib/files/errors";
import { stripExtension } from "@/lib/format";
import { readHead } from "@/lib/files/detect";
import { canvasToBlob, decodeImage, drawScaled } from "@/lib/image/canvas";
import { releaseCanvas } from "@/lib/pdf/pdfjs";
import type { BrowserImplementation } from "@/lib/processing/types";

const MM = 72 / 25.4;
const PAGE_SIZES = {
  a4: [595.28, 841.89],
  letter: [612, 792],
} as const;

async function jpegOrientation(file: File): Promise<number> {
  try {
    const exifr = await import("exifr");
    return (await exifr.orientation(file)) ?? 1;
  } catch {
    return 1;
  }
}

/** Fit (w, h) into (maxW, maxH) preserving aspect ratio. */
export function fitInto(w: number, h: number, maxW: number, maxH: number) {
  const s = Math.min(maxW / w, maxH / h);
  return { w: w * s, h: h * s };
}

export const imageToPdf: BrowserImplementation = async (_def, { files, options, signal, onProgress }) => {
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  pdf.setProducer("Expensico");
  pdf.setCreator("Expensico JPG to PDF");
  const pageSize = String(options.pageSize ?? "a4") as "a4" | "letter" | "fit";
  const orientation = String(options.orientation ?? "auto");
  const margin = ({ none: 0, small: 10, large: 20 } as Record<string, number>)[String(options.margin ?? "small")] * MM;
  const warnings: string[] = [];

  for (let i = 0; i < files.length; i++) {
    if (signal.aborted) throw new ToolError("cancelled");
    const file = files[i];
    onProgress({ value: i / files.length, label: `Adding image ${i + 1} of ${files.length}…` });
    try {
      const head = await readHead(file, 4);
      const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
      const isPng = head[0] === 0x89 && head[1] === 0x50;
      let embedded;
      if (isJpeg && (await jpegOrientation(file)) === 1) {
        // Embed the original JPEG bytes: no re-compression, no quality loss.
        embedded = await pdf.embedJpg(await file.arrayBuffer());
      } else if (isPng) {
        embedded = await pdf.embedPng(await file.arrayBuffer());
      } else {
        // Other formats (or rotated JPEGs) are drawn upright and stored losslessly as PNG.
        const img = await decodeImage(file);
        try {
          const canvas = drawScaled(img.source, img.width, img.height, img.width, img.height);
          try {
            const blob = await canvasToBlob(canvas, isJpeg ? "image/jpeg" : "image/png", isJpeg ? 0.95 : undefined);
            embedded = isJpeg ? await pdf.embedJpg(await blob.arrayBuffer()) : await pdf.embedPng(await blob.arrayBuffer());
          } finally {
            releaseCanvas(canvas);
          }
        } finally {
          img.close();
        }
      }

      const iw = embedded.width;
      const ih = embedded.height;
      let pw: number;
      let ph: number;
      if (pageSize === "fit") {
        // 1 image pixel = 0.75pt (96 DPI), plus margins.
        pw = iw * 0.75 + margin * 2;
        ph = ih * 0.75 + margin * 2;
      } else {
        const [a, b] = PAGE_SIZES[pageSize];
        const landscape = orientation === "landscape" || (orientation === "auto" && iw > ih);
        [pw, ph] = landscape ? [b, a] : [a, b];
      }
      const page = pdf.addPage([pw, ph]);
      const box = pageSize === "fit" ? { w: iw * 0.75, h: ih * 0.75 } : fitInto(iw, ih, pw - margin * 2, ph - margin * 2);
      page.drawImage(embedded, { x: (pw - box.w) / 2, y: (ph - box.h) / 2, width: box.w, height: box.h });
    } catch (err) {
      const e = toToolError(err);
      if (e.code === "cancelled") throw e;
      warnings.push(`“${file.name}” was skipped: ${e.detail ?? e.title}`);
    }
  }
  if (pdf.getPageCount() === 0) throw new ToolError("conversion-failed", "None of the images could be added to the PDF.");
  onProgress({ label: "Saving PDF…" });
  const bytes = await pdf.save();
  const name = files.length === 1 ? `${stripExtension(files[0].name)}.pdf` : "images.pdf";
  return {
    files: [{ name, blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), preview: "pdf", meta: `${pdf.getPageCount()} page${pdf.getPageCount() === 1 ? "" : "s"}` }],
    warnings,
  };
};

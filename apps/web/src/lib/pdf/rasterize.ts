import { ToolError } from "@/lib/files/errors";
import { canvasToBlob, openPdf, releaseCanvas, renderPage } from "./pdfjs";

/**
 * "Strong" compression: re-render every page as a JPEG and rebuild the PDF at the same
 * page sizes. Text becomes part of the image (not selectable), so callers must say so.
 */
export async function rasterizePdf(bytes: ArrayBuffer, dpi: number, quality: number, signal: AbortSignal, onProgress: (i: number, n: number) => void): Promise<Uint8Array> {
  const [{ PDFDocument }, doc] = await Promise.all([import("pdf-lib"), openPdf(bytes)]);
  try {
    const out = await PDFDocument.create();
    for (let n = 1; n <= doc.numPages; n++) {
      if (signal.aborted) throw new ToolError("cancelled");
      onProgress(n, doc.numPages);
      const page = await doc.getPage(n);
      const vp = page.getViewport({ scale: 1 }); // points, with rotation applied
      const { canvas } = await renderPage(doc, n, dpi, signal);
      try {
        const jpg = await canvasToBlob(canvas, "image/jpeg", quality);
        const img = await out.embedJpg(await jpg.arrayBuffer());
        const p = out.addPage([vp.width, vp.height]);
        p.drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height });
      } finally {
        releaseCanvas(canvas);
      }
    }
    out.setProducer("Expensico");
    return out.save({ useObjectStreams: true });
  } finally {
    void doc.loadingTask.destroy();
  }
}

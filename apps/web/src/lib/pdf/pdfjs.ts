/**
 * Lazy pdf.js loader. Only tools that need PDF parsing/rendering import this module,
 * so pages like calculators never download pdf.js.
 */

import type { PDFDocumentProxy } from "pdfjs-dist";
import { ToolError, toToolError } from "@/lib/files/errors";

type PdfJs = typeof import("pdfjs-dist");
let pdfjsPromise: Promise<PdfJs> | null = null;

export function loadPdfJs(): Promise<PdfJs> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

export async function openPdf(data: ArrayBuffer | Uint8Array, password?: string): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfJs();
  // pdf.js transfers the buffer to its worker; pass a copy so callers can reuse theirs.
  const bytes = data instanceof Uint8Array ? data.slice() : new Uint8Array(data.slice(0));
  try {
    return await pdfjs.getDocument({
      data: bytes,
      password,
      cMapUrl: "/pdfjs/cmaps/",
      cMapPacked: true,
      standardFontDataUrl: "/pdfjs/standard_fonts/",
      wasmUrl: "/pdfjs/wasm/",
      iccUrl: "/pdfjs/iccs/",
      enableXfa: false,
    }).promise;
  } catch (err) {
    throw toToolError(err);
  }
}

export async function openPdfFile(file: Blob, password?: string): Promise<PDFDocumentProxy> {
  return openPdf(await file.arrayBuffer(), password);
}

export interface RenderedPage {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

/** Largest canvas area we allow (Safari on iOS fails above ~16.7 megapixels). */
export const MAX_CANVAS_PIXELS = 16_000_000;

/** Render one page (1-based) at a given DPI onto a white canvas. */
export async function renderPage(doc: PDFDocumentProxy, pageNumber: number, dpi: number, signal?: AbortSignal): Promise<RenderedPage> {
  const page = await doc.getPage(pageNumber);
  let scale = dpi / 72;
  let viewport = page.getViewport({ scale });
  const area = viewport.width * viewport.height;
  if (area > MAX_CANVAS_PIXELS) {
    scale *= Math.sqrt(MAX_CANVAS_PIXELS / area);
    viewport = page.getViewport({ scale });
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new ToolError("browser-unsupported", "Canvas rendering isn't available in this browser.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const task = page.render({ canvas, canvasContext: ctx, viewport });
  const onAbort = () => task.cancel();
  signal?.addEventListener("abort", onAbort, { once: true });
  try {
    await task.promise;
  } catch (err) {
    if (signal?.aborted) throw new ToolError("cancelled");
    throw toToolError(err);
  } finally {
    signal?.removeEventListener("abort", onAbort);
    page.cleanup();
  }
  return { canvas, width: canvas.width, height: canvas.height };
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new ToolError("too-large", undefined, { title: "The image was too large to encode", hint: "Try a lower resolution." }));
        else if (blob.type !== type) reject(new ToolError("browser-unsupported", `Your browser can't create ${type.replace("image/", "").toUpperCase()} images.`));
        else resolve(blob);
      },
      type,
      quality,
    );
  });
}

/** Free canvas memory promptly (important on mobile). */
export function releaseCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 0;
  canvas.height = 0;
}

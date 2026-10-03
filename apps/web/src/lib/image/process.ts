import { FORMATS, type FormatId } from "@/lib/convert/formats";
import { stripExtension } from "@/lib/format";
import { canvasToBlob, decodeImage, drawScaled } from "./canvas";
import { releaseCanvas } from "@/lib/pdf/pdfjs";

export type OutFormat = "same" | "jpg" | "png" | "webp";

export interface ProcessOptions {
  format: OutFormat;
  /** 0–1, for JPG/WebP. */
  quality: number;
  /** Target size. Either exact (both set, aspect may change) or a bounding box. */
  resize?: { mode: "fit"; maxWidth: number; maxHeight: number; upscale?: boolean } | { mode: "exact"; width: number; height: number } | { mode: "scale"; percent: number };
  background?: string;
  crop?: { x: number; y: number; w: number; h: number };
}

export interface ProcessedImage {
  blob: Blob;
  name: string;
  width: number;
  height: number;
  srcWidth: number;
  srcHeight: number;
}

export function outputFormat(src: FormatId, f: OutFormat): "jpg" | "png" | "webp" {
  if (f !== "same") return f;
  if (src === "jpg" || src === "png" || src === "webp") return src;
  return "png";
}

export function targetSize(srcW: number, srcH: number, r: ProcessOptions["resize"]): { w: number; h: number } {
  if (!r) return { w: srcW, h: srcH };
  if (r.mode === "exact") return { w: Math.max(1, Math.round(r.width)), h: Math.max(1, Math.round(r.height)) };
  if (r.mode === "scale") return { w: Math.max(1, Math.round((srcW * r.percent) / 100)), h: Math.max(1, Math.round((srcH * r.percent) / 100)) };
  const s = Math.min(r.upscale ? Infinity : 1, r.maxWidth / srcW, r.maxHeight / srcH);
  return { w: Math.max(1, Math.round(srcW * s)), h: Math.max(1, Math.round(srcH * s)) };
}

export async function processImage(file: File, srcFormat: FormatId, o: ProcessOptions): Promise<ProcessedImage> {
  const img = await decodeImage(file, { isSvg: srcFormat === "svg" });
  try {
    const cw = o.crop ? o.crop.w : img.width;
    const ch = o.crop ? o.crop.h : img.height;
    const { w, h } = targetSize(cw, ch, o.resize);
    const fmt = outputFormat(srcFormat, o.format);
    const bg = fmt === "jpg" ? (o.background ?? "#ffffff") : undefined;
    const canvas = drawScaled(img.source, img.width, img.height, w, h, bg, o.crop);
    try {
      const blob = await canvasToBlob(canvas, FORMATS[fmt].mime, fmt === "png" ? undefined : o.quality);
      return { blob, name: `${stripExtension(file.name)}.${FORMATS[fmt].extensions[0]}`, width: w, height: h, srcWidth: img.width, srcHeight: img.height };
    } finally {
      releaseCanvas(canvas);
    }
  } finally {
    img.close();
  }
}

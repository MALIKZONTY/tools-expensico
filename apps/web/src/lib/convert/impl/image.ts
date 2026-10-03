import { FORMATS, type FormatId } from "@/lib/convert/formats";
import { ToolError, toToolError } from "@/lib/files/errors";
import { stripExtension } from "@/lib/format";
import { canvasToBlob, decodeImage, drawScaled } from "@/lib/image/canvas";
import { releaseCanvas } from "@/lib/pdf/pdfjs";
import type { BrowserImplementation, OutputFile } from "@/lib/processing/types";

export const imageToImage: BrowserImplementation = async (def, { files, options, signal, onProgress }) => {
  const target = FORMATS[def.to as FormatId];
  const quality = target.id === "png" ? undefined : Number(options.quality ?? 90) / 100;
  const background = target.id === "jpg" ? String(options.background ?? "#ffffff") : undefined;
  const scale = Number(options.scale ?? 1);
  const out: OutputFile[] = [];
  const warnings: string[] = [];

  for (let i = 0; i < files.length; i++) {
    if (signal.aborted) throw new ToolError("cancelled");
    const file = files[i];
    onProgress({ value: i / files.length, label: files.length > 1 ? `Converting ${i + 1} of ${files.length}…` : "Converting…" });
    try {
      const img = await decodeImage(file);
      try {
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = drawScaled(img.source, img.width, img.height, w, h, background);
        try {
          const blob = await canvasToBlob(canvas, target.mime, quality);
          out.push({ name: `${stripExtension(file.name)}.${target.extensions[0]}`, blob, preview: "image", meta: `${w} × ${h} px`, sourceSize: file.size });
        } finally {
          releaseCanvas(canvas);
        }
      } finally {
        img.close();
      }
    } catch (err) {
      const e = toToolError(err);
      if (e.code === "cancelled" || e.code === "browser-unsupported") throw e;
      if (files.length === 1) throw e;
      warnings.push(`“${file.name}” was skipped: ${e.detail ?? e.title}`);
    }
  }
  if (!out.length) throw new ToolError("conversion-failed", "None of the images could be converted.");
  if (files.some((f) => /\.gif$/i.test(f.name) || f.type === "image/gif")) warnings.push("Animated GIFs are converted using their first frame.");
  onProgress({ value: 1, label: "Done" });
  return { files: out, warnings };
};

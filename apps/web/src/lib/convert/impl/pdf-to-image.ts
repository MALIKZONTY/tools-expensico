import { FORMATS } from "@/lib/convert/formats";
import { ToolError } from "@/lib/files/errors";
import { stripExtension } from "@/lib/format";
import { parsePageRanges } from "@/lib/pdf/page-ranges";
import { canvasToBlob, openPdfFile, releaseCanvas, renderPage } from "@/lib/pdf/pdfjs";
import type { BrowserImplementation, OutputFile } from "@/lib/processing/types";

export const pdfToImage: BrowserImplementation = async (def, { files, options, signal, onProgress }) => {
  const file = files[0];
  const format = FORMATS[def.to];
  const dpi = Number(options.dpi ?? 150);
  const quality = def.to === "png" ? undefined : Number(options.quality ?? 88) / 100;

  onProgress({ label: "Opening PDF…" });
  const doc = await openPdfFile(file);
  try {
    const { pages, error } = parsePageRanges(String(options.pages ?? ""), doc.numPages);
    if (error) throw new ToolError("invalid-format", error, { title: "Check the page selection" });

    const base = stripExtension(file.name);
    const pad = String(doc.numPages).length;
    const out: OutputFile[] = [];
    for (let i = 0; i < pages.length; i++) {
      if (signal.aborted) throw new ToolError("cancelled");
      const n = pages[i];
      onProgress({ value: i / pages.length, label: `Rendering page ${n} (${i + 1} of ${pages.length})…` });
      const { canvas, width, height } = await renderPage(doc, n, dpi, signal);
      try {
        const blob = await canvasToBlob(canvas, format.mime, quality);
        out.push({
          name: pages.length === 1 && doc.numPages === 1 ? `${base}.${format.extensions[0]}` : `${base}-page-${String(n).padStart(pad, "0")}.${format.extensions[0]}`,
          blob,
          preview: "image",
          meta: `Page ${n} · ${width} × ${height} px`,
        });
      } finally {
        releaseCanvas(canvas);
      }
    }
    onProgress({ value: 1, label: "Done" });
    return { files: out, warnings: [] };
  } finally {
    void doc.loadingTask.destroy();
  }
};

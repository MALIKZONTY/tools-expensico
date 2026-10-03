"use client";

import { useRef, useState } from "react";
import { CloudUpload } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/field";
import { ToolErrorAlert } from "@/components/tool/ToolErrorAlert";
import { ToolSurface } from "@/components/tool/ToolCard";
import { ResultView } from "@/tools/converter/ResultView";
import { PdfInput } from "@/components/pdf/PdfInput";
import { pdfBlob, usePdfTask } from "@/components/pdf/run-pdf-task";
import { optimizePdf } from "@/lib/pdf/ops";
import { rasterizePdf } from "@/lib/pdf/rasterize";
import { remoteCompressPdf } from "@/lib/processing/remote-engine";
import { processorConfig } from "@/config/site";
import { formatBytes, stripExtension } from "@/lib/format";
import { cn } from "@/lib/cn";

type Mode = "lossless" | "strong" | "server";

const STRONG = {
  balanced: { dpi: 150, quality: 0.72, label: "Balanced — 150 DPI, good for reading and printing at home" },
  small: { dpi: 110, quality: 0.6, label: "Smallest — 110 DPI, for email and upload limits" },
  sharp: { dpi: 200, quality: 0.82, label: "Sharper — 200 DPI, larger files" },
};

export default function PdfCompress() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("lossless");
  const [level, setLevel] = useState<keyof typeof STRONG>("balanced");
  const [gs, setGs] = useState<"ebook" | "screen" | "printer">("ebook");
  const task = usePdfTask("pdf-compress");
  const controller = useRef<AbortController | null>(null);

  const modes: { id: Mode; title: string; body: string; badge?: string; disabled?: boolean }[] = [
    { id: "lossless", title: "Lossless optimisation", body: "Rebuilds the file structure more compactly. Nothing visible changes and text stays selectable. Savings are often modest." },
    { id: "strong", title: "Strong (re-render pages)", body: "Turns every page into a compressed image. Big savings for scans and image-heavy PDFs, but text is no longer selectable or searchable.", badge: "Text becomes image" },
    ...(processorConfig.enabled ? [{ id: "server" as Mode, title: "Server (Ghostscript)", body: "Recompresses images inside the PDF while keeping text selectable. Your file is uploaded and deleted immediately after processing.", badge: "Uploads file" }] : []),
  ];

  if (task.state.status === "done") {
    return <ToolSurface><ResultView result={task.state.result} zipName="compressed.zip" onReset={() => { task.reset(); setFile(null); }} resetLabel="Compress another PDF" /></ToolSurface>;
  }

  async function start() {
    if (!file) return;
    controller.current = new AbortController();
    const signal = controller.current.signal;
    await task.run(async (progress) => {
      const bytes = await file.arrayBuffer();
      let out: Uint8Array | Blob;
      if (mode === "lossless") {
        progress("Optimising…");
        out = await optimizePdf(bytes);
      } else if (mode === "strong") {
        const s = STRONG[level];
        out = await rasterizePdf(bytes, s.dpi, s.quality, signal, (i, n) => progress(`Compressing page ${i} of ${n}…`, (i - 1) / n));
      } else {
        out = await remoteCompressPdf(file, gs, { signal, onProgress: (p) => progress(p.label, p.value) });
      }
      const blob = out instanceof Blob ? out : pdfBlob(out);
      const warnings: string[] = [];
      if (blob.size >= file.size) {
        warnings.push(`This PDF is already well optimised — the ${mode === "lossless" ? "lossless" : "compressed"} version isn't smaller, so your original file is returned unchanged.${mode === "lossless" ? " Try Strong compression for scanned or image-heavy PDFs." : ""}`);
        return { files: [{ name: file.name, blob: file, preview: "pdf", sourceSize: file.size }], warnings };
      }
      if (mode === "strong") warnings.push("Pages were converted to images: text in this PDF can no longer be selected, searched or copied.");
      return { files: [{ name: `${stripExtension(file.name)}-compressed.pdf`, blob, preview: "pdf", sourceSize: file.size }], warnings };
    });
  }

  return (
    <ToolSurface className="flex flex-col gap-4">
      <PdfInput file={file} onFile={(f) => { setFile(f); task.reset(); }} disabled={task.state.status === "running"} />
      {file && (
        <>
          <fieldset className="grid grid-cols-1 gap-3 md:grid-cols-2" disabled={task.state.status === "running"}>
            <legend className="mb-2 text-sm font-semibold">Compression method</legend>
            {modes.map((m) => (
              <label key={m.id} className={cn("flex cursor-pointer gap-3 rounded-lg border p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring", mode === m.id ? "border-brand bg-brand-soft" : "border-border hover:bg-surface-2")}>
                <input type="radio" name="mode" value={m.id} checked={mode === m.id} onChange={() => setMode(m.id)} className="mt-1 accent-[var(--brand)]" />
                <span>
                  <span className="flex flex-wrap items-center gap-2 font-medium">
                    {m.title}
                    {m.badge && <Badge tone={m.id === "server" ? "info" : "warning"} icon={m.id === "server" ? <CloudUpload aria-hidden /> : undefined}>{m.badge}</Badge>}
                  </span>
                  <span className="mt-1 block text-sm text-muted">{m.body}</span>
                </span>
              </label>
            ))}
          </fieldset>
          {mode === "strong" && (
            <label className="flex flex-col gap-1.5 text-sm font-medium">Level
              <Select value={level} onChange={(e) => setLevel(e.target.value as keyof typeof STRONG)}>
                {Object.entries(STRONG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
            </label>
          )}
          {mode === "server" && (
            <>
              <label className="flex flex-col gap-1.5 text-sm font-medium">Quality
                <Select value={gs} onChange={(e) => setGs(e.target.value as typeof gs)}>
                  <option value="screen">Screen (72 DPI images, smallest)</option>
                  <option value="ebook">E-book (150 DPI images, recommended)</option>
                  <option value="printer">Print (300 DPI images)</option>
                </Select>
              </label>
              <Alert tone="info" title="This option uploads your file">Your PDF is sent over HTTPS to Expensico&apos;s processing server, compressed, and deleted immediately afterwards.</Alert>
            </>
          )}
          {task.state.status === "error" && <ToolErrorAlert error={task.state.error} />}
          {task.state.status === "running" ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Progress className="flex-1" label={task.state.label} value={task.state.value} />
              <Button variant="secondary" onClick={() => { controller.current?.abort(); task.reset(); }}>Cancel</Button>
            </div>
          ) : (
            <Button size="lg" className="self-start" onClick={start}>
              {mode === "server" ? "Upload and compress" : "Compress PDF"} ({formatBytes(file.size)})
            </Button>
          )}
        </>
      )}
    </ToolSurface>
  );
}

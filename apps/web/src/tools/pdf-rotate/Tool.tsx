"use client";

import { useState } from "react";
import { RotateCcw, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress, Spinner } from "@/components/ui/progress";
import { ToolErrorAlert } from "@/components/tool/ToolErrorAlert";
import { ToolSurface } from "@/components/tool/ToolCard";
import { ResultView } from "@/tools/converter/ResultView";
import { PdfInput } from "@/components/pdf/PdfInput";
import { PdfThumb } from "@/components/pdf/PdfThumb";
import { pdfBlob, usePdfTask } from "@/components/pdf/run-pdf-task";
import { usePdf } from "@/components/pdf/use-pdf";
import { rotatePages } from "@/lib/pdf/ops";
import { stripExtension } from "@/lib/format";

export default function PdfRotate() {
  const [file, setFile] = useState<File | null>(null);
  const { doc, error, loading } = usePdf(file);
  const [rot, setRot] = useState<Record<number, number>>({});
  const task = usePdfTask("pdf-rotate");
  const total = doc?.numPages ?? 0;
  const changed = Object.values(rot).filter((r) => r % 360 !== 0).length;
  const turn = (p: number, d: number) => setRot((r) => ({ ...r, [p]: ((r[p] ?? 0) + d + 360) % 360 }));
  const turnAll = (d: number) => setRot((r) => Object.fromEntries(Array.from({ length: total }, (_, i) => [i + 1, ((r[i + 1] ?? 0) + d + 360) % 360])));

  if (task.state.status === "done") {
    return <ToolSurface><ResultView result={task.state.result} zipName="rotated.zip" onReset={() => { task.reset(); setFile(null); setRot({}); }} resetLabel="Rotate another PDF" /></ToolSurface>;
  }

  return (
    <ToolSurface className="flex flex-col gap-4">
      <PdfInput file={file} onFile={(f) => { setFile(f); setRot({}); task.reset(); }} meta={total ? `${total} pages` : undefined} />
      {error && <ToolErrorAlert error={error} />}
      {loading && <Spinner label="Opening PDF" />}
      {doc && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => turnAll(-90)}><RotateCcw aria-hidden /> Rotate all left</Button>
            <Button variant="secondary" size="sm" onClick={() => turnAll(90)}><RotateCw aria-hidden /> Rotate all right</Button>
            <Button variant="ghost" size="sm" onClick={() => setRot({})} disabled={!changed}>Reset</Button>
          </div>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
            {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
              <li key={p} className="flex flex-col items-center gap-2 rounded-lg border border-border p-2">
                <PdfThumb doc={doc} page={p} width={110} rotation={rot[p] ?? 0} />
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => turn(p, -90)} aria-label={`Rotate page ${p} left`}><RotateCcw aria-hidden /></Button>
                  <span className="w-12 text-center text-xs tabular-nums text-muted">p.{p}{rot[p] ? ` · ${rot[p]}°` : ""}</span>
                  <Button variant="ghost" size="icon-sm" onClick={() => turn(p, 90)} aria-label={`Rotate page ${p} right`}><RotateCw aria-hidden /></Button>
                </div>
              </li>
            ))}
          </ul>
          {task.state.status === "error" && <ToolErrorAlert error={task.state.error} />}
          {task.state.status === "running" ? (
            <Progress label={task.state.label} />
          ) : (
            <Button size="lg" className="self-start" disabled={!changed} onClick={() => task.run(async (progress) => {
              progress("Rotating…");
              const out = await rotatePages(await file!.arrayBuffer(), rot);
              return { files: [{ name: `${stripExtension(file!.name)}-rotated.pdf`, blob: pdfBlob(out), preview: "pdf", meta: `${changed} page${changed === 1 ? "" : "s"} rotated` }], warnings: [] };
            })}>
              {changed ? `Save ${changed} rotated page${changed === 1 ? "" : "s"}` : "Rotate pages to continue"}
            </Button>
          )}
        </>
      )}
    </ToolSurface>
  );
}

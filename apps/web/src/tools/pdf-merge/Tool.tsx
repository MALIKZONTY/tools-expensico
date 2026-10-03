"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileChip } from "@/components/tool/FileChip";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolErrorAlert } from "@/components/tool/ToolErrorAlert";
import { ToolSurface } from "@/components/tool/ToolCard";
import { ResultView } from "@/tools/converter/ResultView";
import { PDF_MAX } from "@/components/pdf/PdfInput";
import { pdfBlob, usePdfTask } from "@/components/pdf/run-pdf-task";
import { mergePdfs, pageCount } from "@/lib/pdf/ops";
import { validateFile } from "@/lib/files/validate";
import { toToolError, type ToolError } from "@/lib/files/errors";

interface Item {
  file: File;
  pages: number | null;
}

export default function PdfMerge() {
  const [items, setItems] = useState<Item[]>([]);
  const [errors, setErrors] = useState<ToolError[]>([]);
  const task = usePdfTask("pdf-merge");

  async function add(files: File[]) {
    const errs: ToolError[] = [];
    const added: Item[] = [];
    for (const f of files) {
      try {
        await validateFile(f, { accept: ["pdf"], maxBytes: PDF_MAX });
        let pages: number | null = null;
        try {
          pages = await pageCount(await f.arrayBuffer());
        } catch (e) {
          throw toToolError(e);
        }
        added.push({ file: f, pages });
      } catch (e) {
        errs.push(toToolError(e));
      }
    }
    setItems((prev) => [...prev, ...added]);
    setErrors(errs);
    task.reset();
  }

  const move = (i: number, d: -1 | 1) => setItems((prev) => {
    const next = [...prev];
    const j = i + d;
    if (j < 0 || j >= next.length) return prev;
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });

  const total = items.reduce((n, i) => n + (i.pages ?? 0), 0);

  if (task.state.status === "done") {
    return <ToolSurface><ResultView result={task.state.result} zipName="merged.zip" onReset={() => { task.reset(); setItems([]); }} resetLabel="Merge more PDFs" /></ToolSurface>;
  }

  return (
    <ToolSurface className="flex flex-col gap-4">
      {items.length === 0 ? (
        <FileDropzone accept={["pdf"]} multiple maxBytes={PDF_MAX} onFiles={add} label="Choose PDF files" />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{items.length} files · {total} pages — merged in this order</h2>
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-surface-2 px-3 text-sm font-medium hover:bg-surface-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring">
              <Plus aria-hidden className="size-4" /> Add more
              <input type="file" accept=".pdf,application/pdf" multiple className="sr-only" onChange={(e) => { if (e.target.files) void add(Array.from(e.target.files)); e.target.value = ""; }} />
            </label>
          </div>
          <ol className="flex flex-col gap-2">
            {items.map((it, i) => (
              <li key={`${it.file.name}-${i}`} className="flex items-center gap-2">
                <span className="w-6 text-right text-sm tabular-nums text-muted">{i + 1}</span>
                <div className="flex flex-col">
                  <Button variant="ghost" size="icon-sm" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${it.file.name} up`}><ArrowUp aria-hidden /></Button>
                  <Button variant="ghost" size="icon-sm" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${it.file.name} down`}><ArrowDown aria-hidden /></Button>
                </div>
                <FileChip className="flex-1" file={it.file} meta={it.pages ? `${it.pages} page${it.pages === 1 ? "" : "s"}` : undefined} onRemove={() => setItems((p) => p.filter((_, j) => j !== i))} />
              </li>
            ))}
          </ol>
        </>
      )}
      {errors.map((e, i) => <ToolErrorAlert key={i} error={e} />)}
      {task.state.status === "error" && <ToolErrorAlert error={task.state.error} />}
      {task.state.status === "running" ? (
        <Progress label={task.state.label} value={task.state.value} />
      ) : (
        items.length > 0 && (
          <Button size="lg" className="self-start" disabled={items.length < 2} onClick={() => task.run(async (progress) => {
            const buffers = [];
            for (let i = 0; i < items.length; i++) {
              progress(`Reading ${items[i].file.name}…`, i / items.length / 2);
              buffers.push(await items[i].file.arrayBuffer());
            }
            const bytes = await mergePdfs(buffers, (i) => progress(`Adding file ${i + 1} of ${items.length}…`, 0.5 + i / items.length / 2));
            return { files: [{ name: "merged.pdf", blob: pdfBlob(bytes), preview: "pdf", meta: `${total} pages` }], warnings: [] };
          })}>
            {items.length < 2 ? "Add at least 2 PDFs" : `Merge ${items.length} PDFs`}
          </Button>
        )
      )}
    </ToolSurface>
  );
}

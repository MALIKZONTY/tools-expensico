"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Progress, Spinner } from "@/components/ui/progress";
import { ToolErrorAlert } from "@/components/tool/ToolErrorAlert";
import { ToolSurface } from "@/components/tool/ToolCard";
import { ResultView } from "@/tools/converter/ResultView";
import { PdfInput } from "./PdfInput";
import { PagePicker } from "./PagePicker";
import { pdfBlob, usePdfTask } from "./run-pdf-task";
import { usePdf } from "./use-pdf";
import { deletePages, extractPages } from "@/lib/pdf/ops";
import { formatPageList, parsePageRanges } from "@/lib/pdf/page-ranges";
import { stripExtension } from "@/lib/format";

/** Shared UI for "extract pages" (keep selection) and "delete pages" (remove selection). */
export function PageSelectTool({ intent }: { intent: "keep" | "remove" }) {
  const [file, setFile] = useState<File | null>(null);
  const { doc, error, loading } = usePdf(file);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [rangeText, setRangeText] = useState("");
  const [rangeError, setRangeError] = useState<string | null>(null);
  const task = usePdfTask(intent === "keep" ? "pdf-extract-pages" : "pdf-delete-pages");
  const total = doc?.numPages ?? 0;
  const count = selected.size;
  const resultPages = intent === "keep" ? count : total - count;

  if (task.state.status === "done") {
    return <ToolSurface><ResultView result={task.state.result} zipName="pages.zip" onReset={() => { task.reset(); setFile(null); setSelected(new Set()); }} resetLabel="Start again" /></ToolSurface>;
  }

  return (
    <ToolSurface className="flex flex-col gap-4">
      <PdfInput file={file} onFile={(f) => { setFile(f); setSelected(new Set()); task.reset(); }} meta={total ? `${total} pages` : undefined} disabled={task.state.status === "running"} />
      {error && <ToolErrorAlert error={error} />}
      {loading && <Spinner label="Opening PDF" />}
      {doc && (
        <>
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const r = parsePageRanges(rangeText, total);
              if (r.error) setRangeError(r.error);
              else {
                setRangeError(null);
                setSelected(new Set(r.pages));
              }
            }}
          >
            <label className="flex min-w-48 flex-1 flex-col gap-1.5 text-sm font-medium">
              {intent === "keep" ? "Pages to extract" : "Pages to delete"} — type ranges or click thumbnails
              <Input value={rangeText} onChange={(e) => setRangeText(e.target.value)} placeholder="e.g. 1-3, 8, 10-" className="font-mono" />
            </label>
            <Button type="submit" variant="secondary">Apply</Button>
          </form>
          {rangeError && <Alert tone="warning">{rangeError}</Alert>}
          <PagePicker doc={doc} selected={selected} onChange={(s) => { setSelected(s); setRangeText(formatPageList([...s]).replace(/–/g, "-")); }} intent={intent} />
          <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            {task.state.status === "running" ? (
              <Progress className="flex-1" label={task.state.label} />
            ) : (
              <>
                <p className="text-sm text-muted">
                  {count === 0 ? "No pages selected" : `${count} page${count === 1 ? "" : "s"} selected`} · result: <strong className="text-fg">{resultPages} page{resultPages === 1 ? "" : "s"}</strong>
                </p>
                <Button
                  className="ml-auto"
                  disabled={count === 0 || resultPages === 0}
                  onClick={() => task.run(async (progress) => {
                    progress("Building PDF…");
                    const bytes = await file!.arrayBuffer();
                    const pages = [...selected].sort((a, b) => a - b);
                    const out = intent === "keep" ? await extractPages(bytes, pages) : await deletePages(bytes, pages);
                    const base = stripExtension(file!.name);
                    return { files: [{ name: `${base}-${intent === "keep" ? "extracted" : "edited"}.pdf`, blob: pdfBlob(out), preview: "pdf", meta: `${resultPages} pages`, sourceSize: file!.size }], warnings: [] };
                  })}
                >
                  {intent === "keep" ? "Extract pages" : "Delete pages"}
                </Button>
              </>
            )}
          </div>
          {task.state.status === "error" && <ToolErrorAlert error={task.state.error} />}
          {intent === "remove" && resultPages === 0 && count > 0 && <Alert tone="warning">You&apos;ve selected every page. At least one page must remain.</Alert>}
        </>
      )}
    </ToolSurface>
  );
}

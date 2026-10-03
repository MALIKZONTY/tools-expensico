"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { Segmented } from "@/components/ui/segmented";
import { Alert } from "@/components/ui/alert";
import { ToolErrorAlert } from "@/components/tool/ToolErrorAlert";
import { ToolSurface } from "@/components/tool/ToolCard";
import { ResultView } from "@/tools/converter/ResultView";
import { PdfInput } from "@/components/pdf/PdfInput";
import { pdfBlob, usePdfTask } from "@/components/pdf/run-pdf-task";
import { groupsEvery, pageCount, splitPdf } from "@/lib/pdf/ops";
import { formatPageList, parsePageRanges } from "@/lib/pdf/page-ranges";
import { ToolError, toToolError } from "@/lib/files/errors";
import { stripExtension } from "@/lib/format";

type Mode = "every" | "ranges" | "single";

export default function PdfSplit() {
  const [file, setFile] = useState<File | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<ToolError | null>(null);
  const [mode, setMode] = useState<Mode>("ranges");
  const [every, setEvery] = useState(2);
  const [ranges, setRanges] = useState("1-3, 4-");
  const task = usePdfTask("pdf-split");

  const current = useRef<File | null>(null);

  function chooseFile(f: File | null) {
    current.current = f;
    setFile(f);
    setTotal(null);
    setLoadError(null);
    task.reset();
    if (!f) return;
    f.arrayBuffer()
      .then(pageCount)
      .then((n) => current.current === f && setTotal(n))
      .catch((e) => current.current === f && setLoadError(toToolError(e)));
  }

  let groups: number[][] = [];
  let groupError: string | null = null;
  if (total) {
    if (mode === "single") groups = groupsEvery(total, 1);
    else if (mode === "every") groups = groupsEvery(total, Math.max(1, Math.floor(every) || 1));
    else {
      for (const part of ranges.split(",").map((s) => s.trim()).filter(Boolean)) {
        const r = parsePageRanges(part, total, { keepOrder: true });
        if (r.error) {
          groupError = r.error;
          break;
        }
        groups.push(r.pages);
      }
      if (!groups.length && !groupError) groupError = "Enter at least one range.";
    }
  }

  if (task.state.status === "done") {
    return <ToolSurface><ResultView result={task.state.result} zipName={`${file ? stripExtension(file.name) : "split"}-split.zip`} onReset={() => chooseFile(null)} resetLabel="Split another PDF" /></ToolSurface>;
  }

  return (
    <ToolSurface className="flex flex-col gap-4">
      <PdfInput file={file} onFile={chooseFile} meta={total ? `${total} pages` : undefined} disabled={task.state.status === "running"} />
      {loadError && <ToolErrorAlert error={loadError} />}
      {total && (
        <>
          <Segmented label="How to split" value={mode} onChange={setMode} options={[{ value: "ranges", label: "By page ranges" }, { value: "every", label: "Every N pages" }, { value: "single", label: "One file per page" }]} />
          {mode === "ranges" && (
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Ranges — each comma-separated range becomes its own PDF
              <Input value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="e.g. 1-3, 4-6, 7-" className="font-mono" />
            </label>
          )}
          {mode === "every" && (
            <label className="flex items-center gap-2 text-sm font-medium">
              Split every
              <Input type="number" min={1} max={total} value={every} onChange={(e) => setEvery(Number(e.target.value))} className="w-24" />
              pages
            </label>
          )}
          {groupError ? (
            <Alert tone="warning">{groupError}</Alert>
          ) : (
            <p className="text-sm text-muted">
              Creates <strong className="text-fg">{groups.length}</strong> PDF{groups.length === 1 ? "" : "s"}
              {groups.length <= 8 && `: ${groups.map((g) => `pages ${formatPageList(g)}`).join(" · ")}`}
            </p>
          )}
          {task.state.status === "error" && <ToolErrorAlert error={task.state.error} />}
          {task.state.status === "running" ? (
            <Progress label={task.state.label} value={task.state.value} />
          ) : (
            <Button size="lg" className="self-start" disabled={Boolean(groupError) || groups.length === 0} onClick={() => task.run(async (progress) => {
              progress("Splitting…");
              const bytes = await file!.arrayBuffer();
              const parts = await splitPdf(bytes, groups);
              const base = stripExtension(file!.name);
              return {
                files: parts.map((p, i) => ({ name: `${base}-${groups[i].length === 1 ? `page-${groups[i][0]}` : `pages-${formatPageList(groups[i]).replace(/–/g, "-").replace(/, /g, "_")}`}.pdf`, blob: pdfBlob(p), preview: "pdf", meta: `${groups[i].length} page${groups[i].length === 1 ? "" : "s"}` })),
                warnings: [],
              };
            })}>
              Split PDF
            </Button>
          )}
        </>
      )}
    </ToolSurface>
  );
}

"use client";

import { useState, type ReactNode } from "react";
import { Download, FileArchive, Plus, RotateCcw, X } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { BlobImage } from "@/components/ui/blob-image";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolErrorAlert } from "@/components/tool/ToolErrorAlert";
import { validateFile } from "@/lib/files/validate";
import { toToolError, type ToolError } from "@/lib/files/errors";
import { downloadBlob, zipBlobs } from "@/lib/files/download";
import type { FormatId } from "@/lib/convert/formats";
import type { ProcessedImage } from "@/lib/image/process";
import { formatBytes } from "@/lib/format";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const ACCEPT: FormatId[] = ["jpg", "png", "webp", "gif", "bmp", "avif", "svg"];
const MAX = 60 * 1024 * 1024;

export interface BatchItem {
  id: string;
  file: File;
  format: FormatId;
  result?: ProcessedImage;
  error?: ToolError;
}

function Thumb({ blob, alt }: { blob: Blob; alt: string }) {
  return <BlobImage blob={blob} alt={alt} className="h-full w-full object-contain" />;
}

interface ImageBatchProps {
  tool: string;
  /** Settings UI. */
  settings: ReactNode;
  actionLabel: string;
  process: (item: BatchItem) => Promise<ProcessedImage>;
  /** Keep the original when the result is larger (compression). */
  keepSmaller?: boolean;
}

/** Shared multi-image workflow: add → configure → process → compare → download / ZIP. */
export function ImageBatch({ tool, settings, actionLabel, process, keepSmaller }: ImageBatchProps) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [errors, setErrors] = useState<ToolError[]>([]);
  const [running, setRunning] = useState<number | null>(null);
  const [zipping, setZipping] = useState(false);
  const done = items.length > 0 && items.every((i) => i.result || i.error);

  async function add(files: File[]) {
    const ok: BatchItem[] = [];
    const errs: ToolError[] = [];
    for (const f of files) {
      try {
        const v = await validateFile(f, { accept: ACCEPT, maxBytes: MAX });
        ok.push({ id: `${f.name}-${f.size}-${Math.random()}`, file: f, format: v.format });
      } catch (e) {
        errs.push(toToolError(e));
      }
    }
    setItems((p) => [...p.map((i) => ({ ...i, result: undefined, error: undefined })), ...ok]);
    setErrors(errs);
  }

  async function run() {
    track("conversion_started", { tool, files: items.length });
    const next: BatchItem[] = items.map((i) => ({ ...i, result: undefined, error: undefined }));
    for (let k = 0; k < next.length; k++) {
      setRunning(k);
      try {
        const r = await process(next[k]);
        const outExt = r.name.slice(r.name.lastIndexOf(".") + 1);
        // Same format and no smaller: the original is the better file.
        if (keepSmaller && outExt === next[k].format && r.blob.size >= next[k].file.size) {
          next[k].result = { ...r, blob: next[k].file, name: next[k].file.name };
        } else {
          next[k].result = r;
        }
      } catch (e) {
        next[k].error = toToolError(e);
      }
      setItems([...next]);
    }
    setRunning(null);
    track("conversion_completed", { tool, files: next.length });
  }

  const totalIn = items.reduce((n, i) => n + i.file.size, 0);
  const totalOut = items.reduce((n, i) => n + (i.result?.blob.size ?? 0), 0);

  if (!items.length) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
        <FileDropzone accept={ACCEPT} multiple maxBytes={MAX} onFiles={add} label="Choose images" />
        {errors.map((e, k) => <ToolErrorAlert key={k} error={e} />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      {settings}
      {errors.map((e, k) => <ToolErrorAlert key={k} error={e} />)}
      <div className="flex flex-wrap items-center gap-2">
        {running !== null ? (
          <Progress className="flex-1" label={`Processing ${running + 1} of ${items.length}…`} value={running / items.length} />
        ) : (
          <>
            <Button onClick={run}>{done ? "Apply again" : actionLabel}</Button>
            <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border border-border bg-surface-2 px-4 text-sm font-medium hover:bg-surface-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring">
              <Plus aria-hidden className="size-4" /> Add images
              <input type="file" multiple accept="image/*,.svg,.avif,.webp" className="sr-only" onChange={(e) => { if (e.target.files) void add(Array.from(e.target.files)); e.target.value = ""; }} />
            </label>
            {done && items.filter((i) => i.result).length > 1 && (
              <Button variant="secondary" loading={zipping} onClick={async () => {
                setZipping(true);
                try {
                  downloadBlob(await zipBlobs(items.filter((i) => i.result).map((i) => ({ name: i.result!.name, blob: i.result!.blob }))), `${tool}.zip`);
                } finally {
                  setZipping(false);
                }
              }}>
                <FileArchive aria-hidden /> Download all (ZIP)
              </Button>
            )}
            <Button variant="ghost" onClick={() => { setItems([]); setErrors([]); }}><RotateCcw aria-hidden /> Start over</Button>
          </>
        )}
      </div>
      {done && totalOut > 0 && (
        <p className="text-sm" aria-live="polite">
          Total {formatBytes(totalIn)} → <strong>{formatBytes(totalOut)}</strong>
          {totalOut < totalIn && <span className="text-success"> ({Math.round((1 - totalOut / totalIn) * 100)}% smaller)</span>}
        </p>
      )}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => {
          const r = it.result;
          const saved = r ? 1 - r.blob.size / it.file.size : 0;
          const unchanged = r && r.blob === it.file;
          return (
            <li key={it.id} className="flex flex-col gap-2 rounded-xl border border-border p-3">
              <div className="checkerboard relative h-40 overflow-hidden rounded-lg">
                <Thumb blob={r?.blob ?? it.file} alt={it.file.name} />
                {running === null && !r && (
                  <button type="button" onClick={() => setItems((p) => p.filter((x) => x.id !== it.id))} aria-label={`Remove ${it.file.name}`} className="absolute right-1.5 top-1.5 inline-flex size-8 items-center justify-center rounded-full bg-surface/90 text-muted shadow-sm hover:text-fg">
                    <X aria-hidden className="size-4" />
                  </button>
                )}
              </div>
              <p className="truncate text-sm font-medium" title={it.file.name}>{it.file.name}</p>
              <p className="text-xs text-muted">
                {formatBytes(it.file.size)}
                {r && <> → <span className="text-fg">{formatBytes(r.blob.size)}</span> · {r.width} × {r.height}</>}
                {r && !unchanged && Math.abs(saved) >= 0.005 && <span className={cn("ml-1 font-medium", saved > 0 ? "text-success" : "text-warning")}>{saved > 0 ? `−${Math.round(saved * 100)}%` : `+${Math.round(-saved * 100)}%`}</span>}
              </p>
              {unchanged && <p className="text-xs text-warning">Already smaller than any re-encoded version — original kept.</p>}
              {it.error && <Alert tone="danger" className="py-2 text-xs">{it.error.detail ?? it.error.title}</Alert>}
              {r && (
                <Button size="sm" variant="secondary" onClick={() => downloadBlob(r.blob, r.name)}>
                  <Download aria-hidden /> Download
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

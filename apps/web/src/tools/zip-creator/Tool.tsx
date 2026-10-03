"use client";

import { useState } from "react";
import { FileArchive, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { FileChip } from "@/components/tool/FileChip";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolErrorAlert } from "@/components/tool/ToolErrorAlert";
import { downloadBlob, uniqueNames } from "@/lib/files/download";
import { toToolError, type ToolError } from "@/lib/files/errors";
import { formatBytes, sanitizeFilename } from "@/lib/format";

const MAX_TOTAL = 2 * 1024 * 1024 * 1024;

export default function ZipCreator() {
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState("archive");
  const [level, setLevel] = useState(6);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<ToolError | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const total = files.reduce((n, f) => n + f.size, 0);

  async function create() {
    setError(null);
    setProgress(0);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      for (const f of uniqueNames(files.map((f) => ({ name: f.name, blob: f })))) zip.file(f.name, f.blob, { date: new Date() });
      const blob = await zip.generateAsync(
        { type: "blob", compression: level === 0 ? "STORE" : "DEFLATE", compressionOptions: { level: Math.max(1, level) } },
        (m) => setProgress(m.percent / 100),
      );
      setResult(blob);
      downloadBlob(blob, `${sanitizeFilename(name) || "archive"}.zip`);
    } catch (e) {
      setError(toToolError(e));
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      {files.length === 0 ? (
        <FileDropzone accept="any" multiple maxBytes={MAX_TOTAL} onFiles={(f) => { setFiles(f); setResult(null); }} label="Choose files" />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{files.length} files · {formatBytes(total)}</h2>
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-surface-2 px-3 text-sm font-medium hover:bg-surface-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring">
              <Plus aria-hidden className="size-4" /> Add files
              <input type="file" multiple className="sr-only" onChange={(e) => { if (e.target.files) { const add = Array.from(e.target.files); setFiles((p) => [...p, ...add]); setResult(null); } e.target.value = ""; }} />
            </label>
          </div>
          <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {files.map((f, i) => <li key={`${f.name}-${i}`}><FileChip file={f} onRemove={() => { setFiles((p) => p.filter((_, j) => j !== i)); setResult(null); }} /></li>)}
          </ul>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium">Archive name
              <div className="flex items-center gap-1"><Input value={name} onChange={(e) => setName(e.target.value)} /><span className="text-muted">.zip</span></div>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">Compression
              <Select value={level} onChange={(e) => setLevel(Number(e.target.value))}>
                <option value={0}>None (store only — fastest)</option>
                <option value={3}>Fast</option>
                <option value={6}>Normal</option>
                <option value={9}>Maximum (slowest)</option>
              </Select>
            </label>
          </div>
          {total > MAX_TOTAL && <ToolErrorAlert error={toToolError(new Error("out of memory"))} />}
          {error && <ToolErrorAlert error={error} />}
          {progress !== null ? (
            <Progress label="Creating ZIP…" value={progress} />
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={create} disabled={total > MAX_TOTAL}><FileArchive aria-hidden /> Create ZIP</Button>
              {result && <span className="text-sm text-muted">Created {formatBytes(result.size)}{result.size < total ? ` (${Math.round((1 - result.size / total) * 100)}% smaller)` : ""}.</span>}
              <Button variant="ghost" onClick={() => { setFiles([]); setResult(null); }}><RotateCcw aria-hidden /> Start over</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

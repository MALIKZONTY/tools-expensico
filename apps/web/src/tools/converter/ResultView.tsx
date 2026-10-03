"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Download, FileArchive, RotateCcw } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { BlobImage } from "@/components/ui/blob-image";
import { Button } from "@/components/ui/button";
import { downloadBlob, zipBlobs } from "@/lib/files/download";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { ConversionResult, OutputFile } from "@/lib/processing";

function TextPreview({ blob }: { blob: Blob }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    blob
      .slice(0, 200_000)
      .text()
      .then((t) => alive && setText(t));
    return () => {
      alive = false;
    };
  }, [blob]);
  const truncated = blob.size > 200_000;
  return (
    <div>
      <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-surface-2 p-3 font-mono text-[13px] leading-relaxed text-fg">
        {text ?? "Loading preview…"}
      </pre>
      {truncated && <p className="mt-1 text-xs text-muted">Preview shows the first 200 KB. The download contains everything.</p>}
    </div>
  );
}

function HtmlPreview({ blob }: { blob: Blob }) {
  const [html, setHtml] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    blob.text().then((t) => alive && setHtml(t));
    return () => {
      alive = false;
    };
  }, [blob]);
  if (html === null) return null;
  // sandbox="" disables scripts, forms, navigation and same-origin access.
  return <iframe title="HTML preview" sandbox="" srcDoc={html} className="h-96 w-full rounded-lg border border-border bg-white" />;
}

function ImagePreview({ file }: { file: OutputFile }) {
  return (
    <div className="checkerboard flex items-center justify-center overflow-hidden rounded-lg border border-border">
      <BlobImage blob={file.blob} alt={`Preview of ${file.name}`} className="max-h-80 w-auto max-w-full object-contain" />
    </div>
  );
}

function OutputCard({ file, showPreview, showDownload }: { file: OutputFile; showPreview: boolean; showDownload: boolean }) {
  const saved = file.sourceSize ? 1 - file.blob.size / file.sourceSize : undefined;
  return (
    <li className="flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-surface p-3">
      {showPreview && file.preview === "image" && <ImagePreview file={file} />}
      {showPreview && (file.preview === "text" || file.preview === "table") && <TextPreview blob={file.blob} />}
      {showPreview && file.preview === "html" && <HtmlPreview blob={file.blob} />}
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-fg" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-muted">
            {formatBytes(file.blob.size)}
            {file.meta ? ` · ${file.meta}` : ""}
            {saved !== undefined && Math.abs(saved) >= 0.005 && (
              <span className={cn("ml-1 font-medium", saved > 0 ? "text-success" : "text-warning")}>
                {saved > 0 ? `· ${Math.round(saved * 100)}% smaller` : `· ${Math.round(-saved * 100)}% larger`}
              </span>
            )}
          </p>
        </div>
        {showDownload && (
          <Button size="sm" variant="secondary" onClick={() => downloadBlob(file.blob, file.name)} aria-label={`Download ${file.name}`}>
            <Download aria-hidden />
            Download
          </Button>
        )}
      </div>
    </li>
  );
}

export function ResultView({ result, onReset, zipName, resetLabel = "Convert another file" }: { result: ConversionResult; onReset: () => void; zipName: string; resetLabel?: string }) {
  const [zipping, setZipping] = useState(false);
  const many = result.files.length > 1;
  const imageGrid = many && result.files.every((f) => f.preview === "image");
  const total = result.files.reduce((n, f) => n + f.blob.size, 0);

  async function downloadAll() {
    setZipping(true);
    try {
      downloadBlob(await zipBlobs(result.files), zipName);
    } finally {
      setZipping(false);
    }
  }

  const single = result.files.length === 1 ? result.files[0] : null;

  return (
    <section aria-labelledby="result-heading" className="flex flex-col gap-6" style={{ animation: "ex-fade-in 160ms ease-out" }}>
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-4 py-8 text-center shadow-sm sm:py-12">
        <span className="flex size-12 items-center justify-center rounded-full bg-success-soft text-success-soft-fg">
          <CheckCircle2 aria-hidden className="size-7" />
        </span>
        <div>
          <h2 id="result-heading" className="text-2xl font-bold tracking-tight text-fg sm:text-3xl" tabIndex={-1}>
            {many ? `${result.files.length} files are ready` : "Your file is ready"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {single ? `${single.name} · ` : ""}
            {formatBytes(total)}
          </p>
        </div>
        {single ? (
          <Button size="xl" className="w-full max-w-sm sm:h-16 sm:text-xl" onClick={() => downloadBlob(single.blob, single.name)}>
            <Download aria-hidden />
            Download file
          </Button>
        ) : (
          <Button size="xl" className="w-full max-w-sm sm:h-16 sm:text-xl" onClick={downloadAll} loading={zipping}>
            <FileArchive aria-hidden />
            Download all (ZIP)
          </Button>
        )}
        <Button variant="ghost" onClick={onReset}>
          <RotateCcw aria-hidden />
          {resetLabel}
        </Button>
      </div>

      {result.warnings.length > 0 && (
        <Alert tone="warning" title="Please note">
          <ul className="list-disc space-y-1 pl-4">
            {result.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </Alert>
      )}

      <ul className={cn("grid gap-3", imageGrid ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
        {result.files.map((f) => (
          <OutputCard key={f.name} file={f} showPreview={!many || imageGrid || result.files.length <= 4} showDownload={many} />
        ))}
      </ul>
    </section>
  );
}

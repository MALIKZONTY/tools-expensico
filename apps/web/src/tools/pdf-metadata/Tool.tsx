"use client";

import { useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/progress";
import { ToolErrorAlert } from "@/components/tool/ToolErrorAlert";
import { ToolSurface } from "@/components/tool/ToolCard";
import { PdfInput } from "@/components/pdf/PdfInput";
import { pdfBlob } from "@/components/pdf/run-pdf-task";
import { pageSizeName, readInfo, stripMetadata, type PdfInfo } from "@/lib/pdf/ops";
import { openPdfFile } from "@/lib/pdf/pdfjs";
import { downloadBlob } from "@/lib/files/download";
import { toToolError, type ToolError } from "@/lib/files/errors";
import { formatBytes, stripExtension } from "@/lib/format";

interface Extra {
  version?: string;
  linearized?: boolean;
  forms?: boolean;
  xmp: boolean;
}

function fmtDate(d?: Date) {
  return d && !Number.isNaN(d.getTime()) && d.getTime() > 0 ? d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

export default function PdfMetadata() {
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<PdfInfo | null>(null);
  const [extra, setExtra] = useState<Extra | null>(null);
  const [error, setError] = useState<ToolError | null>(null);
  const [busy, setBusy] = useState(false);

  const current = useRef<File | null>(null);

  function chooseFile(f: File | null) {
    current.current = f;
    setFile(f);
    setInfo(null);
    setExtra(null);
    setError(null);
    if (!f) return;
    const file = f;
    const alive = () => current.current === file;
    (async () => {
      const bytes = await file.arrayBuffer();
      const [i, doc] = await Promise.all([readInfo(bytes), openPdfFile(file)]);
      const meta = await doc.getMetadata();
      const raw = meta.info as Record<string, unknown>;
      void doc.loadingTask.destroy();
      if (!alive()) return;
      setInfo(i);
      setExtra({ version: raw.PDFFormatVersion as string | undefined, linearized: Boolean(raw.IsLinearized), forms: Boolean(raw.IsAcroFormPresent), xmp: Boolean(meta.metadata) });
    })().catch((e) => alive() && setError(toToolError(e)));
  }

  const sizes = info ? Object.entries(info.pageSizes.reduce<Record<string, number>>((acc, p) => {
    const k = pageSizeName(p.width, p.height);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {})) : [];

  const identifying = info && [info.title, info.author, info.creator, info.producer, info.subject, info.keywords].some(Boolean);

  return (
    <ToolSurface className="flex flex-col gap-4">
      <PdfInput file={file} onFile={chooseFile} />
      {error && <ToolErrorAlert error={error} />}
      {file && !info && !error && <Spinner label="Reading PDF" />}
      {info && extra && (
        <>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 rounded-lg border border-border p-4 text-sm sm:grid-cols-[11rem_1fr]">
            {(
              [
                ["Title", info.title || "—"],
                ["Author", info.author || "—"],
                ["Subject", info.subject || "—"],
                ["Keywords", info.keywords || "—"],
                ["Created with", info.creator || "—"],
                ["PDF producer", info.producer || "—"],
                ["Created", fmtDate(info.created)],
                ["Modified", fmtDate(info.modified)],
                ["PDF version", extra.version ?? "—"],
                ["Pages", String(info.pages)],
                ["Page sizes", sizes.map(([k, n]) => `${k}${sizes.length > 1 ? ` (${n})` : ""}`).join(", ")],
                ["File size", formatBytes(file!.size)],
                ["Fast web view", extra.linearized ? "Yes (linearized)" : "No"],
                ["Form fields", extra.forms ? "Yes" : "No"],
                ["XMP metadata", extra.xmp ? "Present" : "None"],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted">{k}</dt>
                <dd className="break-words text-fg">{v}</dd>
              </div>
            ))}
          </dl>
          {identifying || extra.xmp ? (
            <Alert tone="info" title="This PDF contains identifying metadata" actions={
              <Button size="sm" loading={busy} onClick={async () => {
                setBusy(true);
                try {
                  const out = await stripMetadata(await file!.arrayBuffer());
                  downloadBlob(pdfBlob(out), `${stripExtension(file!.name)}-clean.pdf`);
                } catch (e) {
                  setError(toToolError(e));
                } finally {
                  setBusy(false);
                }
              }}>
                <ShieldCheck aria-hidden /> Download without metadata
              </Button>
            }>
              Author names, software and dates can reveal who made a document and when. Removing them doesn&apos;t change any page content.
            </Alert>
          ) : (
            <Alert tone="success">No document metadata found.</Alert>
          )}
        </>
      )}
    </ToolSurface>
  );
}

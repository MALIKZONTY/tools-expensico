"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Progress } from "@/components/ui/progress";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { detectFile, readHead, type Detection } from "@/lib/files/detect";
import { FORMATS } from "@/lib/convert/formats";
import { formatBytes, getExtension } from "@/lib/format";

const MAX = 2 * 1024 * 1024 * 1024;

export default function FileInfo() {
  const [file, setFile] = useState<File | null>(null);
  const [d, setD] = useState<Detection | null>(null);
  const [hex, setHex] = useState("");
  const [sha, setSha] = useState<string | null>(null);
  const [hashing, setHashing] = useState(false);

  async function open(f: File) {
    setFile(f);
    setSha(null);
    setD(await detectFile(f));
    const head = await readHead(f, 32);
    setHex([...head].map((b) => b.toString(16).padStart(2, "0")).join(" "));
  }

  async function hash() {
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) return;
    setHashing(true);
    const buf = await file.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buf);
    setSha([...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join(""));
    setHashing(false);
  }

  if (!file) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
        <FileDropzone accept="any" maxBytes={MAX} onFiles={([f]) => open(f)} label="Choose any file" />
      </div>
    );
  }

  const ext = getExtension(file.name);
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      {d && (d.mismatch ? (
        <Alert tone="warning" title="The extension doesn't match the contents">
          The name ends in .{ext}, but the contents are {d.format ? FORMATS[d.format].label : d.description}. The file may have been renamed by mistake — or deliberately disguised. Don&apos;t open files you don&apos;t trust.
        </Alert>
      ) : d.format ? (
        <p className="flex items-center gap-2 text-sm font-medium text-success"><CheckCircle2 aria-hidden className="size-4" /> Contents match the file type.</p>
      ) : (
        <p className="flex items-center gap-2 text-sm font-medium text-warning"><AlertTriangle aria-hidden className="size-4" /> Unrecognised file type.</p>
      ))}
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 rounded-lg border border-border p-4 text-sm sm:grid-cols-[12rem_1fr]">
        {(
          [
            ["Name", file.name],
            ["Extension", ext ? `.${ext}` : "(none)"],
            ["Detected type", d?.format ? FORMATS[d.format].label : (d?.description ?? "…")],
            ["How detected", d ? { signature: "File signature (magic bytes)", container: "Container structure", text: "Text content and extension", extension: "Extension only", unknown: "Not recognised" }[d.method] : "…"],
            ["MIME type reported by browser", file.type || "(none)"],
            ["Size", `${formatBytes(file.size)} (${file.size.toLocaleString("en-IN")} bytes)`],
            ["Last modified", new Date(file.lastModified).toLocaleString("en-IN")],
            ["Text file", d ? (d.isText ? "Yes" : "No (binary)") : "…"],
            ["First 32 bytes (hex)", hex],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted">{k}</dt>
            <dd className={k.startsWith("First") ? "break-all font-mono text-xs" : "break-words"}>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap items-center gap-2">
        {sha ? (
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-surface-2 px-3 py-2">
            <span className="text-sm text-muted">SHA-256</span>
            <code className="min-w-0 flex-1 break-all font-mono text-xs">{sha}</code>
            <CopyButton value={sha} size="icon-sm" variant="ghost" label="Copy SHA-256" />
          </div>
        ) : hashing ? (
          <Progress className="flex-1" label="Calculating SHA-256…" />
        ) : (
          <Button variant="secondary" onClick={hash} disabled={file.size > 500 * 1024 * 1024}>
            {file.size > 500 * 1024 * 1024 ? "Too large to hash here (500 MB max)" : "Calculate SHA-256 checksum"}
          </Button>
        )}
        <Button variant="ghost" onClick={() => { setFile(null); setD(null); }}>Check another file</Button>
      </div>
    </div>
  );
}

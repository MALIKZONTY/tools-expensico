"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { CopyButton } from "@/components/ui/copy-button";
import { Checkbox, Input } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { Segmented } from "@/components/ui/segmented";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { FileChip } from "@/components/tool/FileChip";
import { CodeArea } from "@/components/tool/Workbench";
import { Md5 } from "@/lib/dev/md5";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/cn";

const ALGS = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
type Alg = (typeof ALGS)[number];
const MAX_FILE = 500 * 1024 * 1024;

function toHex(buf: ArrayBuffer) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashBytes(bytes: Uint8Array): Promise<Record<Alg, string>> {
  const out = {} as Record<Alg, string>;
  out.MD5 = new Md5().update(bytes).digestHex();
  for (const a of ALGS.slice(1)) out[a] = toHex(await crypto.subtle.digest(a, bytes as BufferSource));
  return out;
}

export default function HashGenerator() {
  const [mode, setMode] = useState<"text" | "file">("text");
  const [text, setText] = useState("Expensico");
  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<Record<Alg, string> | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [upper, setUpper] = useState(false);
  const [expected, setExpected] = useState("");
  const [tooBig, setTooBig] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "text") return;
    let alive = true;
    hashBytes(new TextEncoder().encode(text)).then((h) => alive && setHashes(h));
    return () => {
      alive = false;
    };
  }, [text, mode]);

  async function hashFile(f: File) {
    setFile(f);
    setHashes(null);
    setProgress(0);
    // Web Crypto has no streaming API, so SHA digests need the whole file in memory;
    // MD5 is streamed. Files are read once.
    const bytes = new Uint8Array(f.size);
    const reader = f.stream().getReader();
    let offset = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes.set(value, offset);
      offset += value.length;
      setProgress(offset / f.size / 2);
    }
    setProgress(0.6);
    const h = await hashBytes(bytes);
    setHashes(h);
    setProgress(null);
  }

  const norm = expected.trim().toLowerCase().replace(/\s+/g, "");
  const matchAlg = norm && hashes ? ALGS.find((a) => hashes[a] === norm) : undefined;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <Segmented label="Input" value={mode} onChange={(m) => { setMode(m); setHashes(null); }} options={[{ value: "text", label: "Text" }, { value: "file", label: "File" }]} />
      {mode === "text" ? (
        <CodeArea label="Text to hash" value={text} onChange={setText} minRows={5} className="whitespace-pre-wrap" />
      ) : file ? (
        <FileChip file={file} onRemove={() => { setFile(null); setHashes(null); }} />
      ) : (
        <FileDropzone accept="any" maxBytes={MAX_FILE} onFiles={([f]) => {
          if (f.size > MAX_FILE) {
            setTooBig(`${f.name} is ${formatBytes(f.size)}. The limit is ${formatBytes(MAX_FILE, 0)}.`);
            return;
          }
          setTooBig(null);
          void hashFile(f);
        }} label="Choose a file" />
      )}
      {tooBig && <Alert tone="danger" role="alert" title="File too large">{tooBig}</Alert>}
      {progress !== null && <Progress value={progress} label="Hashing…" />}
      {mode === "text" && <p className="text-xs text-muted">Text is hashed as UTF-8 bytes, exactly as typed (including trailing spaces and line breaks).</p>}

      {hashes && (
        <>
          <div className="flex justify-end">
            <Checkbox label="Uppercase" checked={upper} onChange={(e) => setUpper(e.target.checked)} />
          </div>
          <dl className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {ALGS.map((a) => (
              <div key={a} className={cn("flex flex-col gap-1 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-4", matchAlg === a && "bg-success-soft")}>
                <dt className="w-20 shrink-0 text-sm font-medium">{a}</dt>
                <dd className="flex min-w-0 flex-1 items-center gap-2">
                  <code className="min-w-0 flex-1 break-all font-mono text-[13px]">{upper ? hashes[a].toUpperCase() : hashes[a]}</code>
                  <CopyButton value={upper ? hashes[a].toUpperCase() : hashes[a]} size="icon-sm" variant="ghost" label={`Copy ${a}`} />
                </dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-1.5 border-t border-border pt-4">
            <label htmlFor="expected" className="text-sm font-semibold">Verify against a published checksum</label>
            <Input id="expected" value={expected} onChange={(e) => setExpected(e.target.value)} placeholder="Paste the expected hash" className="font-mono" />
            {norm && (matchAlg ? (
              <p className="flex items-center gap-2 text-sm font-medium text-success"><CheckCircle2 aria-hidden className="size-4" /> Matches the {matchAlg} hash.</p>
            ) : (
              <p className="flex items-center gap-2 text-sm font-medium text-danger"><XCircle aria-hidden className="size-4" /> Doesn&apos;t match any hash above.</p>
            ))}
          </div>
        </>
      )}
      {mode === "file" && !hashes && !file && <Alert tone="info">Files are hashed locally. Very large files need memory roughly equal to their size.</Alert>}
    </div>
  );
}

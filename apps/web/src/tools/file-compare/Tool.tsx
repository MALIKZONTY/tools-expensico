"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Segmented } from "@/components/ui/segmented";
import { DiffView } from "@/components/tool/DiffView";
import { FileChip } from "@/components/tool/FileChip";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { detectFile } from "@/lib/files/detect";
import { readTextFile } from "@/lib/files/text";
import { diffLines, diffSummary, type DiffOp } from "@/lib/text/diff";
import { formatBytes } from "@/lib/format";

const MAX = 500 * 1024 * 1024;

async function sha256(f: File) {
  const d = await crypto.subtle.digest("SHA-256", await f.arrayBuffer());
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function FileCompare() {
  const [a, setA] = useState<File | null>(null);
  const [b, setB] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ ha: string; hb: string; diff: DiffOp[] | null; textual: boolean } | null>(null);
  const [mode, setMode] = useState<"split" | "unified">("split");

  async function compare() {
    if (!a || !b) return;
    setBusy(true);
    const [ha, hb, da, db] = await Promise.all([sha256(a), sha256(b), detectFile(a), detectFile(b)]);
    let diff: DiffOp[] | null = null;
    const textual = da.isText && db.isText && a.size < 10 * 1024 * 1024 && b.size < 10 * 1024 * 1024;
    if (textual && ha !== hb) diff = diffLines((await readTextFile(a)).text, (await readTextFile(b)).text);
    setRes({ ha, hb, diff, textual });
    setBusy(false);
  }

  const pick = (set: (f: File) => void, label: string) => <FileDropzone accept="any" maxBytes={MAX} onFiles={([f]) => { set(f); setRes(null); }} compact label={label} />;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1.5"><span className="text-sm font-semibold">First file</span>{a ? <FileChip file={a} onRemove={() => { setA(null); setRes(null); }} /> : pick(setA, "Choose first file")}</div>
        <div className="flex flex-col gap-1.5"><span className="text-sm font-semibold">Second file</span>{b ? <FileChip file={b} onRemove={() => { setB(null); setRes(null); }} /> : pick(setB, "Choose second file")}</div>
      </div>
      {busy ? <Progress label="Comparing…" /> : <Button className="self-start" disabled={!a || !b} onClick={compare}>Compare files</Button>}
      {res && (
        <>
          {res.ha === res.hb ? (
            <Alert tone="success" title="The files are identical"><span className="flex items-center gap-2"><CheckCircle2 aria-hidden className="size-4" /> Byte-for-byte the same (matching SHA-256).</span></Alert>
          ) : (
            <Alert tone="warning" title="The files are different">
              <span className="flex items-center gap-2"><XCircle aria-hidden className="size-4" /> {a!.size === b!.size ? "Same size, different contents." : `Sizes differ: ${formatBytes(a!.size)} vs ${formatBytes(b!.size)}.`}</span>
              {!res.textual && <p className="mt-1">These aren&apos;t both small text files, so a line-by-line comparison isn&apos;t shown.</p>}
            </Alert>
          )}
          <dl className="grid gap-1 rounded-lg bg-surface-2 p-3 font-mono text-xs">
            <div className="flex gap-2"><dt className="shrink-0 text-muted">A</dt><dd className="break-all">{res.ha}</dd></div>
            <div className="flex gap-2"><dt className="shrink-0 text-muted">B</dt><dd className="break-all">{res.hb}</dd></div>
          </dl>
          {res.diff && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Segmented label="View" size="sm" value={mode} onChange={setMode} options={[{ value: "split", label: "Side by side" }, { value: "unified", label: "Inline" }]} />
                <p className="text-sm">
                  <span className="font-medium text-success">+{diffSummary(res.diff).added}</span> <span className="font-medium text-danger">−{diffSummary(res.diff).removed}</span> <span className="text-muted">lines</span>
                </p>
              </div>
              <DiffView ops={res.diff} mode={mode} />
            </>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { Workbench, CodeArea, OutputActions } from "@/components/tool/Workbench";
import { bytesToBase64, decodeBase64, encodeBase64 } from "@/lib/dev/encoding";
import { detectFromBytes } from "@/lib/files/detect";
import { FORMATS } from "@/lib/convert/formats";
import { downloadBlob } from "@/lib/files/download";
import { formatBytes } from "@/lib/format";

const MAX_FILE = 20 * 1024 * 1024;

function FileMode() {
  const [result, setResult] = useState<{ name: string; type: string; size: number; b64: string } | null>(null);
  const [dataUrl, setDataUrl] = useState(true);
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <FileDropzone
        accept="any"
        maxBytes={MAX_FILE}
        compact={Boolean(result)}
        label="Choose a file to encode"
        onFiles={async ([f]) => {
          if (f.size > MAX_FILE) return;
          const bytes = new Uint8Array(await f.arrayBuffer());
          setResult({ name: f.name, type: f.type || "application/octet-stream", size: f.size, b64: bytesToBase64(bytes) });
        }}
      />
      {result && (
        <>
          <Checkbox label="Include data URL prefix" description={`data:${result.type};base64,…`} checked={dataUrl} onChange={(e) => setDataUrl(e.target.checked)} />
          {result.type.startsWith("image/") && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`data:${result.type};base64,${result.b64}`} alt={`Preview of ${result.name}`} className="checkerboard max-h-40 w-auto self-start rounded border border-border" />
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted">
              {result.name} · {formatBytes(result.size)} → {formatBytes(result.b64.length)} of Base64 (+33%)
            </p>
            <OutputActions value={dataUrl ? `data:${result.type};base64,${result.b64}` : result.b64} fileName={`${result.name}.b64.txt`} />
          </div>
          <CodeArea label="Base64 output" readOnly value={(dataUrl ? `data:${result.type};base64,` : "") + (result.b64.length > 200_000 ? result.b64.slice(0, 200_000) + "…" : result.b64)} minRows={8} className="whitespace-pre-wrap break-all" />
          {result.b64.length > 200_000 && <p className="text-xs text-muted">Preview truncated. Copy or download to get the full value.</p>}
        </>
      )}
    </div>
  );
}

function TextMode() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [input, setInput] = useState("Expensico ₹ नमस्ते");
  const r = useMemo(() => {
    if (!input) return { out: "", error: null as string | null, binary: null as Uint8Array | null };
    try {
      if (mode === "encode") return { out: encodeBase64(input, urlSafe), error: null, binary: null };
      const d = decodeBase64(input);
      return d.isText ? { out: d.text, error: null, binary: null } : { out: "", error: null, binary: d.bytes };
    } catch (e) {
      return { out: "", error: (e as Error).message, binary: null };
    }
  }, [input, mode, urlSafe]);
  const sniff = r.binary ? detectFromBytes("decoded", r.binary.subarray(0, 4096)) : null;

  return (
    <Workbench
      inputLabel={mode === "encode" ? "Text" : "Base64"}
      outputLabel={mode === "encode" ? "Base64" : "Decoded text"}
      input={input}
      onInput={setInput}
      output={r.out}
      invalid={Boolean(r.error)}
      fileName={mode === "encode" ? "encoded.txt" : "decoded.txt"}
      toolbar={
        <>
          <Segmented label="Direction" value={mode} onChange={(m) => { setMode(m); if (r.out && !r.error) setInput(r.out); }} options={[{ value: "encode", label: "Encode" }, { value: "decode", label: "Decode" }]} />
          {mode === "encode" && <Checkbox label="URL-safe (Base64URL, no padding)" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} className="self-center" />}
        </>
      }
      status={
        r.error ? (
          <Alert tone="danger" role="alert" title="Can't decode this">{r.error}</Alert>
        ) : r.binary ? (
          <Alert tone="info" title="The decoded data is binary, not text">
            {formatBytes(r.binary.length)}{sniff?.format ? ` — looks like ${FORMATS[sniff.format].label}` : ""}.
            <div className="mt-2">
              <Button size="sm" variant="secondary" onClick={() => downloadBlob(new Blob([r.binary as BlobPart], { type: sniff?.format ? FORMATS[sniff.format].mime : "application/octet-stream" }), `decoded.${sniff?.format ? FORMATS[sniff.format].extensions[0] : "bin"}`)}>
                <Download aria-hidden /> Download file
              </Button>
            </div>
          </Alert>
        ) : null
      }
    />
  );
}

export default function Base64Tool() {
  const [tab, setTab] = useState<"text" | "file">("text");
  return (
    <div className="flex flex-col gap-4">
      <Segmented label="Input type" value={tab} onChange={setTab} options={[{ value: "text", label: "Text" }, { value: "file", label: "File → Base64" }]} />
      {tab === "text" ? <TextMode /> : <FileMode />}
    </div>
  );
}

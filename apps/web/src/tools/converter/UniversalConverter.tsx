"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CloudUpload, FileQuestion, RotateCcw } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileChip } from "@/components/tool/FileChip";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolErrorAlert } from "@/components/tool/ToolErrorAlert";
import { ToolSurface } from "@/components/tool/ToolCard";
import { convertibleInputs, targetsFor, type ConversionDef, type TargetOption } from "@/lib/convert/catalog";
import { FORMATS, type FormatId } from "@/lib/convert/formats";
import { detectFile, type Detection } from "@/lib/files/detect";
import { ToolError, toToolError } from "@/lib/files/errors";
import { formatBytes, stripExtension } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { OptionValues } from "@/lib/processing";
import { ConversionOptions } from "./ConversionOptions";
import { ConvertControls } from "./ConvertControls";
import { QualityNote } from "./QualityNote";
import { ResultView } from "./ResultView";
import { maxBytesFor } from "./limits";
import { defaultOptions, useConversionRunner } from "./use-conversion";

const MAX_ANY = 300 * 1024 * 1024;
const INPUTS = convertibleInputs();

function label(id: FormatId) {
  return FORMATS[id].label.replace(/ \(.*\)$/, "");
}

const QUALITY_TONE = { exact: "success", high: "info", basic: "warning" } as const;
const QUALITY_TEXT = { exact: "Exact", high: "High fidelity", basic: "Basic" } as const;

export default function UniversalConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [detection, setDetection] = useState<Detection | null>(null);
  const [inputError, setInputError] = useState<ToolError | null>(null);
  const [target, setTarget] = useState<TargetOption | null>(null);
  const [options, setOptions] = useState<OptionValues>({});
  const [detecting, setDetecting] = useState(false);
  const runner = useConversionRunner();

  async function onFiles(files: File[]) {
    const f = files[0];
    runner.reset();
    setTarget(null);
    setInputError(null);
    setDetection(null);
    setFile(null);
    if (f.size === 0) {
      setInputError(new ToolError("empty", `“${f.name}” is 0 bytes.`));
      return;
    }
    if (f.size > MAX_ANY) {
      setInputError(new ToolError("too-large", `“${f.name}” is ${formatBytes(f.size)}. The converter accepts files up to ${formatBytes(MAX_ANY, 0)}.`));
      return;
    }
    setDetecting(true);
    try {
      const d = await detectFile(f);
      setFile(f);
      setDetection(d);
    } catch (err) {
      setInputError(toToolError(err));
    } finally {
      setDetecting(false);
    }
  }

  function choose(t: TargetOption) {
    if (!t.available) return;
    setTarget(t);
    setOptions(defaultOptions(t.def));
    runner.reset();
  }

  function startOver() {
    runner.reset();
    setFile(null);
    setDetection(null);
    setTarget(null);
    setInputError(null);
  }

  const format = detection?.format;
  const targets = format ? targetsFor(format) : [];
  const def: ConversionDef | undefined = target?.def;
  const tooBig = file && def ? file.size > maxBytesFor(def) : false;

  if (runner.state.status === "done" && file && def) {
    return (
      <ToolSurface>
        <ResultView result={runner.state.result} onReset={startOver} zipName={`${stripExtension(file.name)}-${def.to}.zip`} />
      </ToolSurface>
    );
  }

  return (
    <ToolSurface className="flex flex-col gap-5">
      {!file ? (
        <FileDropzone
          accept={INPUTS}
          maxBytes={MAX_ANY}
          onFiles={onFiles}
          disabled={detecting}
          label="Choose a file to convert"
          hint={<>PDF, images, Excel, CSV, JSON, XML, YAML, Word, Markdown, HTML · up to {formatBytes(MAX_ANY, 0)}</>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <FileChip className="min-w-0 flex-1" file={file} meta={format ? `Detected: ${FORMATS[format].label}` : detection?.description} />
            <Button variant="ghost" size="sm" onClick={startOver} disabled={runner.state.status === "running"}>
              <RotateCcw aria-hidden />
              Choose another file
            </Button>
          </div>
          {detection?.mismatch && format && detection.extensionFormat && (
            <Alert tone="warning" title="The file name and contents don't match">
              This file is named like a {label(detection.extensionFormat)} file, but its contents are {label(format)}. We&apos;ll treat it as {label(format)}.
            </Alert>
          )}
        </div>
      )}

      {inputError && <ToolErrorAlert error={inputError} />}

      {file && !format && (
        <Alert tone="warning" title="We can't convert this type of file">
          {detection?.description ?? "Unknown format"}. Supported inputs are PDF, common images, spreadsheets, CSV, JSON, XML, YAML, Word documents, Markdown and HTML.
        </Alert>
      )}

      {file && format && targets.length === 0 && (
        <Alert tone="info" title={`No conversions for ${label(format)} yet`}>
          We don&apos;t offer a reliable conversion for this format yet. Try one of the <Link href="/tools" className="font-medium underline">file viewers</Link> instead.
        </Alert>
      )}

      {file && format && targets.length > 0 && (
        <section aria-labelledby="targets-heading">
          <h2 id="targets-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Convert {label(format)} to…
          </h2>
          <div role="radiogroup" aria-labelledby="targets-heading" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {targets.map((t) => {
              const selected = target?.to === t.to;
              return (
                <button
                  key={t.to}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={!t.available || runner.state.status === "running"}
                  onClick={() => choose(t)}
                  className={cn(
                    "flex min-h-16 flex-col items-start justify-center gap-1 rounded-lg border px-3 py-2 text-left transition-colors",
                    selected ? "border-brand bg-brand-soft ring-1 ring-brand" : "border-border bg-surface hover:border-border-strong hover:bg-surface-2",
                    !t.available && "cursor-not-allowed opacity-60 hover:bg-surface",
                  )}
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="font-semibold text-fg">{label(t.to)}</span>
                    {t.def.engine === "server" && t.available && <CloudUpload aria-label="Uploads file" className="size-4 text-info" />}
                  </span>
                  <Badge tone={QUALITY_TONE[t.def.quality]}>{QUALITY_TEXT[t.def.quality]}</Badge>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {file && def && (
        <>
          <QualityNote def={def} />
          {tooBig && <ToolErrorAlert error={new ToolError("too-large", `This conversion accepts files up to ${formatBytes(maxBytesFor(def), 0)}.`)} />}
          <ConversionOptions def={def} values={options} onChange={setOptions} disabled={runner.state.status === "running"} />
          {def.engine === "server" && (
            <Alert tone="info" title="This conversion uploads your file">
              Your file will be sent over HTTPS to Expensico&apos;s conversion server and deleted immediately after conversion.
            </Alert>
          )}
          {runner.state.status === "error" && <ToolErrorAlert error={runner.state.error} />}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ConvertControls
              state={runner.state}
              onConvert={() => runner.run(def, [file], options)}
              onCancel={runner.cancel}
              disabled={Boolean(tooBig)}
              label={`${def.engine === "server" ? "Upload and convert" : "Convert"} to ${label(def.to)}`}
            />
            {def.landing && runner.state.status !== "running" && (
              <Link href={`/convert/${def.slug}`} className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
                More about {def.title} <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            )}
          </div>
        </>
      )}

      {!file && !inputError && (
        <p className="flex items-center gap-2 text-sm text-muted">
          <FileQuestion aria-hidden className="size-4 shrink-0" />
          We detect the real file type from its contents, then show only the conversions we can do reliably.
        </p>
      )}
    </ToolSurface>
  );
}

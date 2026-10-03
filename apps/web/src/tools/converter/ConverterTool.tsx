"use client";

import { useCallback, useState } from "react";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FileChip } from "@/components/tool/FileChip";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolErrorAlert } from "@/components/tool/ToolErrorAlert";
import { ToolSurface } from "@/components/tool/ToolCard";
import { getConversion, isConversionAvailable } from "@/lib/convert/catalog";
import { FORMATS } from "@/lib/convert/formats";
import { ToolError, toToolError } from "@/lib/files/errors";
import { validateFile } from "@/lib/files/validate";
import { stripExtension } from "@/lib/format";
import type { OptionValues } from "@/lib/processing";
import { ConversionOptions } from "./ConversionOptions";
import { ConvertControls } from "./ConvertControls";
import { QualityNote } from "./QualityNote";
import { ResultView } from "./ResultView";
import { maxBytesFor } from "./limits";
import { defaultOptions, useConversionRunner } from "./use-conversion";

const MAX_FILES = 200;

export default function ConverterTool({ conversionSlug }: { conversionSlug: string }) {
  const def = getConversion(conversionSlug);
  if (!def || !isConversionAvailable(def)) {
    return <Alert tone="warning" title="This conversion isn't available yet">Please check back soon.</Alert>;
  }
  return <ConverterWorkspace key={def.slug} slug={def.slug} />;
}

function ConverterWorkspace({ slug }: { slug: string }) {
  const def = getConversion(slug)!;
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<OptionValues>(() => defaultOptions(def));
  const [inputErrors, setInputErrors] = useState<ToolError[]>([]);
  const [validating, setValidating] = useState(false);
  const runner = useConversionRunner();
  const maxBytes = maxBytesFor(def);
  const fromLabel = FORMATS[def.from].label.replace(/ \(.*\)$/, "");
  const toLabel = FORMATS[def.to].label.replace(/ \(.*\)$/, "");

  const addFiles = useCallback(
    async (incoming: File[]) => {
      setValidating(true);
      runner.reset();
      const ok: File[] = [];
      const errors: ToolError[] = [];
      for (const f of incoming) {
        try {
          await validateFile(f, { accept: def.accepts, maxBytes });
          ok.push(f);
        } catch (err) {
          errors.push(toToolError(err));
        }
      }
      setFiles((prev) => {
        const next = def.multipleInputs ? [...prev, ...ok] : ok.slice(0, 1).length ? ok.slice(0, 1) : prev;
        if (next.length > MAX_FILES) {
          errors.push(new ToolError("too-many-files", `You can convert up to ${MAX_FILES} files at once.`));
          return next.slice(0, MAX_FILES);
        }
        return next;
      });
      setInputErrors(errors);
      setValidating(false);
    },
    [def, maxBytes, runner],
  );

  const move = (i: number, dir: -1 | 1) =>
    setFiles((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const reset = () => {
    runner.reset();
    setFiles([]);
    setInputErrors([]);
  };

  const running = runner.state.status === "running";
  const ordered = def.impl === "image-to-pdf" && files.length > 1;
  const convertLabel = def.engine === "server" ? `Upload and convert to ${toLabel}` : `Convert to ${toLabel}`;

  if (runner.state.status === "done") {
    const zipName = `${files.length === 1 ? stripExtension(files[0].name) : "converted"}-${def.to}.zip`;
    return <ResultView result={runner.state.result} onReset={reset} zipName={zipName} />;
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <FileDropzone
          accept={def.accepts}
          multiple={def.multipleInputs}
          maxBytes={maxBytes}
          onFiles={addFiles}
          disabled={validating}
          label={def.multipleInputs ? `Select ${fromLabel} files` : `Select ${fromLabel} file`}
        />
        {inputErrors.map((e, i) => (
          <ToolErrorAlert key={i} error={e} />
        ))}
        <QualityNote def={def} inline />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <ToolSurface className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {files.length} file{files.length === 1 ? "" : "s"} selected{ordered ? " — pages follow this order" : ""}
          </h2>
          {def.multipleInputs && !running && (
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-surface-2 px-3 text-sm font-medium text-fg hover:bg-surface-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring">
              <Plus aria-hidden className="size-4" />
              Add more
              <input
                type="file"
                multiple
                className="sr-only"
                accept={def.accepts.flatMap((f) => FORMATS[f].extensions.map((e) => `.${e}`)).join(",")}
                onChange={(e) => {
                  if (e.target.files) void addFiles(Array.from(e.target.files));
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
        <ul className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto">
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}-${f.lastModified}-${i}`} className="flex items-center gap-2">
              {ordered && (
                <div className="flex flex-col">
                  <Button variant="ghost" size="icon-sm" onClick={() => move(i, -1)} disabled={i === 0 || running} aria-label={`Move ${f.name} up`}>
                    <ArrowUp aria-hidden />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => move(i, 1)} disabled={i === files.length - 1 || running} aria-label={`Move ${f.name} down`}>
                    <ArrowDown aria-hidden />
                  </Button>
                </div>
              )}
              <FileChip className="flex-1" file={f} onRemove={running ? undefined : () => setFiles((prev) => prev.filter((_, j) => j !== i))} />
            </li>
          ))}
        </ul>
        {inputErrors.map((e, i) => (
          <ToolErrorAlert key={i} error={e} />
        ))}
      </ToolSurface>

      <aside aria-label="Conversion settings" className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold text-fg">
          {fromLabel} to {toLabel}
        </h2>
        <QualityNote def={def} />
        <ConversionOptions def={def} values={options} onChange={setOptions} disabled={running} columns={1} />
        {def.engine === "server" && (
          <Alert tone="info" title="This conversion uploads your file">
            Your file will be sent over HTTPS to Expensico&apos;s conversion server, converted, and deleted immediately afterwards. Don&apos;t upload documents you aren&apos;t allowed to share with a third-party service.
          </Alert>
        )}
        {runner.state.status === "error" && <ToolErrorAlert error={runner.state.error} />}
        <ConvertControls state={runner.state} onConvert={() => runner.run(def, files, options)} onCancel={runner.cancel} label={convertLabel} block />
      </aside>
    </div>
  );
}

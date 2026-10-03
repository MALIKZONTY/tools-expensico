"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/progress";
import { Workbench } from "@/components/tool/Workbench";

interface FormatterToolProps {
  language: string;
  sample: string;
  fileName: string;
  mime?: string;
  accept?: string;
  /** Format the input; throw an Error with a readable message on failure. */
  format: (input: string) => Promise<string> | string;
  toolbar?: ReactNode;
  /** Re-run formatting when these change (options). */
  deps?: unknown[];
}

/** Debounced input → formatted output with readable syntax errors. Libraries load lazily inside `format`. */
export function FormatterTool({ language, sample, fileName, mime, accept, format, toolbar, deps = [] }: FormatterToolProps) {
  const [input, setInput] = useState(sample);
  // Results are tagged with the input/options they were computed from; anything else is stale.
  const key = JSON.stringify([input, ...deps]);
  const [result, setResult] = useState<{ key: string; output: string; error: string | null } | null>(null);
  const empty = !input.trim();
  const fresh = result?.key === key ? result : null;
  const output = empty ? "" : (fresh?.output ?? "");
  const error = empty ? null : (fresh?.error ?? null);
  const busy = !empty && !fresh;

  useEffect(() => {
    if (!input.trim()) return;
    let alive = true;
    const t = window.setTimeout(async () => {
      try {
        const out = await format(input);
        if (alive) setResult({ key, output: out, error: null });
      } catch (e) {
        if (alive) setResult({ key, output: "", error: cleanError(e) });
      }
    }, 250);
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
    // `format` is recreated on every render by callers; `key` captures every input it depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <Workbench
      inputLabel={`${language} input`}
      outputLabel={`Formatted ${language}`}
      input={input}
      onInput={setInput}
      output={output}
      invalid={Boolean(error)}
      fileName={fileName}
      mime={mime}
      inputAccept={accept}
      toolbar={
        <>
          {toolbar}
          {busy && <Spinner className="ml-auto" label="Formatting" />}
        </>
      }
      status={error ? <Alert tone="danger" role="alert" title={`Couldn't format this ${language}`}><pre className="whitespace-pre-wrap font-mono text-xs">{error}</pre></Alert> : null}
    />
  );
}

/** Strip ANSI codes and excessive code frames from parser errors. */
function cleanError(e: unknown): string {
  const msg = (e instanceof Error ? e.message : String(e)).replace(/\u001b\[[0-9;]*m/g, "");
  const lines = msg.split("\n");
  return lines.slice(0, 8).join("\n");
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ConversionDef } from "@/lib/convert/catalog";
import { ToolError, toToolError } from "@/lib/files/errors";
import { runConversion, type ConversionResult, type OptionValues, type ProgressUpdate } from "@/lib/processing";
import { sizeBucket, track } from "@/lib/analytics";

export type RunnerState =
  | { status: "idle" }
  | { status: "running"; progress: ProgressUpdate }
  | { status: "done"; result: ConversionResult; ms: number }
  | { status: "error"; error: ToolError };

export function useConversionRunner() {
  const [state, setState] = useState<RunnerState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const run = useCallback(async (def: ConversionDef, files: File[], options: OptionValues) => {
    controller.current?.abort();
    const ac = new AbortController();
    controller.current = ac;
    const started = performance.now();
    setState({ status: "running", progress: { label: "Starting…" } });
    track("conversion_started", { conversion: def.slug, engine: def.engine, files: files.length, size: sizeBucket(files.reduce((n, f) => n + f.size, 0)) });
    try {
      const result = await runConversion(def, {
        files,
        options,
        signal: ac.signal,
        onProgress: (progress) => {
          if (!ac.signal.aborted) setState({ status: "running", progress });
        },
      });
      if (ac.signal.aborted) return;
      const ms = performance.now() - started;
      setState({ status: "done", result, ms });
      track("conversion_completed", { conversion: def.slug, engine: def.engine, outputs: result.files.length, seconds: Math.round(ms / 100) / 10 });
    } catch (err) {
      const error = toToolError(err);
      if (error.code === "cancelled") {
        setState({ status: "idle" });
        return;
      }
      setState({ status: "error", error });
      track("tool_error", { conversion: def.slug, code: error.code });
    }
  }, []);

  const cancel = useCallback(() => {
    controller.current?.abort();
    setState({ status: "idle" });
  }, []);

  const reset = useCallback(() => {
    controller.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, run, cancel, reset };
}

export function defaultOptions(def: ConversionDef): OptionValues {
  return Object.fromEntries((def.options ?? []).map((o) => [o.id, o.default]));
}

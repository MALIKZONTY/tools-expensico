"use client";

import { useCallback, useState } from "react";
import { ToolError, toToolError } from "@/lib/files/errors";
import type { ConversionResult } from "@/lib/processing";
import { track } from "@/lib/analytics";

export type TaskState = { status: "idle" } | { status: "running"; label: string; value?: number } | { status: "done"; result: ConversionResult } | { status: "error"; error: ToolError };

/** Small state machine shared by the PDF page tools. */
export function usePdfTask(tool: string) {
  const [state, setState] = useState<TaskState>({ status: "idle" });
  const run = useCallback(
    async (fn: (progress: (label: string, value?: number) => void) => Promise<ConversionResult>) => {
      setState({ status: "running", label: "Working…" });
      track("conversion_started", { tool });
      try {
        const result = await fn((label, value) => setState({ status: "running", label, value }));
        setState({ status: "done", result });
        track("conversion_completed", { tool, outputs: result.files.length });
      } catch (e) {
        const error = toToolError(e);
        setState({ status: "error", error });
        track("tool_error", { tool, code: error.code });
      }
    },
    [tool],
  );
  const reset = useCallback(() => setState({ status: "idle" }), []);
  return { state, run, reset };
}

export const pdfBlob = (bytes: Uint8Array) => new Blob([bytes as BlobPart], { type: "application/pdf" });

"use client";

import { useCallback, useState } from "react";
import type { FormatId } from "@/lib/convert/formats";
import { toToolError, type ToolError } from "@/lib/files/errors";
import { validateFile } from "@/lib/files/validate";
import { sizeBucket, track } from "@/lib/analytics";

/** Validate-then-load flow for single-file viewers. `load` turns the file into displayable data. */
export function useSingleFile<T>(tool: string, accept: FormatId[], maxBytes: number, load: (file: File, format: FormatId) => Promise<T>) {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ToolError | null>(null);
  const [loading, setLoading] = useState(false);

  const open = useCallback(
    async (f: File) => {
      setError(null);
      setData(null);
      setLoading(true);
      try {
        const v = await validateFile(f, { accept, maxBytes });
        setFile(f);
        setData(await load(f, v.format));
        track("conversion_completed", { tool, size: sizeBucket(f.size) });
      } catch (e) {
        const err = toToolError(e);
        setError(err);
        setFile(null);
        track("tool_error", { tool, code: err.code });
      } finally {
        setLoading(false);
      }
    },
    [accept, maxBytes, load, tool],
  );

  const reset = useCallback(() => {
    setFile(null);
    setData(null);
    setError(null);
  }, []);

  return { file, data, error, loading, open, reset };
}

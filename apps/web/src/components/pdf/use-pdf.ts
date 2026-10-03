"use client";

import { useEffect, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { openPdfFile } from "@/lib/pdf/pdfjs";
import { ToolError, toToolError } from "@/lib/files/errors";

/** Open a PDF with pdf.js for previews. Destroys the document when the file changes. */
export function usePdf(file: File | null) {
  // Results are keyed by the file they belong to, so a new file never shows stale state.
  const [state, setState] = useState<{ file: File; doc: PDFDocumentProxy | null; error: ToolError | null } | null>(null);

  useEffect(() => {
    if (!file) return;
    let alive = true;
    let opened: PDFDocumentProxy | null = null;
    openPdfFile(file)
      .then((d) => {
        opened = d;
        if (alive) setState({ file, doc: d, error: null });
        else void d.loadingTask.destroy();
      })
      .catch((e) => alive && setState({ file, doc: null, error: toToolError(e) }));
    return () => {
      alive = false;
      if (opened) void opened.loadingTask.destroy();
    };
  }, [file]);

  const current = state && state.file === file ? state : null;
  return { doc: current?.doc ?? null, error: current?.error ?? null, loading: Boolean(file) && !current };
}

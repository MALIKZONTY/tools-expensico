"use client";

import { useCallback } from "react";
import { Alert } from "@/components/ui/alert";
import { OutputActions } from "@/components/tool/Workbench";
import { ViewerShell } from "@/components/tool/TextFileViewerShell";
import { useSingleFile } from "@/components/tool/use-single-file";
import { docxToSafeHtml } from "@/lib/convert/impl/documents";
import { htmlToPlainText } from "@/lib/html/sanitize";
import { words } from "@/lib/text/stats";

const MAX = 50 * 1024 * 1024;

export default function DocxViewer() {
  const load = useCallback(async (file: File) => {
    const r = await docxToSafeHtml(file, true);
    const text = htmlToPlainText(r.html);
    return { ...r, text, words: words(text).length };
  }, []);
  const s = useSingleFile("docx-viewer", ["docx"], MAX, load);

  return (
    <ViewerShell accept={["docx"]} maxBytes={MAX} label="Choose a Word document" file={s.file} loading={s.loading} error={s.error} onFile={s.open} onReset={s.reset} meta={s.data ? `${s.data.words.toLocaleString("en-IN")} words` : undefined}>
      {s.data && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted">Showing content and structure; page layout, fonts and headers/footers are simplified.</p>
            <OutputActions value={s.data.text} fileName={(s.file?.name ?? "document").replace(/\.docx$/i, "") + ".txt"} />
          </div>
          {s.data.warnings.length > 0 && <Alert tone="info">{s.data.warnings[0]}</Alert>}
          <article className="prose-ex mx-auto w-full max-w-3xl rounded-lg border border-border bg-bg px-5 py-6 sm:px-10 sm:py-10 [&_img]:h-auto [&_img]:max-w-full" dangerouslySetInnerHTML={{ __html: s.data.html || "<p><em>This document has no text content.</em></p>" }} />
        </>
      )}
    </ViewerShell>
  );
}

"use client";

import { useCallback, useState } from "react";
import { Segmented } from "@/components/ui/segmented";
import { CodeArea, OutputActions } from "@/components/tool/Workbench";
import { ViewerShell } from "@/components/tool/TextFileViewerShell";
import { useSingleFile } from "@/components/tool/use-single-file";
import { markdownToSafeHtml } from "@/lib/html/sanitize";
import { readTextFile } from "@/lib/files/text";

const MAX = 20 * 1024 * 1024;

export default function MarkdownViewer() {
  const [view, setView] = useState<"rendered" | "source">("rendered");
  const load = useCallback(async (file: File) => {
    const { text } = await readTextFile(file);
    return { text, html: await markdownToSafeHtml(text) };
  }, []);
  const s = useSingleFile("markdown-viewer", ["md", "txt"], MAX, load);

  return (
    <ViewerShell accept={["md", "txt"]} maxBytes={MAX} label="Choose a Markdown file" file={s.file} loading={s.loading} error={s.error} onFile={s.open} onReset={s.reset}>
      {s.data && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Segmented label="View" size="sm" value={view} onChange={setView} options={[{ value: "rendered", label: "Rendered" }, { value: "source", label: "Source" }]} />
            <OutputActions value={view === "rendered" ? s.data.html : s.data.text} fileName={view === "rendered" ? "document.html" : s.file?.name ?? "document.md"} />
          </div>
          {view === "rendered" ? (
            <article className="prose-ex mx-auto w-full max-w-3xl rounded-lg border border-border bg-bg px-5 py-6 sm:px-8" dangerouslySetInnerHTML={{ __html: s.data.html }} />
          ) : (
            <CodeArea label="Markdown source" value={s.data.text} readOnly minRows={24} className="whitespace-pre-wrap" />
          )}
        </>
      )}
    </ViewerShell>
  );
}

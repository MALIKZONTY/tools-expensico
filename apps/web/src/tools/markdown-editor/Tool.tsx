"use client";

import { useDeferredValue, useEffect, useRef, useState } from "react";
import { Bold, Code, Download, Heading2, Italic, Link2, List, ListChecks, ListOrdered, Quote, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Segmented } from "@/components/ui/segmented";
import { SaveStatus } from "@/components/tool/SaveStatus";
import { useKv } from "@/lib/storage/use-kv";
import { downloadText } from "@/lib/files/download";
import { markdownToSafeHtml } from "@/lib/html/sanitize";
import { htmlDocument } from "@/lib/convert/table";
import { words } from "@/lib/text/stats";
import { cn } from "@/lib/cn";

const STARTER = `# Meeting notes

**Date:** 3 October 2026

## Agenda
1. Budget review
2. Launch plan

## Action items
- [x] Share the draft
- [ ] Confirm the venue

| Owner | Task | Due |
| --- | --- | --- |
| Asha | Slides | Fri |

> Markdown keeps your notes readable as plain text.
`;

type Wrap = { before: string; after?: string; line?: boolean; placeholder?: string };

const ACTIONS: { label: string; icon: React.ReactNode; wrap: Wrap; keys?: string }[] = [
  { label: "Bold", icon: <Bold aria-hidden />, wrap: { before: "**", after: "**", placeholder: "bold text" }, keys: "b" },
  { label: "Italic", icon: <Italic aria-hidden />, wrap: { before: "_", after: "_", placeholder: "italic text" }, keys: "i" },
  { label: "Heading", icon: <Heading2 aria-hidden />, wrap: { before: "## ", line: true, placeholder: "Heading" } },
  { label: "Link", icon: <Link2 aria-hidden />, wrap: { before: "[", after: "](https://)", placeholder: "link text" }, keys: "k" },
  { label: "Quote", icon: <Quote aria-hidden />, wrap: { before: "> ", line: true } },
  { label: "Code", icon: <Code aria-hidden />, wrap: { before: "`", after: "`", placeholder: "code" } },
  { label: "Bulleted list", icon: <List aria-hidden />, wrap: { before: "- ", line: true } },
  { label: "Numbered list", icon: <ListOrdered aria-hidden />, wrap: { before: "1. ", line: true } },
  { label: "Task list", icon: <ListChecks aria-hidden />, wrap: { before: "- [ ] ", line: true } },
  { label: "Table", icon: <Table aria-hidden />, wrap: { before: "\n| Column | Column |\n| --- | --- |\n| Cell | Cell |\n", line: false } },
];

export default function MarkdownEditor() {
  const [md, setMd, status, savedAt] = useKv("markdown-editor", STARTER);
  const [view, setView] = useState<"split" | "write" | "preview">("split");
  const [html, setHtml] = useState("");
  const deferred = useDeferredValue(md);
  const ta = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let alive = true;
    markdownToSafeHtml(deferred).then((h) => alive && setHtml(h));
    return () => {
      alive = false;
    };
  }, [deferred]);

  function apply(w: Wrap) {
    const el = ta.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const selected = value.slice(s, e) || w.placeholder || "";
    let insert: string;
    if (w.line) {
      const lines = (value.slice(s, e) || w.placeholder || "").split("\n");
      insert = lines.map((l) => w.before + l).join("\n");
      const atLineStart = s === 0 || value[s - 1] === "\n";
      if (!atLineStart) insert = "\n" + insert;
    } else {
      insert = w.before + selected + (w.after ?? "");
    }
    const next = value.slice(0, s) + insert + value.slice(e);
    setMd(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = w.line ? s + insert.length : s + w.before.length;
      el.setSelectionRange(pos, w.line ? pos : pos + selected.length);
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div role="toolbar" aria-label="Formatting" className="flex flex-wrap gap-0.5">
          {ACTIONS.map((a) => (
            <Button key={a.label} variant="ghost" size="icon-sm" title={a.keys ? `${a.label} (Ctrl/⌘+${a.keys.toUpperCase()})` : a.label} aria-label={a.label} onClick={() => apply(a.wrap)} disabled={view === "preview"}>
              {a.icon}
            </Button>
          ))}
        </div>
        <Segmented className="ml-auto" label="View" size="sm" value={view} onChange={setView} options={[{ value: "write", label: "Write" }, { value: "split", label: "Split" }, { value: "preview", label: "Preview" }]} />
      </div>
      <div className={cn("grid gap-3", view === "split" && "lg:grid-cols-2")}>
        {view !== "preview" && (
          <textarea
            ref={ta}
            aria-label="Markdown"
            value={md}
            onChange={(e) => setMd(e.target.value)}
            onKeyDown={(e) => {
              if (!(e.metaKey || e.ctrlKey)) return;
              const a = ACTIONS.find((x) => x.keys === e.key.toLowerCase());
              if (a) {
                e.preventDefault();
                apply(a.wrap);
              }
            }}
            spellCheck
            className="min-h-[60vh] w-full resize-y rounded-lg border border-border bg-bg px-4 py-3 font-mono text-[14px] leading-relaxed text-fg focus-visible:outline-2 focus-visible:outline-ring"
          />
        )}
        {view !== "write" && (
          <div className={cn("prose-ex min-h-[60vh] max-w-none overflow-auto rounded-lg border border-border bg-bg px-5 py-4", view === "preview" && "mx-auto w-full max-w-3xl")} aria-label="Preview" dangerouslySetInnerHTML={{ __html: html }} />
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SaveStatus status={status} savedAt={savedAt} />
        <div className="flex flex-wrap items-center gap-1">
          <span className="mr-2 text-sm text-muted">{words(md).length.toLocaleString("en-IN")} words</span>
          <CopyButton value={md} variant="ghost" label="Copy Markdown" />
          <Button variant="ghost" size="sm" onClick={() => downloadText(md, "document.md", "text/markdown;charset=utf-8")}>
            <Download aria-hidden /> .md
          </Button>
          <Button variant="ghost" size="sm" onClick={() => downloadText(htmlDocument("Document", `<article>\n${html}\n</article>`), "document.html", "text/html;charset=utf-8")}>
            <Download aria-hidden /> .html
          </Button>
        </div>
      </div>
    </div>
  );
}

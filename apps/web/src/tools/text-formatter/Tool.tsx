"use client";

import { useState } from "react";
import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeArea, InputActions, OutputActions } from "@/components/tool/Workbench";
import { cleanText, type CleanOp } from "@/lib/text/transform";

const GROUPS: { title: string; ops: { op: CleanOp; label: string }[] }[] = [
  { title: "Whitespace", ops: [{ op: "trim-lines", label: "Trim each line" }, { op: "collapse-spaces", label: "Collapse extra spaces" }, { op: "remove-blank-lines", label: "Remove blank lines" }, { op: "remove-line-breaks", label: "Remove line breaks (keep paragraphs)" }] },
  { title: "Lines", ops: [{ op: "dedupe-lines", label: "Remove duplicate lines" }, { op: "sort-asc", label: "Sort A → Z" }, { op: "sort-desc", label: "Sort Z → A" }, { op: "sort-natural", label: "Natural sort (1, 2, 10)" }, { op: "reverse-lines", label: "Reverse order" }, { op: "shuffle-lines", label: "Shuffle" }, { op: "add-line-numbers", label: "Add line numbers" }, { op: "remove-line-numbers", label: "Remove line numbers" }] },
  { title: "Characters", ops: [{ op: "smart-to-straight-quotes", label: "Smart quotes → straight" }, { op: "remove-punctuation", label: "Remove punctuation" }, { op: "strip-non-ascii", label: "Remove non-ASCII characters" }] },
];

export default function TextFormatter() {
  const [text, setText] = useState("  banana\napple  \n\n\napple\nCherry   pie\n  10 grapes\n2 grapes");
  const [history, setHistory] = useState<string[]>([]);

  function apply(op: CleanOp) {
    setHistory((h) => [...h.slice(-19), text]);
    setText(cleanText(text, op));
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <div className="flex flex-col gap-5">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{g.title}</h2>
            <div className="flex flex-wrap gap-1.5 lg:flex-col lg:items-stretch">
              {g.ops.map((o) => (
                <Button key={o.op} variant="secondary" size="sm" className="justify-start" onClick={() => apply(o.op)} disabled={!text}>
                  {o.label}
                </Button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-border bg-surface p-3 shadow-sm sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="tf" className="text-sm font-semibold">Text</label>
          <div className="flex flex-wrap gap-1">
            <Button variant="ghost" size="sm" disabled={!history.length} onClick={() => { setText(history[history.length - 1]); setHistory((h) => h.slice(0, -1)); }}>
              <Undo2 aria-hidden /> Undo
            </Button>
            <InputActions onText={(t) => { setHistory((h) => [...h, text]); setText(t); }} onClear={() => { setHistory((h) => [...h, text]); setText(""); }} accept=".txt,.csv,.md,text/plain" />
            <OutputActions value={text} fileName="cleaned.txt" />
          </div>
        </div>
        <CodeArea id="tf" label="Text" value={text} onChange={setText} minRows={20} />
        <p className="text-xs text-muted">Operations apply to the text in place. Use Undo to step back (up to 20 steps).</p>
      </div>
    </div>
  );
}

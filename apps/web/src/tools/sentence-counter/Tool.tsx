"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Stat } from "@/components/tool/ToolCard";
import { CodeArea, InputActions } from "@/components/tool/Workbench";
import { Input } from "@/components/ui/field";
import { useStoredState } from "@/hooks/use-stored-state";
import { fleschReadingEase, readingLabel, sentences, words } from "@/lib/text/stats";
import { cn } from "@/lib/cn";

export default function SentenceCounter() {
  const [text, setText] = useStoredState("sentence-counter", "");
  const [limit, setLimit] = useState(25);
  const t = useDeferredValue(text);
  const list = useMemo(() => sentences(t).map((s) => ({ s, n: words(s).length })), [t]);
  const total = list.reduce((n, x) => n + x.n, 0);
  const avg = list.length ? total / list.length : 0;
  const long = list.filter((x) => x.n > limit);
  const score = useMemo(() => fleschReadingEase(t), [t]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 shadow-sm sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="sc" className="text-sm font-semibold">Your text</label>
          <InputActions onText={setText} onClear={() => setText("")} accept=".txt,.md,text/plain" />
        </div>
        <CodeArea id="sc" label="Your text" value={text} onChange={setText} placeholder="Paste a paragraph, essay or article…" minRows={10} className="whitespace-pre-wrap font-sans text-[15px]" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-live="polite">
        <Stat emphasis label="Sentences" value={list.length.toLocaleString("en-IN")} />
        <Stat label="Average length" value={`${avg.toFixed(1)} words`} />
        <Stat label="Long sentences" value={long.length.toLocaleString("en-IN")} sub={`over ${limit} words`} />
        <Stat label="Readability" value={score === null ? "—" : Math.round(score).toString()} sub={score === null ? "needs more English text" : readingLabel(score)} />
      </div>
      {list.length > 0 && (
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6" aria-labelledby="sl-h">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="sl-h" className="text-lg font-semibold">Sentences by length</h2>
            <label className="flex items-center gap-2 text-sm">
              Highlight sentences longer than
              <Input type="number" min={5} max={100} value={limit} onChange={(e) => setLimit(Math.max(5, Number(e.target.value) || 25))} className="h-9 w-20" />
              words
            </label>
          </div>
          <ol className="flex flex-col gap-1.5">
            {list.map((x, i) => (
              <li key={i} className={cn("flex gap-3 rounded-lg px-3 py-2 text-sm", x.n > limit ? "bg-warning-soft text-warning-soft-fg" : "bg-surface-2")}>
                <span className="w-14 shrink-0 tabular-nums text-xs leading-5 opacity-80">{x.n} words</span>
                <span>{x.s}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

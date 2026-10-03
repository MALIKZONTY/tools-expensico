"use client";

import { useDeferredValue, useMemo } from "react";
import { Stat } from "@/components/tool/ToolCard";
import { CodeArea, InputActions } from "@/components/tool/Workbench";
import { useStoredState } from "@/hooks/use-stored-state";
import { textStats, topKeywords } from "@/lib/text/stats";

function mins(m: number) {
  if (m < 1) return `${Math.max(0, Math.round(m * 60))} sec`;
  return `${Math.floor(m)} min ${Math.round((m % 1) * 60)} sec`;
}

export default function WordCounter() {
  const [text, setText] = useStoredState("word-counter", "");
  const deferred = useDeferredValue(text);
  const s = useMemo(() => textStats(deferred), [deferred]);
  const keywords = useMemo(() => topKeywords(deferred, 8), [deferred]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 shadow-sm sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="wc" className="text-sm font-semibold">Your text</label>
          <InputActions onText={setText} onClear={() => setText("")} accept=".txt,.md,text/plain" />
        </div>
        <CodeArea id="wc" label="Your text" value={text} onChange={setText} placeholder="Type or paste your text here…" minRows={18} className="whitespace-pre-wrap font-sans text-[15px]" />
      </div>
      <aside className="flex flex-col gap-3" aria-live="polite">
        <div className="grid grid-cols-2 gap-3">
          <Stat emphasis label="Words" value={s.words.toLocaleString("en-IN")} className="col-span-2" />
          <Stat label="Characters" value={s.characters.toLocaleString("en-IN")} />
          <Stat label="Without spaces" value={s.charactersNoSpaces.toLocaleString("en-IN")} />
          <Stat label="Sentences" value={s.sentences.toLocaleString("en-IN")} />
          <Stat label="Paragraphs" value={s.paragraphs.toLocaleString("en-IN")} />
          <Stat label="Reading time" value={mins(s.readingMinutes)} sub="at 238 wpm" />
          <Stat label="Speaking time" value={mins(s.speakingMinutes)} sub="at 140 wpm" />
        </div>
        {keywords.length > 0 && (
          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold">Top keywords</h2>
            <ol className="mt-2 flex flex-col gap-1 text-sm">
              {keywords.map((k) => (
                <li key={k.word} className="flex items-center justify-between gap-2">
                  <span className="truncate">{k.word}</span>
                  <span className="tabular-nums text-muted">
                    {k.count} · {((k.count / Math.max(1, s.words)) * 100).toFixed(1)}%
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
        <p className="text-xs text-muted">Your text stays in this browser and is remembered until you clear it.</p>
      </aside>
    </div>
  );
}

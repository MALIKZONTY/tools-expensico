"use client";

import { useDeferredValue, useMemo } from "react";
import { CodeArea, InputActions } from "@/components/tool/Workbench";
import { Stat } from "@/components/tool/ToolCard";
import { useStoredState } from "@/hooks/use-stored-state";
import { graphemeCount, smsSegments, words } from "@/lib/text/stats";
import { cn } from "@/lib/cn";

const LIMITS = [
  { name: "X / Twitter post", max: 280 },
  { name: "SMS (one message)", max: 160, sms: true },
  { name: "Meta description (Google)", max: 160 },
  { name: "Page title (Google)", max: 60 },
  { name: "Instagram caption", max: 2200 },
  { name: "LinkedIn post", max: 3000 },
  { name: "YouTube title", max: 100 },
  { name: "WhatsApp status text", max: 700 },
];

export default function CharacterCounter() {
  const [text, setText] = useStoredState("char-counter", "");
  const t = useDeferredValue(text);
  const chars = useMemo(() => graphemeCount(t), [t]);
  const noSpace = useMemo(() => graphemeCount(t.replace(/\s/g, "")), [t]);
  const sms = useMemo(() => smsSegments(t), [t]);
  const bytes = useMemo(() => new TextEncoder().encode(t).length, [t]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 shadow-sm sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="cc" className="text-sm font-semibold">Your text</label>
          <InputActions onText={setText} onClear={() => setText("")} accept=".txt,text/plain" />
        </div>
        <CodeArea id="cc" label="Your text" value={text} onChange={setText} placeholder="Type or paste text…" minRows={12} className="whitespace-pre-wrap font-sans text-[15px]" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat emphasis label="Characters" value={chars.toLocaleString("en-IN")} />
          <Stat label="No spaces" value={noSpace.toLocaleString("en-IN")} />
          <Stat label="Words" value={words(t).length.toLocaleString("en-IN")} />
          <Stat label="UTF-8 bytes" value={bytes.toLocaleString("en-IN")} />
        </div>
      </div>
      <aside className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm" aria-live="polite">
        <h2 className="text-sm font-semibold">Common limits</h2>
        <ul className="flex flex-col gap-3">
          {LIMITS.map((l) => {
            const used = l.sms ? (sms.encoding === "Unicode" ? [...t].length : chars) : chars;
            const max = l.sms ? sms.perSegment : l.max;
            const pct = Math.min(100, (used / max) * 100);
            const over = used > max;
            return (
              <li key={l.name}>
                <div className="flex justify-between gap-2 text-sm">
                  <span>{l.name}</span>
                  <span className={cn("tabular-nums", over ? "font-medium text-danger" : "text-muted")}>
                    {used}/{max}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3" aria-hidden>
                  <div className={cn("h-full rounded-full", over ? "bg-danger" : "bg-brand")} style={{ width: `${pct}%` }} />
                </div>
                {l.sms && t && (
                  <p className="mt-1 text-xs text-muted">
                    {sms.encoding} encoding · {sms.segments} SMS segment{sms.segments === 1 ? "" : "s"}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-muted">Platforms change their limits from time to time; treat these as a guide.</p>
      </aside>
    </div>
  );
}

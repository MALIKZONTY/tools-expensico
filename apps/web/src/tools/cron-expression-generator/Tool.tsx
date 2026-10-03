"use client";

import { useMemo, useState } from "react";
import cronstrue from "cronstrue";
import { Alert } from "@/components/ui/alert";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/field";
import { nextRuns } from "@/lib/dev/cron";
import { useMounted } from "@/hooks/use-mounted";

const PRESETS: { label: string; expr: string }[] = [
  { label: "Every minute", expr: "* * * * *" },
  { label: "Every 15 minutes", expr: "*/15 * * * *" },
  { label: "Every hour", expr: "0 * * * *" },
  { label: "Every day at 9:00", expr: "0 9 * * *" },
  { label: "Weekdays at 9:30", expr: "30 9 * * 1-5" },
  { label: "Every Sunday at midnight", expr: "0 0 * * 0" },
  { label: "1st of every month", expr: "0 0 1 * *" },
  { label: "Every 6 hours", expr: "0 */6 * * *" },
];

const FIELDS = [
  { name: "Minute", hint: "0–59" },
  { name: "Hour", hint: "0–23" },
  { name: "Day of month", hint: "1–31" },
  { name: "Month", hint: "1–12 or JAN–DEC" },
  { name: "Day of week", hint: "0–6 (Sun=0) or SUN–SAT" },
];

export default function CronGenerator() {
  const [fields, setFields] = useState(["30", "9", "*", "*", "1-5"]);
  const expr = fields.map((f) => f.trim() || "*").join(" ");
  const mounted = useMounted();
  const r = useMemo(() => {
    try {
      const runs = mounted ? nextRuns(expr, 8) : [];
      const text = cronstrue.toString(expr, { use24HourTimeFormat: true, verbose: true });
      return { ok: true as const, runs, text };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
    }
  }, [expr, mounted]);
  const tz = mounted ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p.expr} type="button" onClick={() => setFields(p.expr.split(" "))} className="h-9 rounded-full border border-border bg-surface px-3 text-sm hover:border-border-strong hover:bg-surface-2">
            {p.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {FIELDS.map((f, i) => (
          <label key={f.name} className="flex flex-col gap-1 text-sm font-medium">
            {f.name}
            <Input value={fields[i]} onChange={(e) => setFields(fields.map((x, j) => (j === i ? e.target.value : x)))} className="text-center font-mono" spellCheck={false} />
            <span className="text-xs font-normal text-muted">{f.hint}</span>
          </label>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cron-expr" className="text-sm font-semibold">Expression</label>
        <div className="flex gap-2">
          <Input id="cron-expr" value={expr} onChange={(e) => {
            const parts = e.target.value.trim().split(/\s+/);
            setFields(parts.length === 1 && parts[0].startsWith("@") ? [parts[0], "", "", "", ""] : [...parts, "", "", "", "", ""].slice(0, 5));
          }} className="font-mono text-base" spellCheck={false} />
          <CopyButton value={expr} />
        </div>
      </div>
      <div aria-live="polite">
        {r.ok ? (
          <>
            <p className="rounded-lg bg-brand-soft px-4 py-3 font-medium text-brand-soft-fg">{r.text}</p>
            <h2 className="mt-4 text-sm font-semibold">Next runs <span className="font-normal text-muted">({tz})</span></h2>
            <ol className="mt-2 grid grid-cols-1 gap-1 font-mono text-sm sm:grid-cols-2">
              {r.runs.map((d) => (
                <li key={d.getTime()} className="rounded bg-surface-2 px-3 py-1.5">
                  {d.toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}
                </li>
              ))}
            </ol>
          </>
        ) : (
          <Alert tone="danger" role="alert" title="Invalid cron expression">{r.error}</Alert>
        )}
      </div>
    </div>
  );
}

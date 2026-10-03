"use client";

import { useState, type ReactNode } from "react";
import { ToolSurface } from "@/components/tool/ToolCard";
import { decreaseBy, increaseBy, percentChange, percentOf, reversePercent, whatPercent } from "@/lib/finance/percent";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";

function n(v: string) {
  const x = Number(v.replace(/,/g, ""));
  return v.trim() === "" ? NaN : x;
}
function fmt(v: number) {
  return Number.isFinite(v) ? formatNumber(v, { maximumFractionDigits: 6 }, "en-IN") : "—";
}

function Box({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <input
      aria-label={label}
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-28 rounded-md border border-border-strong bg-surface px-3 text-center text-[0.9375rem] tabular-nums focus-visible:outline-2 focus-visible:outline-ring sm:w-32"
    />
  );
}

function Row({ children, result, hint }: { children: ReactNode; result: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border py-5 first:pt-0 last:border-0 last:pb-0 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-[0.9375rem] text-fg">{children}</div>
      <div className="md:text-right">
        <output className={cn("block text-2xl font-semibold tabular-nums", result === "—" ? "text-subtle" : "text-fg")}>{result}</output>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
    </div>
  );
}

export default function PercentageCalculator() {
  const [a, setA] = useState({ p: "15", of: "2400" });
  const [b, setB] = useState({ part: "360", whole: "2400" });
  const [c, setC] = useState({ from: "80", to: "100" });
  const [d, setD] = useState({ v: "500", p: "12" });
  const [e, setE] = useState({ v: "500", p: "12" });
  const [f, setF] = useState({ r: "1180", p: "18" });
  const change = percentChange(n(c.from), n(c.to));

  return (
    <ToolSurface>
      <Row result={fmt(percentOf(n(a.p), n(a.of)))}>
        What is <Box label="Percentage" value={a.p} onChange={(p) => setA({ ...a, p })} /> % of <Box label="Number" value={a.of} onChange={(of) => setA({ ...a, of })} /> ?
      </Row>
      <Row result={Number.isFinite(whatPercent(n(b.part), n(b.whole))) ? `${fmt(whatPercent(n(b.part), n(b.whole)))}%` : "—"}>
        <Box label="Part" value={b.part} onChange={(part) => setB({ ...b, part })} /> is what % of <Box label="Whole" value={b.whole} onChange={(whole) => setB({ ...b, whole })} /> ?
      </Row>
      <Row result={Number.isFinite(change) ? `${change > 0 ? "+" : ""}${fmt(change)}%` : "—"} hint={Number.isFinite(change) ? (change >= 0 ? "increase" : "decrease") : undefined}>
        Percentage change from <Box label="From" value={c.from} onChange={(from) => setC({ ...c, from })} /> to <Box label="To" value={c.to} onChange={(to) => setC({ ...c, to })} />
      </Row>
      <Row result={fmt(increaseBy(n(d.v), n(d.p)))}>
        Increase <Box label="Value" value={d.v} onChange={(v) => setD({ ...d, v })} /> by <Box label="Percentage" value={d.p} onChange={(p) => setD({ ...d, p })} /> %
      </Row>
      <Row result={fmt(decreaseBy(n(e.v), n(e.p)))}>
        Decrease <Box label="Value" value={e.v} onChange={(v) => setE({ ...e, v })} /> by <Box label="Percentage" value={e.p} onChange={(p) => setE({ ...e, p })} /> %
      </Row>
      <Row result={fmt(reversePercent(n(f.r), n(f.p)))} hint="original value">
        <Box label="Result" value={f.r} onChange={(r) => setF({ ...f, r })} /> is the result after adding <Box label="Percentage" value={f.p} onChange={(p) => setF({ ...f, p })} /> % — original?
      </Row>
    </ToolSurface>
  );
}

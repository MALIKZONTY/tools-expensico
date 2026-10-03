"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export interface Segment {
  label: string;
  value: number;
  /** CSS colour, use var(--series-1) / var(--series-2). */
  color: string;
}

function LegendSwatch({ color }: { color: string }) {
  return <span aria-hidden className="inline-block size-3 shrink-0 rounded-sm" style={{ background: color }} />;
}

/** Two-part donut with a legend and values; the legend carries identity, not colour alone. */
/**
 * Round SVG geometry to 0.01px. Results computed with fractional powers can differ in the last
 * floating-point digit between Node (server render) and the browser, which React reports as a
 * hydration mismatch; the rounding is invisible on screen.
 */
const px = (n: number) => Math.round(n * 100) / 100;

export function Donut({ segments, format, centerLabel, centerValue }: { segments: Segment[]; format: (n: number) => string; centerLabel?: string; centerValue?: string }) {
  const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0);
  const [hover, setHover] = useState<number | null>(null);
  const r = 52;
  const c = 2 * Math.PI * r;
  const gap = total > 0 && segments.filter((s) => s.value > 0).length > 1 ? 2 : 0;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <figure className="relative size-40 shrink-0">
        <svg viewBox="0 0 128 128" className="size-40 -rotate-90" role="img" aria-label={segments.map((s) => `${s.label} ${format(s.value)}`).join(", ")}>
          <circle cx="64" cy="64" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="16" />
          {total > 0 &&
            segments.map((s, i) => {
              const len = (Math.max(0, s.value) / total) * c;
              const dash = Math.max(0, len - gap);
              const el = (
                <circle
                  key={s.label}
                  cx="64"
                  cy="64"
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={hover === i ? 19 : 16}
                  strokeDasharray={`${px(dash)} ${px(c - dash)}`}
                  strokeDashoffset={-px(offset)}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  className="transition-[stroke-width] duration-100"
                />
              );
              offset += len;
              return el;
            })}
        </svg>
        <figcaption className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {hover !== null ? (
            <>
              <span className="text-xs text-muted">{segments[hover].label}</span>
              <span className="text-sm font-semibold tabular-nums text-fg">{total > 0 ? Math.round((segments[hover].value / total) * 100) : 0}%</span>
            </>
          ) : (
            <>
              {centerLabel && <span className="text-xs text-muted">{centerLabel}</span>}
              {centerValue && <span className="text-sm font-semibold tabular-nums text-fg">{centerValue}</span>}
            </>
          )}
        </figcaption>
      </figure>
      <ul className="flex w-full flex-col gap-2 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <LegendSwatch color={s.color} />
            <span className="text-muted">{s.label}</span>
            <span className="ml-auto font-medium tabular-nums text-fg">{format(s.value)}</span>
            <span className="w-10 text-right tabular-nums text-subtle">{total > 0 ? `${Math.round((s.value / total) * 100)}%` : "—"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface StackedBar {
  label: string;
  parts: number[];
}

/**
 * Stacked vertical bars (e.g. invested vs gains per year) with hover tooltip.
 * Labels are thinned automatically so they never collide.
 */
export function StackedBars({ bars, series, format, title }: { bars: StackedBar[]; series: { label: string; color: string }[]; format: (n: number) => string; title: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...bars.map((b) => b.parts.reduce((s, p) => s + Math.max(0, p), 0)));
  const labelEvery = Math.ceil(bars.length / 10);

  return (
    <figure className="w-full">
      <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-fg">{title}</span>
        <span className="flex flex-wrap gap-3 text-xs text-muted">
          {series.map((s) => (
            <span key={s.label} className="inline-flex items-center gap-1.5">
              <LegendSwatch color={s.color} />
              {s.label}
            </span>
          ))}
        </span>
      </figcaption>
      <div className="relative">
        <div className="flex h-48 items-end gap-[2px] border-b border-border" role="img" aria-label={`${title}. See the table below for values.`}>
          {bars.map((b, i) => {
            const total = b.parts.reduce((s, p) => s + Math.max(0, p), 0);
            return (
              <div
                key={b.label}
                className="group relative flex h-full min-w-0 flex-1 flex-col justify-end"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
              >
                <div className={cn("flex flex-col-reverse gap-[2px] overflow-hidden rounded-t", hover !== null && hover !== i && "opacity-60")} style={{ height: `${(total / max) * 100}%` }}>
                  {b.parts.map((p, pi) => (
                    <div key={pi} style={{ height: total ? `${(Math.max(0, p) / total) * 100}%` : 0, background: series[pi]?.color }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {hover !== null && (
          <div
            className="pointer-events-none absolute -top-2 z-10 min-w-40 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg"
            style={{ left: `${((hover + 0.5) / bars.length) * 100}%` }}
          >
            <p className="mb-1 font-medium text-fg">{bars[hover].label}</p>
            {series.map((s, si) => (
              <p key={s.label} className="flex items-center gap-2 text-muted">
                <LegendSwatch color={s.color} />
                {s.label}
                <span className="ml-auto pl-3 tabular-nums text-fg">{format(bars[hover].parts[si] ?? 0)}</span>
              </p>
            ))}
          </div>
        )}
        <div className="mt-1 flex gap-[2px] text-[11px] text-subtle">
          {bars.map((b, i) => (
            <span key={b.label} className="min-w-0 flex-1 text-center">
              {i % labelEvery === 0 || i === bars.length - 1 ? b.label : ""}
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}

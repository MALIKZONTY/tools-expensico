"use client";

import { useId, useState } from "react";
import { Range } from "@/components/ui/field";
import { cn } from "@/lib/cn";

function parse(raw: string): number {
  const cleaned = raw.replace(/[,\s₹%]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return NaN;
  return Number(cleaned);
}

function display(value: number, grouping: boolean, maxFraction: number): string {
  if (!Number.isFinite(value)) return "";
  return grouping ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: maxFraction }).format(value) : String(value);
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Shown before the input, e.g. "₹". */
  prefix?: string;
  /** Shown after the input, e.g. "%" or "years". */
  suffix?: string;
  /** Show a slider under the input (slider range may be narrower than allowed input). */
  slider?: { min: number; max: number; step: number };
  grouping?: boolean;
  maxFraction?: number;
  hint?: string;
  className?: string;
}

/**
 * Numeric input that accepts Indian digit grouping (1,00,000), validates range on blur,
 * and optionally pairs with a slider. Typing never fights the user: the text is only
 * reformatted when the field loses focus.
 */
export function NumberField({ label, value, onChange, min = 0, max = Number.MAX_SAFE_INTEGER, prefix, suffix, slider, grouping = true, maxFraction = 2, hint, className }: NumberFieldProps) {
  const id = useId();
  // While editing, show exactly what the user typed; otherwise show the formatted value.
  const [draft, setDraft] = useState<string | null>(null);
  const focused = draft !== null;
  const text = draft ?? display(value, grouping, maxFraction);
  const n = parse(text);
  const error = text.trim() === "" ? "Enter a value" : !Number.isFinite(n) ? "Enter a number" : n < min ? `Minimum is ${display(min, grouping, maxFraction)}` : n > max ? `Maximum is ${display(max, grouping, maxFraction)}` : null;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
      </label>
      <div
        className={cn(
          "flex h-11 items-center rounded-md border bg-surface transition-colors focus-within:outline-2 focus-within:outline-ring",
          error && !focused ? "border-danger" : "border-border-strong",
        )}
      >
        {prefix && <span className="pl-3 text-muted">{prefix}</span>}
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={text}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
          onFocus={() => setDraft(display(value, grouping, maxFraction))}
          onBlur={() => {
            if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)));
            setDraft(null);
          }}
          onChange={(e) => {
            setDraft(e.target.value);
            const v = parse(e.target.value);
            if (Number.isFinite(v) && v >= min && v <= max) onChange(v);
          }}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-[0.9375rem] tabular-nums text-fg outline-none"
        />
        {suffix && <span className="pr-3 text-sm text-muted">{suffix}</span>}
      </div>
      {slider && (
        <Range
          aria-label={`${label} slider`}
          min={slider.min}
          max={slider.max}
          step={slider.step}
          value={Math.min(slider.max, Math.max(slider.min, value))}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      )}
      {error && !focused ? (
        <p id={`${id}-err`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

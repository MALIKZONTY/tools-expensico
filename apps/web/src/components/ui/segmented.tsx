"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SegmentedProps<T extends string> {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
  size?: "sm" | "md";
}

/** Compact single-choice control built on radio inputs (native keyboard behaviour). */
export function Segmented<T extends string>({ options, value, onChange, label, className, size = "md" }: SegmentedProps<T>) {
  const name = useId();
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex max-w-full flex-wrap rounded-lg border border-border bg-surface-2 p-1", className)}>
      {options.map((opt) => {
        const checked = opt.value === value;
        return (
          <label
            key={opt.value}
            className={cn(
              "relative flex cursor-pointer items-center justify-center rounded-md px-3 font-medium transition-colors",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
              size === "sm" ? "h-8 text-[13px]" : "h-9 text-sm",
              checked ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg",
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}

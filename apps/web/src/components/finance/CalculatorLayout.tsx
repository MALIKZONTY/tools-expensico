import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/** Inputs on the left, results on the right (stacked on mobile). */
export function CalculatorLayout({ inputs, results, below, className }: { inputs: ReactNode; results: ReactNode; below?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <section aria-label="Inputs" className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
          {inputs}
        </section>
        <section aria-label="Results" aria-live="polite" className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
          {results}
        </section>
      </div>
      {below}
    </div>
  );
}

export function FinanceNote({ children }: { children?: ReactNode }) {
  return (
    <p className="text-xs leading-relaxed text-muted">
      {children ?? "Estimates for planning only. Actual figures from your bank or employer may differ because of rounding, fees and product rules."}{" "}
      <Link href="/disclaimer" className="underline hover:text-fg">
        Disclaimer
      </Link>
    </p>
  );
}

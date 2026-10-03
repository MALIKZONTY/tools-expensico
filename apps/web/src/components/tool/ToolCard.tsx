import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** The bordered surface that holds a tool's interactive UI. */
export function ToolSurface({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6", className)}>{children}</div>;
}

/** Labelled group of settings inside a tool. */
export function ToolSection({ title, children, className, actions }: { title?: ReactNode; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("min-w-0", className)}>
      {(title || actions) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2>}
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/** Small key/value statistic used in result summaries. */
export function Stat({ label, value, sub, emphasis, className }: { label: ReactNode; value: ReactNode; sub?: ReactNode; emphasis?: boolean; className?: string }) {
  return (
    <div className={cn("min-w-0 rounded-lg border border-border bg-surface-2 px-4 py-3", emphasis && "border-transparent bg-brand-soft", className)}>
      <p className={cn("text-sm", emphasis ? "text-brand-soft-fg" : "text-muted")}>{label}</p>
      <p className={cn("mt-0.5 truncate text-xl font-semibold tabular-nums tracking-tight sm:text-2xl", emphasis ? "text-brand-soft-fg" : "text-fg")}>{value}</p>
      {sub && <p className={cn("mt-0.5 text-xs", emphasis ? "text-brand-soft-fg/80" : "text-muted")}>{sub}</p>}
    </div>
  );
}

import { cn } from "@/lib/cn";

interface ProgressProps {
  /** 0–1. Omit for an indeterminate bar. */
  value?: number;
  label: string;
  className?: string;
  showValue?: boolean;
}

export function Progress({ value, label, className, showValue = true }: ProgressProps) {
  const pct = value === undefined ? undefined : Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        {showValue && pct !== undefined && <span className="tabular-nums text-fg">{pct}%</span>}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-3"
      >
        {pct === undefined ? (
          <div className="h-full w-2/5 rounded-full bg-brand [animation:ex-indeterminate_1.2s_ease-in-out_infinite]" />
        ) : (
          <div className="h-full rounded-full bg-brand transition-[width] duration-200" style={{ width: `${pct}%` }} />
        )}
      </div>
    </div>
  );
}

export function Spinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <span role="status" className={cn("inline-flex items-center", className)}>
      <span aria-hidden className="size-5 animate-spin rounded-full border-2 border-brand border-r-transparent" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-surface-3", className)} />;
}

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-muted border-border",
  brand: "bg-brand-soft text-brand-soft-fg border-transparent",
  success: "bg-success-soft text-success-soft-fg border-transparent",
  warning: "bg-warning-soft text-warning-soft-fg border-transparent",
  danger: "bg-danger-soft text-danger-soft-fg border-transparent",
  info: "bg-info-soft text-info-soft-fg border-transparent",
};

export function Badge({ tone = "neutral", children, className, icon }: { tone?: BadgeTone; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

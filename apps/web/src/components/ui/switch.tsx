"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Switch({ checked, onChange, label, description, className }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; description?: ReactNode; className?: string }) {
  const id = useId();
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <label htmlFor={id} className="cursor-pointer text-sm">
        <span className="font-medium text-fg">{label}</span>
        {description && <span className="block text-muted">{description}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
          checked ? "bg-brand" : "bg-border-strong",
        )}
      >
        <span
          aria-hidden
          className={cn("inline-block size-5 rounded-full bg-white shadow-sm transition-transform", checked ? "translate-x-[22px]" : "translate-x-0.5")}
        />
      </button>
    </div>
  );
}

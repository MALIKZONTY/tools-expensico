"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ExplorerFilter {
  id: string;
  label: string;
  count: number;
}

/**
 * Filter pills over a server-rendered grid. Cards stay in the HTML for every filter
 * (good for SEO and no extra JavaScript); CSS hides the ones that don't match.
 */
export function ToolExplorer({ filters, children }: { filters: ExplorerFilter[]; children: ReactNode }) {
  const [active, setActive] = useState("all");
  return (
    <div className="tool-explorer" data-filter={active}>
      <div role="group" aria-label="Filter tools by category" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={active === f.id}
            onClick={() => setActive(f.id)}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors",
              active === f.id ? "border-brand bg-brand text-brand-fg shadow-sm" : "border-border bg-surface text-fg hover:border-brand/50",
            )}
          >
            {f.label}
            <span className={cn("text-xs tabular-nums", active === f.id ? "text-brand-fg/75" : "text-subtle")}>{f.count}</span>
          </button>
        ))}
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}

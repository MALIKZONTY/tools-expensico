"use client";

import { useEffect, useRef } from "react";
import { adsConfig } from "@/config/site";
import { cn } from "@/lib/cn";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export type AdPlacement = "after-tool" | "in-content" | "sidebar" | "footer";

/** Reserved heights per placement so an ad loading in never shifts the page (CLS). */
const reserved: Record<AdPlacement, string> = {
  "after-tool": "min-h-[280px] sm:min-h-[120px]",
  "in-content": "min-h-[280px]",
  sidebar: "min-h-[600px]",
  footer: "min-h-[100px]",
};

/**
 * Advertising slot. Renders nothing at all unless AdSense is configured, so the layout
 * is identical to an ad-free site until ads are deliberately switched on.
 *
 * Placement rules (AdSense policy and UX):
 * - never inside a tool's controls, upload area or results
 * - always labelled "Advertisement"
 * - never more than one slot between the tool and its explanatory content
 */
export function AdSlot({ placement, slotId, className }: { placement: AdPlacement; slotId?: string; className?: string }) {
  const ref = useRef<HTMLModElement>(null);
  const enabled = adsConfig.enabled && Boolean(slotId);

  useEffect(() => {
    if (!enabled || !ref.current || ref.current.dataset.loaded) return;
    try {
      ref.current.dataset.loaded = "1";
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers or script failures must not affect the page.
    }
  }, [enabled]);

  if (!enabled) return null;

  return (
    <aside aria-label="Advertisement" className={cn("my-8", className)}>
      <p className="mb-1 text-center text-[11px] uppercase tracking-wider text-subtle">Advertisement</p>
      <div className={cn("flex items-center justify-center overflow-hidden rounded-lg bg-surface-2", reserved[placement])}>
        <ins
          ref={ref}
          className="adsbygoogle block w-full"
          data-ad-client={adsConfig.client}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}

"use client";

import { AlertTriangle, Check, HardDrive } from "lucide-react";
import type { KvStatus } from "@/lib/storage/use-kv";
import { useMounted } from "@/hooks/use-mounted";

/** Honest indicator of where data lives and whether it's saved. */
export function SaveStatus({ status, savedAt }: { status: KvStatus; savedAt: number | null }) {
  const mounted = useMounted();
  if (status === "unavailable") {
    return (
      <p className="flex items-center gap-1.5 text-sm text-warning" role="status">
        <AlertTriangle aria-hidden className="size-4" />
        This browser is blocking storage, so changes won&apos;t be kept after you close the tab.
      </p>
    );
  }
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted" role="status">
      <span className="inline-flex items-center gap-1.5">
        <HardDrive aria-hidden className="size-4" /> Saved only in this browser
      </span>
      {status === "ready" && savedAt && mounted && (
        <span className="inline-flex items-center gap-1 text-success">
          <Check aria-hidden className="size-4" /> Saved {new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
    </p>
  );
}

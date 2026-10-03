"use client";

import { FileIcon, X } from "lucide-react";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/cn";

export function FileChip({ file, onRemove, className, meta }: { file: File; onRemove?: () => void; className?: string; meta?: string }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2", className)}>
      <FileIcon aria-hidden className="size-5 shrink-0 text-muted" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-muted">
          {formatBytes(file.size)}
          {meta ? ` · ${meta}` : ""}
        </p>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg"
          aria-label={`Remove ${file.name}`}
        >
          <X aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
}

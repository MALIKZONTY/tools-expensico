"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { RunnerState } from "./use-conversion";

/** Convert button, progress bar and cancel — identical across all converters. */
export function ConvertControls({ state, onConvert, onCancel, label, disabled, block }: { state: RunnerState; onConvert: () => void; onCancel: () => void; label: string; disabled?: boolean; /** Full-width primary action, for sidebars. */ block?: boolean }) {
  if (state.status === "running") {
    return (
      <div className={cn("flex flex-col gap-3", !block && "sm:flex-row sm:items-end")}>
        <Progress className="flex-1" value={state.progress.value} label={state.progress.label} />
        <Button variant="secondary" onClick={onCancel} className={block ? "w-full" : "sm:w-auto"}>
          <X aria-hidden />
          Cancel
        </Button>
      </div>
    );
  }
  return (
    <Button size={block ? "xl" : "lg"} onClick={onConvert} disabled={disabled} className={block ? "w-full" : "w-full sm:w-auto sm:self-start"}>
      {label}
    </Button>
  );
}

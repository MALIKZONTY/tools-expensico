"use client";

import type { ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import type { ToolError } from "@/lib/files/errors";

export function ToolErrorAlert({ error, actions, className }: { error: ToolError; actions?: ReactNode; className?: string }) {
  if (error.code === "cancelled") return null;
  return (
    <Alert tone="danger" title={error.title} role="alert" actions={actions} className={className}>
      {error.detail && <p>{error.detail}</p>}
      {error.hint && <p className={error.detail ? "mt-1 opacity-90" : undefined}>{error.hint}</p>}
    </Alert>
  );
}

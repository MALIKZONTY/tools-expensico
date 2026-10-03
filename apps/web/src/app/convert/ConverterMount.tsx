"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/progress";
import { ToolErrorBoundary } from "@/components/tool/ToolErrorBoundary";

const UniversalConverter = dynamic(() => import("@/tools/converter/UniversalConverter"), {
  loading: () => (
    <div className="rounded-xl border border-border bg-surface p-6">
      <Skeleton className="h-48 w-full" />
    </div>
  ),
});

export function ConverterMount() {
  return (
    <ToolErrorBoundary slug="universal-converter">
      <UniversalConverter />
    </ToolErrorBoundary>
  );
}

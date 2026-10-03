"use client";

import { Alert } from "@/components/ui/alert";
import type { JsonIssue } from "@/lib/json-tools";

export function JsonIssueAlert({ issue, title = "Invalid JSON" }: { issue: JsonIssue; title?: string }) {
  return (
    <Alert tone="danger" role="alert" title={issue.line ? `${title} — line ${issue.line}${issue.column ? `, column ${issue.column}` : ""}` : title}>
      {issue.explanation && <p>{issue.explanation}</p>}
      {issue.excerpt !== undefined && (
        <pre className="mt-2 overflow-x-auto rounded bg-[color-mix(in_srgb,currentColor_8%,transparent)] px-2 py-1 font-mono text-xs">
          {issue.excerpt}
          {issue.column ? `\n${" ".repeat(Math.max(0, issue.column - 1))}^` : ""}
        </pre>
      )}
      <p className="mt-1 text-xs opacity-80">Parser message: {issue.message}</p>
    </Alert>
  );
}

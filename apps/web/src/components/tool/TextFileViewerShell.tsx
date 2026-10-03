"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/progress";
import { FileChip } from "@/components/tool/FileChip";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolErrorAlert } from "@/components/tool/ToolErrorAlert";
import type { FormatId } from "@/lib/convert/formats";
import type { ToolError } from "@/lib/files/errors";

/** Common frame for viewers: dropzone → file chip + content. */
export function ViewerShell({ accept, maxBytes, label, file, loading, error, onFile, onReset, meta, toolbar, children }: {
  accept: FormatId[];
  maxBytes: number;
  label: string;
  file: File | null;
  loading: boolean;
  error: ToolError | null;
  onFile: (f: File) => void;
  onReset: () => void;
  meta?: string;
  toolbar?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      {!file ? (
        <FileDropzone accept={accept} maxBytes={maxBytes} onFiles={([f]) => onFile(f)} disabled={loading} label={label} />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <FileChip className="min-w-0 flex-1" file={file} meta={meta} />
          {toolbar}
          <Button variant="ghost" size="sm" onClick={onReset}>Open another</Button>
        </div>
      )}
      {loading && <Spinner label="Reading file" />}
      {error && <ToolErrorAlert error={error} />}
      {children}
    </div>
  );
}

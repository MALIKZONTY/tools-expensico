"use client";

import { useState } from "react";
import { FileChip } from "@/components/tool/FileChip";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolErrorAlert } from "@/components/tool/ToolErrorAlert";
import { validateFile } from "@/lib/files/validate";
import { toToolError, type ToolError } from "@/lib/files/errors";

export const PDF_MAX = 300 * 1024 * 1024;

/** Single-PDF picker with content validation. */
export function PdfInput({ file, onFile, meta, disabled }: { file: File | null; onFile: (f: File | null) => void; meta?: string; disabled?: boolean }) {
  const [error, setError] = useState<ToolError | null>(null);
  return (
    <div className="flex flex-col gap-3">
      {file ? (
        <FileChip file={file} meta={meta} onRemove={disabled ? undefined : () => onFile(null)} />
      ) : (
        <FileDropzone
          accept={["pdf"]}
          maxBytes={PDF_MAX}
          label="Choose a PDF"
          onFiles={async ([f]) => {
            setError(null);
            try {
              await validateFile(f, { accept: ["pdf"], maxBytes: PDF_MAX });
              onFile(f);
            } catch (e) {
              setError(toToolError(e));
            }
          }}
        />
      )}
      {error && <ToolErrorAlert error={error} />}
    </div>
  );
}

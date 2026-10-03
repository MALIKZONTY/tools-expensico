"use client";

import { useId, useRef, type ReactNode } from "react";
import { ClipboardPaste, Download, FileUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { useToast } from "@/components/ui/toast";
import { downloadText } from "@/lib/files/download";
import { readTextFile } from "@/lib/files/text";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/cn";

const MAX_TEXT_FILE = 20 * 1024 * 1024;

export function CodeArea({ value, onChange, readOnly, label, placeholder, className, id, invalid, minRows = 14 }: { value: string; onChange?: (v: string) => void; readOnly?: boolean; label: string; placeholder?: string; className?: string; id?: string; invalid?: boolean; minRows?: number }) {
  return (
    <textarea
      id={id}
      aria-label={label}
      aria-invalid={invalid || undefined}
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      spellCheck={false}
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      wrap="off"
      rows={minRows}
      className={cn(
        "w-full resize-y rounded-lg border bg-surface px-3 py-2.5 font-mono text-[13px] leading-relaxed text-fg placeholder:text-subtle focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring",
        invalid ? "border-danger" : "border-border-strong",
        readOnly && "bg-surface-2",
        className,
      )}
    />
  );
}

/** Buttons to paste, open a text file or clear an input. */
export function InputActions({ onText, onClear, accept = ".txt,.json,.xml,.yaml,.yml,.csv,.sql,.html,.htm,.css,.scss,.less,.js,.mjs,.ts,.tsx,.jsx,.md,text/*" }: { onText: (text: string) => void; onClear: () => void; accept?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  return (
    <div className="flex flex-wrap gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={async () => {
          try {
            onText(await navigator.clipboard.readText());
          } catch {
            toast("Your browser blocked clipboard access. Paste with Ctrl+V / ⌘V instead.", "info");
          }
        }}
      >
        <ClipboardPaste aria-hidden /> Paste
      </Button>
      <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
        <FileUp aria-hidden /> Open file
      </Button>
      <Button variant="ghost" size="sm" onClick={onClear}>
        <Trash2 aria-hidden /> Clear
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          if (f.size > MAX_TEXT_FILE) {
            toast(`That file is ${formatBytes(f.size)}. The limit here is ${formatBytes(MAX_TEXT_FILE, 0)}.`, "error");
            return;
          }
          const d = await readTextFile(f);
          if (d.text.includes("\u0000")) {
            toast("That doesn't look like a text file.", "error");
            return;
          }
          onText(d.text);
        }}
      />
    </div>
  );
}

export function OutputActions({ value, fileName, mime }: { value: string; fileName: string; mime?: string }) {
  return (
    <div className="flex flex-wrap gap-1">
      <CopyButton value={value} variant="ghost" disabled={!value} />
      <Button variant="ghost" size="sm" disabled={!value} onClick={() => downloadText(value, fileName, mime)}>
        <Download aria-hidden /> Download
      </Button>
    </div>
  );
}

interface WorkbenchProps {
  inputLabel: string;
  outputLabel: string;
  input: string;
  onInput: (v: string) => void;
  output: string;
  inputPlaceholder?: string;
  /** Controls shown between header and panes (options, mode buttons). */
  toolbar?: ReactNode;
  /** Error/status shown under the input. */
  status?: ReactNode;
  invalid?: boolean;
  fileName: string;
  mime?: string;
  inputAccept?: string;
  /** Replace the output textarea with custom content (e.g. a tree view). */
  outputSlot?: ReactNode;
}

/** Side-by-side (stacked on mobile) input/output editor used by formatters and encoders. */
export function Workbench({ inputLabel, outputLabel, input, onInput, output, inputPlaceholder, toolbar, status, invalid, fileName, mime, inputAccept, outputSlot }: WorkbenchProps) {
  const inId = useId();
  const outId = useId();
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      {toolbar && <div className="flex flex-wrap items-end gap-3">{toolbar}</div>}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor={inId} className="text-sm font-semibold text-fg">
              {inputLabel}
            </label>
            <InputActions onText={onInput} onClear={() => onInput("")} accept={inputAccept} />
          </div>
          <CodeArea id={inId} label={inputLabel} value={input} onChange={onInput} placeholder={inputPlaceholder} invalid={invalid} />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span>{input.length.toLocaleString("en-IN")} characters · {input ? input.split("\n").length.toLocaleString("en-IN") : 0} lines</span>
          </div>
          {status}
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor={outId} className="text-sm font-semibold text-fg">
              {outputLabel}
            </label>
            <OutputActions value={output} fileName={fileName} mime={mime} />
          </div>
          {outputSlot ?? <CodeArea id={outId} label={outputLabel} value={output} readOnly />}
        </div>
      </div>
    </div>
  );
}

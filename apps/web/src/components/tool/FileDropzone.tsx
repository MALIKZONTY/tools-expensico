"use client";

import { useCallback, useEffect, useId, useRef, useState, type DragEvent, type KeyboardEvent, type ReactNode } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/cn";
import { acceptAttribute, formatLabelList, type FormatId } from "@/lib/convert/formats";
import { formatBytes } from "@/lib/format";

interface FileDropzoneProps {
  /** Formats to offer in the picker, or "any" for any file type. */
  accept: FormatId[] | "any";
  multiple?: boolean;
  maxBytes: number;
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  /** Main call to action, e.g. "Choose PDF file". */
  label?: string;
  /** Override the "Supported: …" line. */
  hint?: ReactNode;
  /** Small inline picker. The default is the large hero picker that also accepts drops anywhere on the page. */
  compact?: boolean;
  className?: string;
}

const hasFiles = (e: globalThis.DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");

/**
 * Drag-and-drop + click/tap + keyboard file picker. Validation of contents happens in the
 * tool (validateFile); this component only collects files.
 */
export function FileDropzone({ accept, multiple, maxBytes, onFiles, disabled, label, hint, compact, className }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [pageDrag, setPageDrag] = useState(false);
  const depth = useRef(0);
  const descId = useId();

  const pick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handle = useCallback(
    (list: FileList | null | undefined) => {
      if (!list || list.length === 0) return;
      const files = Array.from(list);
      onFiles(multiple ? files : files.slice(0, 1));
    },
    [onFiles, multiple],
  );

  // The hero picker accepts files dropped anywhere on the page, not just on the box.
  useEffect(() => {
    if (compact || disabled) return;
    let count = 0;
    const enter = (e: globalThis.DragEvent) => {
      if (!hasFiles(e)) return;
      count++;
      setPageDrag(true);
    };
    const over = (e: globalThis.DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    const leave = () => {
      count = Math.max(0, count - 1);
      if (count === 0) setPageDrag(false);
    };
    const drop = (e: globalThis.DragEvent) => {
      count = 0;
      setPageDrag(false);
      // Drops on the box itself are handled (and default-prevented) by the box.
      if (e.defaultPrevented || !hasFiles(e)) return;
      e.preventDefault();
      handle(e.dataTransfer?.files);
    };
    window.addEventListener("dragenter", enter);
    window.addEventListener("dragover", over);
    window.addEventListener("dragleave", leave);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragenter", enter);
      window.removeEventListener("dragover", over);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("drop", drop);
    };
  }, [compact, disabled, handle]);

  function onDrop(e: DragEvent) {
    e.preventDefault();
    depth.current = 0;
    setDragging(false);
    if (!disabled) handle(e.dataTransfer.files);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick();
    }
  }

  const cta = label ?? (multiple ? "Choose files" : "Choose a file");
  const hintText = hint ?? (
    <>
      {accept === "any" ? "Any file type" : formatLabelList(accept)} · up to {formatBytes(maxBytes, 0)}
      {multiple ? " each" : ""}
    </>
  );

  return (
    <>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-describedby={descId}
        onClick={pick}
        onKeyDown={onKeyDown}
        onDragEnter={(e) => {
          e.preventDefault();
          depth.current++;
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => {
          depth.current = Math.max(0, depth.current - 1);
          if (depth.current === 0) setDragging(false);
        }}
        onDrop={onDrop}
        className={cn(
          "group relative flex w-full cursor-pointer flex-col items-center justify-center text-center transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          compact
            ? "gap-2 rounded-xl border-2 border-dashed px-4 py-6"
            : "gap-4 rounded-2xl border-2 border-dashed px-4 py-12 sm:py-16",
          dragging ? "border-brand bg-brand-soft" : compact ? "border-border-strong bg-surface hover:border-brand hover:bg-surface-2" : "border-border bg-surface hover:border-brand/60",
          disabled && "pointer-events-none opacity-60",
          className,
        )}
      >
        {compact && (
          <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Upload aria-hidden className="size-5" />
          </span>
        )}
        <span
          className={cn(
            "inline-flex items-center justify-center gap-2 bg-brand font-semibold text-brand-fg shadow-sm transition-colors group-hover:bg-brand-hover",
            compact ? "h-11 rounded-md px-5 text-[0.9375rem] font-medium" : "h-14 w-full max-w-sm rounded-xl px-8 text-lg shadow-md sm:h-16 sm:text-xl",
          )}
        >
          {!compact && <Upload aria-hidden className="size-5 sm:size-6" />}
          {cta}
        </span>
        <span className={cn("hidden text-muted sm:block", compact ? "text-sm" : "text-[0.9375rem]")}>or drop {multiple ? "files" : "a file"} here</span>
        <span id={descId} className="text-sm text-subtle">
          {hintText}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={accept === "any" ? undefined : acceptAttribute(accept)}
          multiple={multiple}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            handle(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {pageDrag && !dragging && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-brand/10 p-6 backdrop-blur-[2px]">
          <div className="flex size-full flex-col items-center justify-center gap-3 rounded-3xl border-4 border-dashed border-brand bg-surface/80 text-center">
            <Upload className="size-10 text-brand" />
            <p className="text-2xl font-semibold text-fg">Drop {multiple ? "files" : "your file"} to add {multiple ? "them" : "it"}</p>
            <p className="text-sm text-muted">{hintText}</p>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { PdfThumb } from "./PdfThumb";

interface PagePickerProps {
  doc: PDFDocumentProxy;
  selected: Set<number>;
  onChange: (s: Set<number>) => void;
  /** "keep" highlights selected pages; "remove" marks them for deletion. */
  intent?: "keep" | "remove";
}

export function PagePicker({ doc, selected, onChange, intent = "keep" }: PagePickerProps) {
  const total = doc.numPages;
  const all = Array.from({ length: total }, (_, i) => i + 1);
  const toggle = (p: number) => {
    const next = new Set(selected);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1">
        <Button size="sm" variant="secondary" onClick={() => onChange(new Set(all))}>Select all</Button>
        <Button size="sm" variant="secondary" onClick={() => onChange(new Set())}>Select none</Button>
        <Button size="sm" variant="ghost" onClick={() => onChange(new Set(all.filter((p) => p % 2 === 1)))}>Odd pages</Button>
        <Button size="sm" variant="ghost" onClick={() => onChange(new Set(all.filter((p) => p % 2 === 0)))}>Even pages</Button>
      </div>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-3">
        {all.map((p) => {
          const on = selected.has(p);
          return (
            <li key={p}>
              <button
                type="button"
                aria-pressed={on}
                aria-label={`Page ${p}${on ? (intent === "remove" ? ", marked for removal" : ", selected") : ""}`}
                onClick={() => toggle(p)}
                className={cn(
                  "relative flex w-full flex-col items-center gap-1.5 rounded-lg border-2 p-2 transition-colors",
                  on ? (intent === "remove" ? "border-danger bg-danger-soft" : "border-brand bg-brand-soft") : "border-transparent hover:bg-surface-2",
                )}
              >
                <PdfThumb doc={doc} page={p} width={100} className={cn(on && intent === "remove" && "opacity-50")} />
                <span className="text-xs font-medium tabular-nums text-muted">{p}</span>
                {on && (
                  <span className={cn("absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full text-white", intent === "remove" ? "bg-danger" : "bg-brand")}>
                    <Check aria-hidden className="size-3.5" />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

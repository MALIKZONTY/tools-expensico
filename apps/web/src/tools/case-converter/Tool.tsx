"use client";

import { useState } from "react";
import { CodeArea, InputActions, OutputActions } from "@/components/tool/Workbench";
import { convertCase, type CaseKind } from "@/lib/text/transform";
import { cn } from "@/lib/cn";

const KINDS: { kind: CaseKind; label: string }[] = [
  { kind: "upper", label: "UPPERCASE" },
  { kind: "lower", label: "lowercase" },
  { kind: "title", label: "Title Case" },
  { kind: "sentence", label: "Sentence case" },
  { kind: "camel", label: "camelCase" },
  { kind: "pascal", label: "PascalCase" },
  { kind: "snake", label: "snake_case" },
  { kind: "kebab", label: "kebab-case" },
  { kind: "constant", label: "CONSTANT_CASE" },
  { kind: "dot", label: "dot.case" },
  { kind: "alternating", label: "aLtErNaTiNg" },
  { kind: "inverse", label: "iNVERSE" },
];

export default function CaseConverter() {
  const [input, setInput] = useState("the quick brown fox jumps over the lazy dog");
  const [kind, setKind] = useState<CaseKind>("title");
  const output = convertCase(input, kind);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div role="radiogroup" aria-label="Case" className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k.kind}
            type="button"
            role="radio"
            aria-checked={kind === k.kind}
            onClick={() => setKind(k.kind)}
            className={cn("h-10 rounded-md border px-3 font-mono text-sm", kind === k.kind ? "border-brand bg-brand-soft text-brand-soft-fg" : "border-border bg-surface hover:bg-surface-2")}
          >
            {k.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="case-in" className="text-sm font-semibold">Text</label>
            <InputActions onText={setInput} onClear={() => setInput("")} accept=".txt,text/plain" />
          </div>
          <CodeArea id="case-in" label="Text" value={input} onChange={setInput} minRows={10} className="whitespace-pre-wrap font-sans text-[15px]" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold">Result</span>
            <OutputActions value={output} fileName="converted.txt" />
          </div>
          <CodeArea label="Result" value={output} readOnly minRows={10} className="whitespace-pre-wrap font-sans text-[15px]" />
        </div>
      </div>
    </div>
  );
}

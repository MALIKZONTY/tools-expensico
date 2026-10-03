"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { CodeArea } from "@/components/tool/Workbench";
import { DiffView } from "@/components/tool/DiffView";
import { diffLines, diffSummary } from "@/lib/text/diff";

export default function TextDiff() {
  const [a, setA] = useState("Expensico offers free tools.\nConvert PDF to JPG.\nCalculate your EMI.\nFormat JSON.");
  const [b, setB] = useState("Expensico offers free online tools.\nConvert PDF to JPG.\nFormat and validate JSON.\nTake notes.");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWs, setIgnoreWs] = useState(false);
  const [mode, setMode] = useState<"split" | "unified">("split");
  const da = useDeferredValue(a);
  const db = useDeferredValue(b);
  const ops = useMemo(() => diffLines(da, db, { ignoreCase, ignoreWhitespace: ignoreWs }), [da, db, ignoreCase, ignoreWs]);
  const sum = diffSummary(ops);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Original
          <CodeArea label="Original text" value={a} onChange={setA} minRows={8} />
        </label>
        <Button variant="ghost" size="icon" className="self-center justify-self-center" aria-label="Swap texts" onClick={() => { setA(b); setB(a); }}>
          <ArrowLeftRight aria-hidden />
        </Button>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Changed
          <CodeArea label="Changed text" value={b} onChange={setB} minRows={8} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <Segmented label="View" size="sm" value={mode} onChange={setMode} options={[{ value: "split", label: "Side by side" }, { value: "unified", label: "Inline" }]} />
        <Checkbox label="Ignore case" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} />
        <Checkbox label="Ignore whitespace" checked={ignoreWs} onChange={(e) => setIgnoreWs(e.target.checked)} />
        <p className="ml-auto text-sm" aria-live="polite">
          <span className="font-medium text-success">+{sum.added}</span> <span className="font-medium text-danger">−{sum.removed}</span> <span className="text-muted">lines · {sum.unchanged} unchanged</span>
        </p>
      </div>
      <DiffView ops={ops} mode={mode} />
    </div>
  );
}

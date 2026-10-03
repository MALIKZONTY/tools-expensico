"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Input } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { CodeArea, OutputActions } from "@/components/tool/Workbench";
import { lorem, type LoremUnit } from "@/lib/text/lorem";

export default function LoremIpsumGenerator() {
  const [unit, setUnit] = useState<LoremUnit>("paragraphs");
  const [count, setCount] = useState(3);
  const [classic, setClassic] = useState(true);
  const [html, setHtml] = useState(false);
  const [text, setText] = useState("");
  const generate = () => setText(lorem(unit, Math.min(unit === "words" ? 5000 : 200, Math.max(1, count || 1)), classic, html));
  // Random values must be generated in the browser after hydration (not during the server render), so this effect is intentional.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(generate, [unit, count, classic, html]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-end gap-4">
        <Segmented label="Unit" value={unit} onChange={setUnit} options={[{ value: "paragraphs", label: "Paragraphs" }, { value: "sentences", label: "Sentences" }, { value: "words", label: "Words" }]} />
        <label className="flex flex-col gap-1.5 text-sm font-medium">How many
          <Input type="number" min={1} max={unit === "words" ? 5000 : 200} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-28" />
        </label>
        <Button variant="secondary" onClick={generate}><RefreshCw aria-hidden /> Regenerate</Button>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <Checkbox label="Start with “Lorem ipsum dolor sit amet…”" checked={classic} onChange={(e) => setClassic(e.target.checked)} />
        {unit === "paragraphs" && <Checkbox label="Wrap in <p> tags" checked={html} onChange={(e) => setHtml(e.target.checked)} />}
      </div>
      <div className="flex justify-end"><OutputActions value={text} fileName="lorem-ipsum.txt" /></div>
      <CodeArea label="Generated text" value={text} readOnly minRows={14} className="whitespace-pre-wrap font-sans text-[15px]" />
    </div>
  );
}

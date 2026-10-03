"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Checkbox, Select } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { JsonIssueAlert } from "@/components/tool/JsonIssueAlert";
import { JsonTree } from "@/components/tool/JsonTree";
import { Workbench } from "@/components/tool/Workbench";
import { byteLength, parseJson, stringify } from "@/lib/json-tools";
import { formatBytes } from "@/lib/format";

const SAMPLE = '{"order":{"id":10234,"customer":{"name":"Asha Rao","city":"Pune"},"items":[{"sku":"BK-01","qty":2,"price":349.5},{"sku":"PN-07","qty":1,"price":99}],"paid":true,"coupon":null}}';

export default function JsonFormatter({ initialMode = "format" }: { initialMode?: "format" | "minify" }) {
  const [input, setInput] = useState(SAMPLE);
  const [mode, setMode] = useState<"format" | "minify">(initialMode);
  const [indent, setIndent] = useState<"2" | "4" | "tab">("2");
  const [sortKeys, setSortKeys] = useState(false);
  const [view, setView] = useState<"text" | "tree">("text");
  const deferred = useDeferredValue(input);

  const result = useMemo(() => (deferred.trim() ? parseJson(deferred) : null), [deferred]);
  const output = useMemo(() => {
    if (!result?.ok) return "";
    return stringify(result.value, mode === "minify" ? 0 : indent === "tab" ? "tab" : Number(indent), sortKeys);
  }, [result, mode, indent, sortKeys]);

  const inBytes = byteLength(deferred);
  const outBytes = byteLength(output);

  return (
    <Workbench
      inputLabel="JSON input"
      outputLabel={mode === "minify" ? "Minified JSON" : "Formatted JSON"}
      input={input}
      onInput={setInput}
      output={output}
      invalid={result?.ok === false}
      fileName={mode === "minify" ? "minified.json" : "formatted.json"}
      mime="application/json"
      inputPlaceholder='Paste JSON here, e.g. {"name": "Expensico"}'
      toolbar={
        <>
          <Segmented label="Mode" value={mode} onChange={setMode} options={[{ value: "format", label: "Beautify" }, { value: "minify", label: "Minify" }]} />
          {mode === "format" && (
            <label className="flex items-center gap-2 text-sm font-medium">
              Indent
              <Select value={indent} onChange={(e) => setIndent(e.target.value as typeof indent)} className="h-10 w-32">
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
                <option value="tab">Tabs</option>
              </Select>
            </label>
          )}
          <Checkbox label="Sort keys A–Z" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} className="self-center" />
          {mode === "format" && <Segmented label="Output view" size="sm" className="ml-auto" value={view} onChange={setView} options={[{ value: "text", label: "Text" }, { value: "tree", label: "Tree" }]} />}
        </>
      }
      status={
        result === null ? null : result.ok ? (
          <Alert tone="success" role="status">
            Valid JSON · {formatBytes(inBytes)} → {formatBytes(outBytes)}
            {mode === "minify" && inBytes > 0 && ` (${Math.max(0, Math.round((1 - outBytes / inBytes) * 100))}% smaller)`}
          </Alert>
        ) : (
          <JsonIssueAlert issue={result.issue} />
        )
      }
      outputSlot={mode === "format" && view === "tree" && result?.ok ? <JsonTree value={result.value} /> : undefined}
    />
  );
}

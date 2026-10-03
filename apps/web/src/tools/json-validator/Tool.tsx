"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { InputActions, CodeArea } from "@/components/tool/Workbench";
import { JsonIssueAlert } from "@/components/tool/JsonIssueAlert";
import { Alert } from "@/components/ui/alert";
import { parseJson } from "@/lib/json-tools";

function stats(v: unknown) {
  let objects = 0, arrays = 0, values = 0, depth = 0;
  const walk = (x: unknown, d: number) => {
    depth = Math.max(depth, d);
    if (Array.isArray(x)) {
      arrays++;
      x.forEach((y) => walk(y, d + 1));
    } else if (x && typeof x === "object") {
      objects++;
      Object.values(x).forEach((y) => walk(y, d + 1));
    } else values++;
  };
  walk(v, 0);
  return { objects, arrays, values, depth };
}

const SAMPLE = `{
  "name": "Expensico",
  "free": true,
  "categories": ["PDF", "Convert", "Files", "Finance", "Productivity", "Developer"],
  "notes": { "storedIn": "browser", "uploaded": false }
}`;

/** A common mistake: a trailing comma before the closing brace. */
const ERROR_SAMPLE = SAMPLE.replace('"uploaded": false }\n}', '"uploaded": false },\n}');

export default function JsonValidator() {
  const [input, setInput] = useState(SAMPLE);
  const deferred = useDeferredValue(input);
  const result = useMemo(() => (deferred.trim() ? parseJson(deferred) : null), [deferred]);
  const s = result?.ok ? stats(result.value) : null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="json-validate" className="text-sm font-semibold">JSON to validate</label>
        <InputActions onText={setInput} onClear={() => setInput("")} accept=".json,application/json,text/plain" />
      </div>
      <CodeArea id="json-validate" label="JSON to validate" value={input} onChange={setInput} invalid={result?.ok === false} minRows={16} />
      <button type="button" onClick={() => setInput(ERROR_SAMPLE)} className="self-start text-sm font-medium text-brand hover:underline">
        Try an example with an error
      </button>
      <div aria-live="polite">
        {result === null ? (
          <p className="text-sm text-muted">Paste JSON above — it&apos;s checked as you type.</p>
        ) : result.ok && s ? (
          <Alert tone="success" title="Valid JSON">
            <span className="inline-flex flex-wrap gap-x-4 gap-y-1">
              <span>{s.objects} objects</span>
              <span>{s.arrays} arrays</span>
              <span>{s.values} values</span>
              <span>max depth {s.depth}</span>
            </span>
          </Alert>
        ) : !result.ok ? (
          <JsonIssueAlert issue={result.issue} />
        ) : null}
      </div>
      {result?.ok && (
        <p className="flex items-center gap-2 text-sm text-muted">
          <CheckCircle2 aria-hidden className="size-4 text-success" />
          Checked against RFC 8259, the JSON standard — the same rules every browser and API uses.
        </p>
      )}
    </div>
  );
}

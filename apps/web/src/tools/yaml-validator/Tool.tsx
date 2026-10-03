"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { CodeArea, InputActions, OutputActions } from "@/components/tool/Workbench";
import { StructuredError, yamlToData } from "@/lib/convert/structured";

const SAMPLE = `# docker-compose.yml
services:
  web:
    image: node:22-alpine
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
    depends_on: [db]
  db:
    image: postgres:17
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
`;

/** The same file with a common mistake: a tab used for indentation (line 12). */
const ERROR_SAMPLE = SAMPLE.replace("    volumes:", "\tvolumes:");

export default function YamlValidator() {
  const [input, setInput] = useState(SAMPLE);
  const deferred = useDeferredValue(input);
  const r = useMemo(() => {
    if (!deferred.trim()) return null;
    try {
      return { ok: true as const, json: JSON.stringify(yamlToData(deferred), null, 2) };
    } catch (e) {
      const err = e as StructuredError;
      return { ok: false as const, message: err.message, line: err.line, column: err.column };
    }
  }, [deferred]);
  const lines = deferred.split("\n");
  const hasTabs = r && !r.ok && r.line ? /\t/.test(lines[r.line - 1] ?? "") || /\t/.test(lines[r.line - 2] ?? "") : false;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="yaml-in" className="text-sm font-semibold">YAML</label>
            <InputActions onText={setInput} onClear={() => setInput("")} accept=".yaml,.yml,text/yaml,text/plain" />
          </div>
          <CodeArea id="yaml-in" label="YAML" value={input} onChange={setInput} invalid={r?.ok === false} minRows={18} />
          <button type="button" onClick={() => setInput(ERROR_SAMPLE)} className="self-start text-sm font-medium text-brand hover:underline">
            Try an example with an error
          </button>
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold">Parsed result (JSON)</span>
            <OutputActions value={r?.ok ? r.json : ""} fileName="parsed.json" mime="application/json" />
          </div>
          <CodeArea label="Parsed result" value={r?.ok ? r.json : ""} readOnly minRows={18} />
        </div>
      </div>
      <div aria-live="polite">
        {r?.ok && <Alert tone="success" title="Valid YAML">The document parsed successfully. Check the JSON on the right to confirm values were interpreted as you expect.</Alert>}
        {r && !r.ok && (
          <Alert tone="danger" role="alert" title={`Invalid YAML${r.line ? ` — line ${r.line}${r.column ? `, column ${r.column}` : ""}` : ""}`}>
            <p>{r.message}</p>
            {hasTabs && <p className="mt-1 font-medium">This line uses a tab character for indentation. YAML only allows spaces.</p>}
            {r.line && <pre className="mt-2 overflow-x-auto rounded bg-[color-mix(in_srgb,currentColor_8%,transparent)] px-2 py-1 font-mono text-xs">{(lines[r.line - 1] ?? "").replace(/\t/g, "→   ")}</pre>}
          </Alert>
        )}
      </div>
    </div>
  );
}

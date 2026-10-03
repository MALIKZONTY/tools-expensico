"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox, Input } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { CodeArea, OutputActions } from "@/components/tool/Workbench";
import { inspectUuid, uuidV4, uuidV7 } from "@/lib/dev/uuid";

export default function UuidGenerator() {
  const [version, setVersion] = useState<"4" | "7">("4");
  const [count, setCount] = useState(5);
  const [upper, setUpper] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [list, setList] = useState<string[]>([]);
  const [check, setCheck] = useState("");

  function generate() {
    const n = Math.min(1000, Math.max(1, count || 1));
    setList(Array.from({ length: n }, () => (version === "4" ? uuidV4() : uuidV7())));
  }
  // Random values must be generated in the browser after hydration (not during the server render), so this effect is intentional.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(generate, [version]);

  const out = list.map((u) => (hyphens ? u : u.replace(/-/g, ""))).map((u) => (upper ? u.toUpperCase() : u)).join("\n");
  const info = check.trim() ? inspectUuid(check) : null;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end gap-4">
          <Segmented label="UUID version" value={version} onChange={setVersion} options={[{ value: "4", label: "v4 (random)" }, { value: "7", label: "v7 (time-ordered)" }]} />
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            How many
            <Input type="number" min={1} max={1000} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-28" />
          </label>
          <Button onClick={generate}>
            <RefreshCw aria-hidden /> Generate
          </Button>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Checkbox label="Uppercase" checked={upper} onChange={(e) => setUpper(e.target.checked)} />
          <Checkbox label="Hyphens" checked={hyphens} onChange={(e) => setHyphens(e.target.checked)} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">{list.length} UUID{list.length === 1 ? "" : "s"}</span>
          <OutputActions value={out} fileName="uuids.txt" />
        </div>
        <CodeArea label="Generated UUIDs" value={out} readOnly minRows={Math.min(12, Math.max(4, list.length))} />
      </section>
      <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold">Validate or inspect a UUID</h2>
        <Input aria-label="UUID to inspect" value={check} onChange={(e) => setCheck(e.target.value)} placeholder="e.g. 0192d4f8-3b6a-7c41-9d2e-5f8a1b3c4d5e" className="font-mono" />
        {info &&
          (info.valid ? (
            <Alert tone="success" title="Valid UUID">
              Version {info.version} · variant {info.variant}
              {info.timestamp && ` · created ${info.timestamp.toLocaleString()}`}
            </Alert>
          ) : (
            <Alert tone="danger" title="Not a valid UUID">A UUID has 32 hexadecimal digits in the pattern 8-4-4-4-12.</Alert>
          ))}
      </section>
    </div>
  );
}

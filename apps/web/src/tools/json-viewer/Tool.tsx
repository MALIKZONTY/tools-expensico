"use client";

import { useMemo, useState } from "react";
import { ChevronsDownUp, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { JsonIssueAlert } from "@/components/tool/JsonIssueAlert";
import { JsonTree } from "@/components/tool/JsonTree";
import { CodeArea, OutputActions } from "@/components/tool/Workbench";
import { ToolErrorAlert } from "@/components/tool/ToolErrorAlert";
import { readTextFile } from "@/lib/files/text";
import { ToolError } from "@/lib/files/errors";
import { formatBytes } from "@/lib/format";
import { parseJson } from "@/lib/json-tools";

const MAX = 50 * 1024 * 1024;

export default function JsonViewer() {
  const [text, setText] = useState("");
  const [name, setName] = useState("data.json");
  const [source, setSource] = useState<"file" | "paste">("file");
  const [search, setSearch] = useState("");
  const [depth, setDepth] = useState(2);
  const [treeKey, setTreeKey] = useState(0);
  const [fileError, setFileError] = useState<ToolError | null>(null);
  const parsed = useMemo(() => (text.trim() ? parseJson(text) : null), [text]);

  async function onFiles(files: File[]) {
    const f = files[0];
    setFileError(null);
    if (f.size > MAX) {
      setFileError(new ToolError("too-large", `${f.name} is ${formatBytes(f.size)}. The limit is ${formatBytes(MAX, 0)}.`));
      return;
    }
    const d = await readTextFile(f);
    setName(f.name);
    setText(d.text);
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      {!parsed?.ok && (
        <>
          <Segmented label="Input" size="sm" value={source} onChange={setSource} options={[{ value: "file", label: "Open file" }, { value: "paste", label: "Paste JSON" }]} />
          {source === "file" ? (
            <FileDropzone accept={["json"]} maxBytes={MAX} onFiles={onFiles} label="Choose a JSON file" />
          ) : (
            <CodeArea label="JSON input" value={text} onChange={setText} placeholder="Paste JSON here" />
          )}
          {fileError && <ToolErrorAlert error={fileError} />}
          {parsed && !parsed.ok && <JsonIssueAlert issue={parsed.issue} />}
        </>
      )}
      {parsed?.ok && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-48 flex-1">
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
              <Input aria-label="Search keys and values" placeholder="Search keys and values" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button variant="secondary" size="sm" onClick={() => { setDepth(99); setTreeKey((k) => k + 1); }}>
              <ChevronsUpDown aria-hidden /> Expand all
            </Button>
            <Button variant="secondary" size="sm" onClick={() => { setDepth(1); setTreeKey((k) => k + 1); }}>
              <ChevronsDownUp aria-hidden /> Collapse
            </Button>
            <OutputActions value={JSON.stringify(parsed.value, null, 2)} fileName={name} mime="application/json" />
            <Button variant="ghost" size="sm" onClick={() => { setText(""); setSearch(""); }}>
              Open another
            </Button>
          </div>
          <div className="max-h-[70vh] overflow-auto">
            <JsonTree key={treeKey} value={parsed.value} defaultDepth={depth} search={search} />
          </div>
          <p className="text-xs text-muted">Hover a row and use the copy icon to copy its JSONPath. Large arrays load in pages to stay fast.</p>
        </>
      )}
    </div>
  );
}

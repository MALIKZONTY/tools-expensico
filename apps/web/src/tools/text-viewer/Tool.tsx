"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Checkbox, Input } from "@/components/ui/field";
import { OutputActions } from "@/components/tool/Workbench";
import { ViewerShell } from "@/components/tool/TextFileViewerShell";
import { useSingleFile } from "@/components/tool/use-single-file";
import { readTextFile } from "@/lib/files/text";
import { cn } from "@/lib/cn";

const MAX = 100 * 1024 * 1024;
const PAGE = 2000;

export default function TextViewer() {
  const [wrap, setWrap] = useState(true);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const q = useDeferredValue(query.trim().toLowerCase());
  const load = useCallback(async (file: File) => {
    const d = await readTextFile(file);
    return { lines: d.text.split(/\r?\n/), encoding: d.encoding, warning: d.warning, crlf: d.text.includes("\r\n") };
  }, []);
  const s = useSingleFile("text-viewer", ["txt", "csv", "tsv", "json", "xml", "yaml", "md", "html", "svg"], MAX, load);

  const shown = useMemo(() => {
    if (!s.data) return [];
    const all = s.data.lines.map((text, i) => ({ n: i + 1, text }));
    return q ? all.filter((l) => l.text.toLowerCase().includes(q)) : all;
  }, [s.data, q]);

  return (
    <ViewerShell
      accept={["txt", "md", "csv", "json", "xml", "yaml", "html"]}
      maxBytes={MAX}
      label="Choose a text file"
      file={s.file}
      loading={s.loading}
      error={s.error}
      onFile={(f) => { setLimit(PAGE); void s.open(f); }}
      onReset={s.reset}
      meta={s.data ? `${s.data.lines.length.toLocaleString("en-IN")} lines · ${s.data.encoding.toUpperCase()}${s.data.crlf ? " · CRLF" : ""}` : undefined}
    >
      {s.data && (
        <>
          {s.data.warning && <Alert tone="warning">{s.data.warning}</Alert>}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-48 flex-1">
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
              <Input aria-label="Filter lines" placeholder="Show only lines containing…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 pl-9" />
            </div>
            <Checkbox label="Wrap long lines" checked={wrap} onChange={(e) => setWrap(e.target.checked)} />
            <OutputActions value={s.data.lines.join("\n")} fileName={s.file?.name ?? "file.txt"} />
          </div>
          {q && <p className="text-sm text-muted" aria-live="polite">{shown.length.toLocaleString("en-IN")} matching line{shown.length === 1 ? "" : "s"}</p>}
          <div className="max-h-[70vh] overflow-auto rounded-lg border border-border bg-bg font-mono text-[13px] leading-relaxed">
            <table className="w-full border-collapse">
              <tbody>
                {shown.slice(0, limit).map((l) => (
                  <tr key={l.n} className="align-top hover:bg-surface-2">
                    <td className="w-12 select-none border-r border-border px-2 text-right text-xs leading-[1.6rem] text-subtle">{l.n}</td>
                    <td className={cn("px-3", wrap ? "whitespace-pre-wrap break-all" : "whitespace-pre")}>{l.text || " "}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {shown.length > limit && (
            <button type="button" onClick={() => setLimit((x) => x + PAGE * 5)} className="self-start text-sm font-medium text-brand hover:underline">
              Show more ({(shown.length - limit).toLocaleString("en-IN")} lines remaining)
            </button>
          )}
        </>
      )}
    </ViewerShell>
  );
}

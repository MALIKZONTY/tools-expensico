"use client";

import { useCallback, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { JsonTree } from "@/components/tool/JsonTree";
import { CodeArea, OutputActions } from "@/components/tool/Workbench";
import { ViewerShell } from "@/components/tool/TextFileViewerShell";
import { useSingleFile } from "@/components/tool/use-single-file";
import { StructuredError, xmlToJson } from "@/lib/convert/structured";
import { formatXml } from "@/lib/dev/xml-format";
import { readTextFile } from "@/lib/files/text";
import { ToolError } from "@/lib/files/errors";

const MAX = 50 * 1024 * 1024;

export default function XmlViewer() {
  const [view, setView] = useState<"tree" | "source">("tree");
  const [search, setSearch] = useState("");
  const load = useCallback(async (file: File) => {
    const { text } = await readTextFile(file);
    try {
      const tree = xmlToJson(text);
      return { tree, pretty: formatXml(text) };
    } catch (e) {
      const err = e as StructuredError;
      throw new ToolError("invalid-format", `${err.message}${err.line ? ` (line ${err.line}, column ${err.column})` : ""}`, { title: "This XML isn't well-formed" });
    }
  }, []);
  const s = useSingleFile("xml-viewer", ["xml", "svg"], MAX, load);

  return (
    <ViewerShell accept={["xml", "svg"]} maxBytes={MAX} label="Choose an XML file" file={s.file} loading={s.loading} error={s.error} onFile={s.open} onReset={s.reset}>
      {s.data && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Segmented label="View" size="sm" value={view} onChange={setView} options={[{ value: "tree", label: "Tree" }, { value: "source", label: "Formatted source" }]} />
            {view === "tree" && (
              <div className="relative min-w-48 flex-1">
                <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
                <Input aria-label="Search elements and values" placeholder="Search elements, attributes and text" value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 pl-9" />
              </div>
            )}
            <div className="ml-auto"><OutputActions value={s.data.pretty} fileName={s.file?.name ?? "formatted.xml"} mime="application/xml" /></div>
          </div>
          {view === "tree" ? (
            <div className="max-h-[70vh] overflow-auto"><JsonTree value={s.data.tree} search={search} /></div>
          ) : (
            <CodeArea label="Formatted XML" value={s.data.pretty} readOnly minRows={24} />
          )}
          <p className="text-xs text-muted">In the tree, attributes appear with an @ prefix and element text as #text.</p>
        </>
      )}
    </ViewerShell>
  );
}

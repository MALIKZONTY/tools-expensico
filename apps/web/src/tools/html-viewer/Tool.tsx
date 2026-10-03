"use client";

import { useCallback, useEffect, useState } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { Checkbox } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { CodeArea, OutputActions } from "@/components/tool/Workbench";
import { ViewerShell } from "@/components/tool/TextFileViewerShell";
import { useSingleFile } from "@/components/tool/use-single-file";
import { readTextFile } from "@/lib/files/text";
import { prettierFormat } from "@/lib/dev/prettier";

const MAX = 20 * 1024 * 1024;
const OFFLINE_CSP = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; font-src data:; media-src data: blob:">`;

function withCsp(html: string, allowRemote: boolean) {
  if (allowRemote) return html;
  // Inject a restrictive CSP as the very first thing in the document.
  return /<head[^>]*>/i.test(html) ? html.replace(/<head([^>]*)>/i, `<head$1>${OFFLINE_CSP}`) : OFFLINE_CSP + html;
}

export default function HtmlViewer() {
  const [view, setView] = useState<"preview" | "source">("preview");
  const [device, setDevice] = useState<"desktop" | "tablet" | "phone">("desktop");
  const [remote, setRemote] = useState(false);
  const [prettyResult, setPrettyResult] = useState<{ source: string; html: string } | null>(null);
  const load = useCallback(async (file: File) => (await readTextFile(file)).text, []);
  const s = useSingleFile("html-viewer", ["html", "txt", "svg", "xml"], MAX, load);

  const pretty = prettyResult && prettyResult.source === s.data ? prettyResult.html : null;

  useEffect(() => {
    const source = s.data;
    if (source === null || view !== "source") return;
    let alive = true;
    prettierFormat(source, "html")
      .then((html) => alive && setPrettyResult({ source, html }))
      .catch(() => alive && setPrettyResult({ source, html: source }));
    return () => {
      alive = false;
    };
  }, [s.data, view]);

  const width = device === "phone" ? 390 : device === "tablet" ? 820 : "100%";

  return (
    <ViewerShell accept={["html"]} maxBytes={MAX} label="Choose an HTML file" file={s.file} loading={s.loading} error={s.error} onFile={s.open} onReset={s.reset}>
      {s.data !== null && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Segmented label="View" size="sm" value={view} onChange={setView} options={[{ value: "preview", label: "Preview" }, { value: "source", label: "Source" }]} />
            {view === "preview" && (
              <>
                <Segmented label="Device width" size="sm" value={device} onChange={setDevice} options={[{ value: "desktop", label: <Monitor aria-label="Desktop" className="size-4" /> }, { value: "tablet", label: <Tablet aria-label="Tablet" className="size-4" /> }, { value: "phone", label: <Smartphone aria-label="Phone" className="size-4" /> }]} />
                <Checkbox label="Load remote images and styles" checked={remote} onChange={(e) => setRemote(e.target.checked)} />
              </>
            )}
            {view === "source" && <div className="ml-auto"><OutputActions value={pretty ?? s.data} fileName={s.file?.name ?? "page.html"} mime="text/html" /></div>}
          </div>
          {view === "preview" ? (
            <div className="overflow-x-auto rounded-lg border border-border bg-surface-3 p-2">
              <iframe
                key={`${remote}`}
                title={`Preview of ${s.file?.name}`}
                sandbox=""
                referrerPolicy="no-referrer"
                srcDoc={withCsp(s.data, remote)}
                className="mx-auto h-[70vh] rounded bg-white"
                style={{ width, maxWidth: "100%" }}
              />
            </div>
          ) : (
            <CodeArea label="HTML source" value={pretty ?? "Formatting…"} readOnly minRows={24} />
          )}
          <p className="text-xs text-muted">The preview runs in a sandbox: scripts, forms and navigation are disabled. Remote resources are blocked unless you allow them, so previewing doesn&apos;t contact other websites.</p>
        </>
      )}
    </ViewerShell>
  );
}

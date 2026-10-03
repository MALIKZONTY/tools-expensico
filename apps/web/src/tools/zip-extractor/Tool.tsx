"use client";

import { useMemo, useState } from "react";
import { Download, FileArchive, Folder, Search } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Spinner } from "@/components/ui/progress";
import { FileChip } from "@/components/tool/FileChip";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolErrorAlert } from "@/components/tool/ToolErrorAlert";
import { downloadBlob } from "@/lib/files/download";
import { ToolError, toToolError } from "@/lib/files/errors";
import { formatBytes, sanitizeFilename } from "@/lib/format";
import type JSZip from "jszip";

const MAX_ARCHIVE = 500 * 1024 * 1024;
/** Zip-bomb guards: total uncompressed size, entry count and compression ratio. */
const MAX_UNCOMPRESSED = 2 * 1024 * 1024 * 1024;
const MAX_ENTRIES = 20_000;
const MAX_RATIO = 200;

interface Entry {
  path: string;
  dir: boolean;
  size: number;
  compressed: number;
  date: Date;
  obj: JSZip.JSZipObject;
}

export default function ZipExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<ToolError | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function open(f: File) {
    setError(null);
    setEntries(null);
    setLoading(true);
    try {
      if (f.size > MAX_ARCHIVE) throw new ToolError("too-large", `The limit is ${formatBytes(MAX_ARCHIVE, 0)}.`);
      const { default: JSZipLib } = await import("jszip");
      const zip = await JSZipLib.loadAsync(f);
      const list: Entry[] = [];
      let total = 0;
      zip.forEach((path, obj) => {
        const data = (obj as unknown as { _data?: { uncompressedSize?: number; compressedSize?: number } })._data;
        const size = data?.uncompressedSize ?? 0;
        total += size;
        list.push({ path, dir: obj.dir, size, compressed: data?.compressedSize ?? 0, date: obj.date, obj });
      });
      if (list.length > MAX_ENTRIES) throw new ToolError("too-many-files", `This archive has ${list.length.toLocaleString()} entries; the limit is ${MAX_ENTRIES.toLocaleString()}.`);
      if (total > MAX_UNCOMPRESSED || (f.size > 0 && total / f.size > MAX_RATIO && total > 100 * 1024 * 1024)) {
        throw new ToolError("too-large", `It would expand to ${formatBytes(total)}. Archives that expand this much can freeze your browser (a “zip bomb”), so it wasn't opened.`, { title: "This archive expands to an unsafe size" });
      }
      setFile(f);
      setEntries(list.sort((a, b) => a.path.localeCompare(b.path)));
    } catch (e) {
      const err = toToolError(e);
      setError(err.code === "unknown" ? new ToolError("corrupted", "This doesn't look like a valid ZIP archive, or it uses an unsupported feature such as encryption.") : err);
    } finally {
      setLoading(false);
    }
  }

  const files = useMemo(() => (entries ?? []).filter((e) => !e.dir && (!q || e.path.toLowerCase().includes(q.toLowerCase()))), [entries, q]);
  const total = (entries ?? []).reduce((n, e) => n + e.size, 0);

  async function getOne(e: Entry) {
    setBusy(e.path);
    try {
      const blob = await e.obj.async("blob");
      downloadBlob(blob, sanitizeFilename(e.path.split("/").pop() || "file"));
    } catch (err) {
      setError(toToolError(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      {!entries ? (
        <FileDropzone accept={["zip", "docx", "xlsx", "pptx", "odt", "ods", "odp"]} maxBytes={MAX_ARCHIVE} onFiles={([f]) => open(f)} disabled={loading} label="Choose a ZIP file" />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <FileChip className="min-w-0 flex-1" file={file!} meta={`${files.length} files · ${formatBytes(total)} uncompressed`} />
          <Button variant="ghost" size="sm" onClick={() => { setEntries(null); setFile(null); }}>Open another</Button>
        </div>
      )}
      {loading && <Spinner label="Reading archive" />}
      {error && <ToolErrorAlert error={error} />}
      {entries && (
        <>
          {entries.some((e) => /(^|\/)\.\.(\/|$)|^\//.test(e.path)) && <Alert tone="warning">Some paths in this archive try to point outside its folder (“../”). That&apos;s a sign of a malicious archive; the files are still only downloaded individually with safe names.</Alert>}
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input aria-label="Filter files" placeholder="Filter files" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <div className="table-scroll max-h-[60vh] overflow-y-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <caption className="sr-only">Files in the archive</caption>
              <thead className="sticky top-0 bg-surface-2 text-left text-muted">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">Name</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Size</th>
                  <th scope="col" className="hidden px-3 py-2 text-right font-medium sm:table-cell">Modified</th>
                  <th scope="col" className="px-3 py-2"><span className="sr-only">Download</span></th>
                </tr>
              </thead>
              <tbody>
                {files.slice(0, 2000).map((e) => {
                  const parts = e.path.split("/");
                  return (
                    <tr key={e.path} className="border-t border-border">
                      <td className="max-w-[24rem] px-3 py-2">
                        <span className="flex items-center gap-1.5">
                          {parts.length > 1 && <Folder aria-hidden className="size-3.5 shrink-0 text-subtle" />}
                          <span className="truncate" title={e.path}>{parts.length > 1 && <span className="text-subtle">{parts.slice(0, -1).join("/")}/</span>}{parts[parts.length - 1]}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatBytes(e.size)}</td>
                      <td className="hidden px-3 py-2 text-right text-muted sm:table-cell">{e.date?.toLocaleDateString("en-IN")}</td>
                      <td className="px-2 py-1 text-right">
                        <Button size="icon-sm" variant="ghost" loading={busy === e.path} onClick={() => getOne(e)} aria-label={`Download ${e.path}`}>{busy !== e.path && <Download aria-hidden />}</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {files.length > 2000 && <p className="text-xs text-muted">Showing the first 2,000 files — use the filter to find others.</p>}
          <p className="flex items-center gap-2 text-sm text-muted"><FileArchive aria-hidden className="size-4" /> Files are extracted one at a time, only when you download them.</p>
        </>
      )}
    </div>
  );
}

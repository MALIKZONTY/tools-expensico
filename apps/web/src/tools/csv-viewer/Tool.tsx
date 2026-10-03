"use client";

import { useCallback } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/progress";
import { DataGrid } from "@/components/tool/DataGrid";
import { FileChip } from "@/components/tool/FileChip";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolErrorAlert } from "@/components/tool/ToolErrorAlert";
import { useSingleFile } from "@/components/tool/use-single-file";
import { parseCsvAsync } from "@/lib/convert/parse-csv-async";
import { uniqueHeaders } from "@/lib/convert/table";
import { readTextFile } from "@/lib/files/text";
import { ToolError } from "@/lib/files/errors";

const MAX = 200 * 1024 * 1024;
const DELIMS: Record<string, string> = { ",": "comma", ";": "semicolon", "\t": "tab", "|": "pipe" };

export default function CsvViewer() {
  const load = useCallback(async (file: File) => {
    const decoded = await readTextFile(file);
    const parsed = await parseCsvAsync(decoded.text);
    if (!parsed.rows.length) throw new ToolError("empty", "The file has no rows.");
    return { header: uniqueHeaders(parsed.rows[0]), rows: parsed.rows.slice(1), delimiter: parsed.delimiter, problems: parsed.problems, encodingWarning: decoded.warning };
  }, []);
  const s = useSingleFile("csv-viewer", ["csv", "tsv", "txt"], MAX, load);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      {!s.data ? (
        <FileDropzone accept={["csv", "tsv"]} maxBytes={MAX} onFiles={([f]) => s.open(f)} disabled={s.loading} label="Choose a CSV file" />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <FileChip className="min-w-0 flex-1" file={s.file!} meta={`${DELIMS[s.data.delimiter] ?? "custom"}-separated`} />
          <Button variant="ghost" size="sm" onClick={s.reset}>Open another</Button>
        </div>
      )}
      {s.loading && <Spinner label="Reading file" />}
      {s.error && <ToolErrorAlert error={s.error} />}
      {s.data && (
        <>
          {s.data.encodingWarning && <Alert tone="warning">{s.data.encodingWarning}</Alert>}
          {s.data.problems.length > 0 && (
            <Alert tone="warning" title="Some rows may be malformed">
              <ul className="list-disc pl-4">{s.data.problems.slice(0, 5).map((p) => <li key={p}>{p}</li>)}</ul>
              {s.data.problems.length > 5 && <p>…and {s.data.problems.length - 5} more.</p>}
            </Alert>
          )}
          <DataGrid header={s.data.header} rows={s.data.rows} fileName={s.file!.name} />
        </>
      )}
    </div>
  );
}

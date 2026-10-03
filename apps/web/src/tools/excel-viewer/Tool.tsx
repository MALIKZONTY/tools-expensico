"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/progress";
import { Tabs } from "@/components/ui/tabs";
import { Alert } from "@/components/ui/alert";
import { DataGrid } from "@/components/tool/DataGrid";
import { FileChip } from "@/components/tool/FileChip";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolErrorAlert } from "@/components/tool/ToolErrorAlert";
import { useSingleFile } from "@/components/tool/use-single-file";
import { readWorkbook, sheetToDisplayRows } from "@/lib/sheets";
import { uniqueHeaders } from "@/lib/convert/table";

const MAX = 100 * 1024 * 1024;

interface SheetData {
  name: string;
  header: string[];
  rows: string[][];
  hidden: boolean;
  merges: number;
  formulas: number;
}

export default function ExcelViewer() {
  const [active, setActive] = useState(0);
  const load = useCallback(async (file: File) => {
    const { XLSX, wb } = await readWorkbook(file);
    return wb.SheetNames.map((name, i): SheetData => {
      const ws = wb.Sheets[name];
      const rows = sheetToDisplayRows(XLSX, ws);
      let formulas = 0;
      const dense = (ws as unknown as { "!data"?: ({ f?: string } | undefined)[][] })["!data"];
      dense?.forEach((r) => r?.forEach((c) => c?.f && formulas++));
      return {
        name,
        header: rows.length ? uniqueHeaders(rows[0].map((h, j) => h || `Column ${j + 1}`)) : [],
        rows: rows.slice(1),
        hidden: Boolean(wb.Workbook?.Sheets?.[i]?.Hidden),
        merges: ws["!merges"]?.length ?? 0,
        formulas,
      };
    });
  }, []);
  const s = useSingleFile("excel-viewer", ["xlsx", "xls", "ods"], MAX, load);
  const sheet = s.data?.[Math.min(active, (s.data?.length ?? 1) - 1)];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      {!s.data ? (
        <FileDropzone accept={["xlsx", "xls", "ods"]} maxBytes={MAX} onFiles={([f]) => { setActive(0); void s.open(f); }} disabled={s.loading} label="Choose a spreadsheet" />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <FileChip className="min-w-0 flex-1" file={s.file!} meta={`${s.data.length} sheet${s.data.length === 1 ? "" : "s"}`} />
          <Button variant="ghost" size="sm" onClick={s.reset}>Open another</Button>
        </div>
      )}
      {s.loading && <Spinner label="Reading workbook" />}
      {s.error && <ToolErrorAlert error={s.error} />}
      {s.data && sheet && (
        <>
          {s.data.length > 1 && (
            <Tabs label="Sheets" value={String(active)} onChange={(v) => setActive(Number(v))} items={s.data.map((sh, i) => ({ value: String(i), label: <>{sh.name}{sh.hidden && <span className="text-xs text-subtle">(hidden)</span>}</> }))} />
          )}
          {(sheet.formulas > 0 || sheet.merges > 0) && (
            <Alert tone="info">
              {sheet.formulas > 0 && `${sheet.formulas} formula cell${sheet.formulas === 1 ? "" : "s"} shown as their last calculated values. `}
              {sheet.merges > 0 && `${sheet.merges} merged range${sheet.merges === 1 ? "" : "s"}: values appear in the top-left cell.`}
            </Alert>
          )}
          {sheet.header.length ? <DataGrid key={active} header={sheet.header} rows={sheet.rows} fileName={`${s.file!.name.replace(/\.[^.]+$/, "")}-${sheet.name}.csv`} /> : <p className="text-sm text-muted">This sheet is empty.</p>}
        </>
      )}
    </div>
  );
}

/**
 * Spreadsheet reading via SheetJS (lazy-loaded). Shared by the Excel viewer and converters.
 */

import type { WorkBook, WorkSheet } from "xlsx";
import { ToolError, toToolError } from "@/lib/files/errors";

export type XLSXModule = typeof import("xlsx");

let xlsxPromise: Promise<XLSXModule> | null = null;
export function loadXlsx(): Promise<XLSXModule> {
  xlsxPromise ??= import("xlsx");
  return xlsxPromise;
}

export async function readWorkbook(file: Blob): Promise<{ XLSX: XLSXModule; wb: WorkBook }> {
  const XLSX = await loadXlsx();
  try {
    const wb = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true, cellNF: true, dense: true });
    if (!wb.SheetNames.length) throw new ToolError("empty", "The workbook contains no sheets.");
    return { XLSX, wb };
  } catch (err) {
    if (err instanceof ToolError) throw err;
    const msg = (err as Error)?.message ?? "";
    if (/password|encrypt/i.test(msg)) throw new ToolError("encrypted");
    const e = toToolError(err);
    if (e.code === "unknown") throw new ToolError("corrupted", "The spreadsheet couldn't be read. It may be damaged or saved in an unsupported format.");
    throw e;
  }
}

/** Formatted (displayed) values, as strings — what the user sees in Excel. */
export function sheetToDisplayRows(XLSX: XLSXModule, ws: WorkSheet): string[][] {
  return XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, raw: false, defval: "", blankrows: false });
}

function isoDate(d: Date): string {
  // SheetJS returns dates in local time; keep date-only values compact.
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0) return date;
  return `${date}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** Typed values: numbers and booleans stay typed, dates become ISO strings, blanks are null. */
export function sheetToTypedRows(XLSX: XLSXModule, ws: WorkSheet): (string | number | boolean | null)[][] {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: true, defval: null, blankrows: false });
  return rows.map((r) =>
    r.map((v) => {
      if (v instanceof Date) return isoDate(v);
      if (v === undefined) return null;
      return v as string | number | boolean | null;
    }),
  );
}

export function sheetDimensions(XLSX: XLSXModule, ws: WorkSheet): { rows: number; cols: number } {
  if (!ws["!ref"]) return { rows: 0, cols: 0 };
  const r = XLSX.utils.decode_range(ws["!ref"]);
  return { rows: r.e.r - r.s.r + 1, cols: r.e.c - r.s.c + 1 };
}

import { ToolError } from "@/lib/files/errors";
import { detectFile } from "@/lib/files/detect";
import { readTextFile } from "@/lib/files/text";
import { stripExtension } from "@/lib/format";
import { loadXlsx, readWorkbook, sheetToDisplayRows, sheetToTypedRows, type XLSXModule } from "@/lib/sheets";
import {
  cellToString,
  flattenJson,
  htmlDocument,
  inferScalar,
  keepAsText,
  parseCsvText,
  rowsToObjects,
  toCsv,
  toHtmlTable,
  toTextTable,
  uniqueHeaders,
  type Cell,
  type TextTableStyle,
} from "@/lib/convert/table";
import type { FormatId } from "@/lib/convert/formats";
import type { BrowserImplementation, OptionValues, OutputFile } from "@/lib/processing/types";

/** Normalised intermediate form: one or more named sheets of rows. */
interface Sheet {
  name: string;
  /** Header row, if the source has one. */
  header: string[] | null;
  /** Display strings (CSV/TXT/HTML outputs). */
  display: string[][];
  /** Typed values (JSON/XLSX outputs). */
  typed: Cell[][];
}

async function fromText(file: File, options: OptionValues, warnings: string[]): Promise<Sheet[]> {
  const decoded = await readTextFile(file);
  if (decoded.warning) warnings.push(decoded.warning);
  const parsed = parseCsvText(decoded.text);
  warnings.push(...parsed.problems);
  if (!parsed.rows.length) throw new ToolError("empty", "No rows were found in this file.");
  const hasHeader = options.header !== false;
  const header = hasHeader ? uniqueHeaders(parsed.rows[0]) : null;
  const body = hasHeader ? parsed.rows.slice(1) : parsed.rows;
  return [{ name: stripExtension(file.name), header, display: body, typed: body.map((r) => r.map((v) => (keepAsText(v) ? (v === "" ? null : v) : inferScalar(v)))) }];
}

async function fromJson(file: File, warnings: string[]): Promise<Sheet[]> {
  const decoded = await readTextFile(file);
  if (decoded.warning) warnings.push(decoded.warning);
  let data: unknown;
  try {
    data = JSON.parse(decoded.text);
  } catch (err) {
    throw new ToolError("invalid-format", `The JSON isn't valid: ${(err as Error).message}`, { title: "Invalid JSON" });
  }
  const { columns, rows } = flattenJson(data);
  if (!rows.length) throw new ToolError("empty", "The JSON contains no records to convert.");
  return [{ name: stripExtension(file.name), header: columns, display: rows.map((r) => r.map(cellToString)), typed: rows }];
}

async function fromWorkbook(file: File, options: OptionValues): Promise<{ sheets: Sheet[]; XLSX: XLSXModule; wb: import("xlsx").WorkBook }> {
  const { XLSX, wb } = await readWorkbook(file);
  const names = options.sheets === "first" ? wb.SheetNames.slice(0, 1) : wb.SheetNames;
  const hasHeader = options.header !== false;
  const sheets = names.map((name) => {
    const ws = wb.Sheets[name];
    const display = sheetToDisplayRows(XLSX, ws);
    const typed = sheetToTypedRows(XLSX, ws);
    return {
      name,
      header: hasHeader && display.length ? uniqueHeaders(display[0]) : null,
      display: hasHeader ? display.slice(1) : display,
      typed: hasHeader ? typed.slice(1) : typed,
    };
  });
  return { sheets, XLSX, wb };
}

function safeSheetFileName(base: string, sheet: string, count: number, ext: string) {
  return count > 1 ? `${base} - ${sheet.replace(/[\\/:*?"<>|]/g, "_")}.${ext}` : `${base}.${ext}`;
}

async function writeXlsx(sheets: Sheet[]): Promise<Blob> {
  const XLSX = await loadXlsx();
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    const rows: Cell[][] = s.header ? [s.header, ...s.typed] : s.typed;
    const ws = XLSX.utils.aoa_to_sheet(rows, { cellDates: false });
    // Force text cells for values that must not be reinterpreted (leading zeros, long IDs).
    s.display.forEach((r, ri) =>
      r.forEach((v, ci) => {
        if (v !== "" && keepAsText(v)) {
          const ref = XLSX.utils.encode_cell({ r: ri + (s.header ? 1 : 0), c: ci });
          ws[ref] = { t: "s", v };
        }
      }),
    );
    const widths = (rows[0] ?? []).map((_, c) => Math.min(60, Math.max(6, ...rows.slice(0, 500).map((r) => cellToString(r[c]).length + 1))));
    ws["!cols"] = widths.map((wch) => ({ wch }));
    XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31).replace(/[\\/?*[\]:]/g, "_") || "Sheet1");
  }
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array", compression: true }) as ArrayBuffer;
  return new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

export const tableConvert: BrowserImplementation = async (def, { files, options, onProgress }) => {
  const file = files[0];
  const warnings: string[] = [];
  onProgress({ label: "Reading file…" });
  const detected = await detectFile(file);
  const source = (detected.format ?? def.from) as FormatId;
  const base = stripExtension(file.name);
  const to = def.to;

  // Workbook → workbook keeps formulas and formats, so convert directly.
  if (to === "xlsx" && (source === "xls" || source === "ods" || source === "xlsx")) {
    const { XLSX, wb } = await readWorkbook(file);
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array", compression: true }) as ArrayBuffer;
    return {
      files: [{ name: `${base}.xlsx`, blob: new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), preview: "none", meta: `${wb.SheetNames.length} sheet${wb.SheetNames.length === 1 ? "" : "s"}`, sourceSize: file.size }],
      warnings: ["Macros, charts and pivot tables are not carried over."],
    };
  }

  let sheets: Sheet[];
  let workbook: { XLSX: XLSXModule; wb: import("xlsx").WorkBook } | null = null;
  if (source === "json") sheets = await fromJson(file, warnings);
  else if (source === "csv" || source === "tsv" || source === "txt") sheets = await fromText(file, options, warnings);
  else {
    const r = await fromWorkbook(file, options);
    sheets = r.sheets;
    workbook = { XLSX: r.XLSX, wb: r.wb };
  }
  onProgress({ label: "Converting…" });

  const outputs: OutputFile[] = [];
  const nonEmpty = sheets.filter((s) => s.display.length || s.header);
  if (!nonEmpty.length) throw new ToolError("empty", "There's no data to convert.");

  switch (to) {
    case "csv": {
      const delimiter = String(options.delimiter ?? ",");
      const bom = options.bom === true ? "﻿" : "";
      for (const s of nonEmpty) {
        const text = bom + toCsv(s.header ? [s.header, ...s.display] : s.display, delimiter) + "\r\n";
        outputs.push({ name: safeSheetFileName(base, s.name, nonEmpty.length, "csv"), blob: new Blob([text], { type: "text/csv;charset=utf-8" }), preview: "table", meta: `${s.display.length} rows` });
      }
      break;
    }
    case "json": {
      const indent = Number(options.indent ?? 2);
      const typed = options.typed !== false;
      const toRecords = (s: Sheet) => {
        if (!s.header) return typed ? s.typed : s.display;
        return source === "csv" || source === "tsv" || source === "txt"
          ? rowsToObjects(s.header, s.display, typed)
          : s.typed.map((row) => Object.fromEntries(s.header!.map((h, i) => [h, row[i] ?? null])));
      };
      const data = nonEmpty.length === 1 || options.sheets === "first" ? toRecords(nonEmpty[0]) : Object.fromEntries(nonEmpty.map((s) => [s.name, toRecords(s)]));
      const text = JSON.stringify(data, null, indent || undefined);
      outputs.push({ name: `${base}.json`, blob: new Blob([text + "\n"], { type: "application/json" }), preview: "text" });
      break;
    }
    case "xlsx": {
      outputs.push({ name: `${base}.xlsx`, blob: await writeXlsx(nonEmpty), preview: "none", meta: `${nonEmpty.reduce((n, s) => n + s.display.length, 0)} rows` });
      break;
    }
    case "html": {
      let body: string;
      if (workbook) {
        // SheetJS keeps merged cells (rowspan/colspan); its output escapes cell text.
        body = nonEmpty
          .map((s) => `<h2>${s.name.replace(/[<>&"]/g, "")}</h2>\n${workbook!.XLSX.utils.sheet_to_html(workbook!.wb.Sheets[s.name], { header: "", footer: "" })}`)
          .join("\n");
        const { default: DOMPurify } = await import("dompurify");
        body = DOMPurify.sanitize(body, { FORBID_ATTR: ["style", "id"] });
      } else {
        body = nonEmpty.map((s) => toHtmlTable(s.header, s.display)).join("\n");
      }
      const full = options.fullDocument !== false;
      const html = full ? htmlDocument(base, body) : body + "\n";
      outputs.push({ name: `${base}.html`, blob: new Blob([html], { type: "text/html;charset=utf-8" }), preview: full ? "html" : "text" });
      break;
    }
    case "txt": {
      const fromSheetFile = Boolean(workbook);
      const text = nonEmpty
        .map((s) => {
          const table = fromSheetFile
            ? (s.header ? [s.header, ...s.display] : s.display).map((r) => r.map((v) => v.replace(/[\t\r\n]+/g, " ")).join("\t")).join("\n")
            : toTextTable(s.header, s.display, String(options.style ?? "markdown") as TextTableStyle);
          return nonEmpty.length > 1 ? `## ${s.name}\n\n${table}` : table;
        })
        .join("\n\n");
      outputs.push({ name: `${base}.txt`, blob: new Blob([text + "\n"], { type: "text/plain;charset=utf-8" }), preview: "text" });
      break;
    }
    default:
      throw new ToolError("unsupported");
  }
  onProgress({ value: 1, label: "Done" });
  return { files: outputs, warnings: [...new Set(warnings)] };
};

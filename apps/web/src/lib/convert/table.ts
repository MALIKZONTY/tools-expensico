/**
 * Pure helpers for tabular data: CSV parsing/serialising, type inference, JSON flattening
 * and plain-text / HTML table rendering. No browser APIs; covered by unit tests.
 */

import Papa from "papaparse";

export type Cell = string | number | boolean | null;

export interface ParsedCsv {
  rows: string[][];
  delimiter: string;
  /** Human-readable parse problems (row numbers are 1-based, as in a spreadsheet). */
  problems: string[];
}

export function parseCsvText(text: string, delimiter?: string): ParsedCsv {
  const clean = text.replace(/^﻿/, "");
  const result = Papa.parse<string[]>(clean, {
    delimiter: delimiter ?? "",
    delimitersToGuess: [",", ";", "\t", "|"],
    skipEmptyLines: "greedy",
  });
  const problems = result.errors.slice(0, 20).map((e) => {
    const row = typeof e.row === "number" ? ` on row ${e.row + 1}` : "";
    switch (e.code) {
      case "MissingQuotes":
        return `A quoted value isn't closed${row}. Everything after it may be merged into one cell.`;
      case "InvalidQuotes":
        return `A quote character appears inside an unquoted value${row}.`;
      case "TooManyFields":
      case "TooFewFields":
        return `Row${row} has a different number of columns from the header.`;
      case "UndetectableDelimiter":
        return "The column separator couldn't be detected, so a comma was assumed.";
      default:
        return `${e.message}${row}.`;
    }
  });
  return { rows: result.data, delimiter: result.meta.delimiter || ",", problems };
}

/** Make header names unique and non-empty: ["a", "a", ""] → ["a", "a_2", "column_3"]. */
export function uniqueHeaders(headers: string[]): string[] {
  const used = new Set<string>();
  return headers.map((h, i) => {
    const base = String(h ?? "").trim() || `column_${i + 1}`;
    let name = base;
    let n = 2;
    while (used.has(name)) name = `${base}_${n++}`;
    used.add(name);
    return name;
  });
}

const NUMBER_RE = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/;

/**
 * Convert a text cell to a JSON scalar when that is unambiguous. Values that would change
 * meaning (leading zeros, > 15 significant digits, leading +, thousands separators) stay strings.
 */
export function inferScalar(value: string): Cell {
  const v = value.trim();
  if (v === "") return null;
  if (/^(true|false)$/i.test(v)) return v.toLowerCase() === "true";
  if (NUMBER_RE.test(v)) {
    const digits = v.replace(/^-/, "").replace(/[eE].*$/, "").replace(".", "").replace(/^0+/, "");
    if (digits.length > 15) return value;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return value;
}

/** Whether a numeric-looking string must be kept as text in a spreadsheet. */
export function keepAsText(value: string): boolean {
  return typeof inferScalar(value) === "string" || /^-?0\d/.test(value.trim());
}

export function rowsToObjects(headers: string[], rows: string[][], typed: boolean): Record<string, Cell>[] {
  const keys = uniqueHeaders(headers);
  return rows.map((row) => {
    const obj: Record<string, Cell> = {};
    keys.forEach((k, i) => {
      const raw = row[i] ?? "";
      obj[k] = typed ? inferScalar(raw) : raw;
    });
    // Preserve values in extra columns rather than dropping them silently.
    for (let i = keys.length; i < row.length; i++) {
      if (row[i] !== "") obj[`column_${i + 1}`] = typed ? inferScalar(row[i]) : row[i];
    }
    return obj;
  });
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Pick the array of records out of common JSON shapes. */
export function findRecords(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (isPlainObject(data)) {
    const arrays = Object.entries(data).filter(([, v]) => Array.isArray(v) && v.length > 0 && v.every(isPlainObject));
    if (arrays.length === 1) return arrays[0][1] as unknown[];
    return [data];
  }
  return [data];
}

function flattenInto(value: unknown, prefix: string, out: Record<string, Cell>) {
  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    if (!entries.length && prefix) out[prefix] = "";
    for (const [k, v] of entries) flattenInto(v, prefix ? `${prefix}.${k}` : k, out);
  } else if (Array.isArray(value)) {
    out[prefix || "value"] = value.every((v) => v === null || typeof v !== "object") ? value.map((v) => (v === null ? "" : String(v))).join("; ") : JSON.stringify(value);
  } else if (value === undefined) {
    out[prefix || "value"] = null;
  } else {
    out[prefix || "value"] = value as Cell;
  }
}

export interface FlatTable {
  columns: string[];
  rows: Cell[][];
}

export function flattenJson(data: unknown): FlatTable {
  const records = findRecords(data);
  const columns: string[] = [];
  const seen = new Set<string>();
  const flat = records.map((r) => {
    const o: Record<string, Cell> = {};
    flattenInto(r, "", o);
    for (const k of Object.keys(o)) {
      if (!seen.has(k)) {
        seen.add(k);
        columns.push(k);
      }
    }
    return o;
  });
  return { columns, rows: flat.map((o) => columns.map((c) => (c in o ? o[c] : null))) };
}

export function cellToString(v: Cell | undefined): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

export function toCsv(rows: (Cell | undefined)[][], delimiter = ","): string {
  const needsQuote = new RegExp(`["\\r\\n${delimiter === "\t" ? "\\t" : delimiter.replace(/[|\\^$.*+?()[\]{}]/g, "\\$&")}]|^\\s|\\s$`);
  return rows
    .map((row) =>
      row
        .map((v) => {
          const s = cellToString(v);
          return needsQuote.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(delimiter),
    )
    .join("\r\n");
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function toHtmlTable(header: string[] | null, rows: (Cell | undefined)[][], caption?: string): string {
  const lines: string[] = ["<table>"];
  if (caption) lines.push(`  <caption>${escapeHtml(caption)}</caption>`);
  if (header) {
    lines.push("  <thead>", "    <tr>");
    header.forEach((h) => lines.push(`      <th scope="col">${escapeHtml(h)}</th>`));
    lines.push("    </tr>", "  </thead>");
  }
  lines.push("  <tbody>");
  for (const row of rows) {
    lines.push(`    <tr>${row.map((v) => `<td>${escapeHtml(cellToString(v))}</td>`).join("")}</tr>`);
  }
  lines.push("  </tbody>", "</table>");
  return lines.join("\n");
}

export function htmlDocument(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; margin: 2rem; color: #1a1a1a; }
  table { border-collapse: collapse; font-size: 14px; margin-bottom: 2rem; }
  th, td { border: 1px solid #d4d4d4; padding: 6px 10px; text-align: left; vertical-align: top; }
  th { background: #f3f4f3; }
  caption { text-align: left; font-weight: 600; padding-bottom: 6px; }
</style>
</head>
<body>
${body}
</body>
</html>
`;
}

/** Terminal display width: wide (CJK, emoji) = 2, combining marks = 0. */
export function displayWidth(s: string): number {
  let w = 0;
  for (const ch of s) {
    const cp = ch.codePointAt(0) ?? 0;
    if ((cp >= 0x300 && cp <= 0x36f) || (cp >= 0x200b && cp <= 0x200f) || cp === 0xfe0f) continue;
    if (
      (cp >= 0x1100 && cp <= 0x115f) ||
      (cp >= 0x2e80 && cp <= 0xa4cf) ||
      (cp >= 0xac00 && cp <= 0xd7a3) ||
      (cp >= 0xf900 && cp <= 0xfaff) ||
      (cp >= 0xfe30 && cp <= 0xfe4f) ||
      (cp >= 0xff00 && cp <= 0xff60) ||
      (cp >= 0xffe0 && cp <= 0xffe6) ||
      (cp >= 0x1f300 && cp <= 0x1faff) ||
      (cp >= 0x20000 && cp <= 0x3fffd)
    ) {
      w += 2;
    } else {
      w += 1;
    }
  }
  return w;
}

function pad(s: string, width: number): string {
  return s + " ".repeat(Math.max(0, width - displayWidth(s)));
}

export type TextTableStyle = "markdown" | "ascii" | "aligned";

export function toTextTable(header: string[] | null, rows: (Cell | undefined)[][], style: TextTableStyle): string {
  const clean = (v: Cell | undefined) => cellToString(v).replace(/[\r\n\t]+/g, " ");
  const body = rows.map((r) => r.map(clean));
  const head = header ? header.map((h) => h.replace(/[\r\n\t]+/g, " ")) : null;
  const colCount = Math.max(head?.length ?? 0, ...body.map((r) => r.length));
  const all = head ? [head, ...body] : body;
  const widths = Array.from({ length: colCount }, (_, c) => Math.max(style === "markdown" ? 3 : 1, ...all.map((r) => displayWidth(r[c] ?? ""))));
  const line = (r: string[]) => widths.map((w, c) => pad(r[c] ?? "", w));

  if (style === "markdown") {
    const md = (r: string[]) => `| ${line(r).map((s) => s.replace(/\|/g, "\\|")).join(" | ")} |`;
    const h = head ?? widths.map((_, i) => `Column ${i + 1}`);
    return [md(h), `| ${widths.map((w) => "-".repeat(w)).join(" | ")} |`, ...body.map(md)].join("\n");
  }
  if (style === "ascii") {
    const sep = `+${widths.map((w) => "-".repeat(w + 2)).join("+")}+`;
    const row = (r: string[]) => `| ${line(r).join(" | ")} |`;
    return [sep, ...(head ? [row(head), sep] : []), ...body.map(row), sep].join("\n");
  }
  return all.map((r) => line(r).join("  ").trimEnd()).join("\n");
}

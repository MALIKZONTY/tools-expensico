"use client";

import { useState, type ReactNode } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadText } from "@/lib/files/download";
import { toCsv } from "@/lib/convert/table";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  /** Raw value for CSV export. */
  csv: (row: T) => string | number;
  align?: "left" | "right";
}

/** Scrollable data table with optional "show all" and CSV export. */
export function DataTable<T>({ rows, columns, caption, fileName, initialRows = 12 }: { rows: T[]; columns: Column<T>[]; caption: string; fileName: string; initialRows?: number }) {
  const [all, setAll] = useState(false);
  const visible = all ? rows : rows.slice(0, initialRows);
  return (
    <div className="flex flex-col gap-3">
      <div className="table-scroll max-h-[32rem] overflow-y-auto rounded-lg border border-border">
        <table className="w-full min-w-[32rem] border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 bg-surface-2">
            <tr>
              {columns.map((c) => (
                <th key={c.header} scope="col" className={`whitespace-nowrap border-b border-border px-3 py-2 font-medium text-muted ${c.align === "right" ? "text-right" : "text-left"}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <tr key={i} className="border-b border-border last:border-0 odd:bg-surface even:bg-[color-mix(in_srgb,var(--surface-2)_50%,var(--surface))]">
                {columns.map((c) => (
                  <td key={c.header} className={`whitespace-nowrap px-3 py-2 tabular-nums text-fg ${c.align === "right" ? "text-right" : "text-left"}`}>
                    {c.cell(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        {rows.length > initialRows && (
          <Button variant="secondary" size="sm" onClick={() => setAll((a) => !a)}>
            {all ? "Show fewer rows" : `Show all ${rows.length} rows`}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => downloadText(toCsv([columns.map((c) => c.header), ...rows.map((r) => columns.map((c) => c.csv(r)))]) + "\r\n", fileName, "text/csv;charset=utf-8")}
        >
          <Download aria-hidden />
          Download CSV
        </Button>
      </div>
    </div>
  );
}

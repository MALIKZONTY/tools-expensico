"use client";

import { useDeferredValue, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { downloadText } from "@/lib/files/download";
import { toCsv } from "@/lib/convert/table";
import { cn } from "@/lib/cn";

const NUM = /^-?[\d,]*\.?\d+(?:[eE][+-]?\d+)?$/;
const asNumber = (s: string) => (NUM.test(s.trim()) ? Number(s.replace(/,/g, "")) : NaN);

interface DataGridProps {
  header: string[];
  rows: string[][];
  fileName: string;
}

/** Fast table for large datasets: global search, per-column filters, sort, resizable columns, pagination and export. */
export function DataGrid({ header, rows, fileName }: DataGridProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<number, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState<{ col: number; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [widths, setWidths] = useState<Record<number, number>>({});
  const q = useDeferredValue(query.trim().toLowerCase());
  const f = useDeferredValue(filters);
  const drag = useRef<{ col: number; startX: number; startW: number } | null>(null);

  const numericCols = useMemo(() => header.map((_, c) => {
    const sample = rows.slice(0, 200).map((r) => r[c] ?? "").filter((v) => v.trim());
    return sample.length > 0 && sample.every((v) => !Number.isNaN(asNumber(v)));
  }), [header, rows]);

  const filtered = useMemo(() => {
    const active = Object.entries(f).filter(([, v]) => v.trim()).map(([c, v]) => [Number(c), v.trim().toLowerCase()] as const);
    let out = rows;
    if (q || active.length) {
      out = rows.filter((r) => (!q || r.some((cell) => cell.toLowerCase().includes(q))) && active.every(([c, v]) => (r[c] ?? "").toLowerCase().includes(v)));
    }
    if (sort) {
      const { col, dir } = sort;
      const numeric = numericCols[col];
      out = [...out].sort((a, b) => {
        const x = a[col] ?? "";
        const y = b[col] ?? "";
        if (numeric) {
          const nx = asNumber(x), ny = asNumber(y);
          if (Number.isNaN(nx) || Number.isNaN(ny)) return Number.isNaN(nx) ? 1 : -1;
          return (nx - ny) * dir;
        }
        return x.localeCompare(y, undefined, { numeric: true, sensitivity: "base" }) * dir;
      });
    }
    return out;
  }, [rows, q, f, sort, numericCols]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const slice = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const colCount = Math.max(header.length, ...slice.map((r) => r.length));

  function onResizeStart(e: React.PointerEvent, col: number) {
    const th = (e.currentTarget as HTMLElement).parentElement!;
    drag.current = { col, startX: e.clientX, startW: th.getBoundingClientRect().width };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onResizeMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    setWidths((w) => ({ ...w, [d.col]: Math.max(60, Math.min(800, d.startW + e.clientX - d.startX)) }));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <Input aria-label="Search all columns" placeholder="Search all columns" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} className="pl-9" />
        </div>
        <Button variant={showFilters ? "primary" : "secondary"} size="sm" onClick={() => setShowFilters((s) => !s)} aria-pressed={showFilters}>
          <Filter aria-hidden /> Column filters
        </Button>
        {(q || Object.values(filters).some(Boolean) || sort) && (
          <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setFilters({}); setSort(null); setPage(0); }}>
            <X aria-hidden /> Reset view
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => downloadText("﻿" + toCsv([header, ...filtered]) + "\r\n", fileName.replace(/\.[^.]+$/, "") + (filtered.length !== rows.length ? "-filtered" : "") + ".csv", "text/csv;charset=utf-8")}>
          <Download aria-hidden /> Export {filtered.length !== rows.length ? "filtered " : ""}CSV
        </Button>
      </div>
      <p className="text-sm text-muted" aria-live="polite">
        {filtered.length === rows.length ? `${rows.length.toLocaleString("en-IN")} rows` : `${filtered.length.toLocaleString("en-IN")} of ${rows.length.toLocaleString("en-IN")} rows match`} · {header.length} columns
      </p>
      <div className="table-scroll max-h-[70vh] overflow-y-auto rounded-lg border border-border">
        <table className="border-collapse text-sm" style={{ tableLayout: "fixed", minWidth: "100%" }}>
          <caption className="sr-only">Data from {fileName}</caption>
          <colgroup>
            <col style={{ width: 56 }} />
            {Array.from({ length: colCount }, (_, c) => <col key={c} style={{ width: widths[c] ?? 160 }} />)}
          </colgroup>
          <thead className="sticky top-0 z-10 bg-surface-2">
            <tr>
              <th scope="col" className="border-b border-r border-border px-2 py-2 text-right text-xs font-medium text-subtle">#</th>
              {Array.from({ length: colCount }, (_, c) => {
                const name = header[c] ?? `Column ${c + 1}`;
                const dir = sort?.col === c ? sort.dir : 0;
                return (
                  <th key={c} scope="col" aria-sort={dir === 1 ? "ascending" : dir === -1 ? "descending" : "none"} className="relative border-b border-r border-border p-0 text-left font-medium text-fg">
                    <button
                      type="button"
                      onClick={() => setSort((s) => (s?.col !== c ? { col: c, dir: 1 } : s.dir === 1 ? { col: c, dir: -1 } : null))}
                      className="flex w-full items-center gap-1 px-3 py-2 text-left hover:bg-surface-3"
                      title={name}
                    >
                      <span className="truncate">{name}</span>
                      {dir === 1 ? <ArrowUp aria-hidden className="size-3.5 shrink-0" /> : dir === -1 ? <ArrowDown aria-hidden className="size-3.5 shrink-0" /> : <ArrowUpDown aria-hidden className="size-3.5 shrink-0 text-subtle" />}
                    </button>
                    {showFilters && (
                      <div className="px-2 pb-2">
                        <input aria-label={`Filter ${name}`} value={filters[c] ?? ""} onChange={(e) => { setFilters((fl) => ({ ...fl, [c]: e.target.value })); setPage(0); }} placeholder="Filter" className="h-8 w-full rounded border border-border-strong bg-surface px-2 text-xs font-normal focus-visible:outline-2 focus-visible:outline-ring" />
                      </div>
                    )}
                    <span role="separator" aria-orientation="vertical" aria-label={`Resize ${name}`} onPointerDown={(e) => onResizeStart(e, c)} onPointerMove={onResizeMove} onPointerUp={() => (drag.current = null)} className="absolute right-0 top-0 h-full w-2 cursor-col-resize touch-none hover:bg-brand/30" />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {slice.map((r, i) => (
              <tr key={i} className="border-b border-border odd:bg-surface even:bg-[color-mix(in_srgb,var(--surface-2)_50%,var(--surface))] hover:bg-brand-soft/40">
                <td className="border-r border-border px-2 py-1.5 text-right text-xs tabular-nums text-subtle">{safePage * pageSize + i + 1}</td>
                {Array.from({ length: colCount }, (_, c) => (
                  <td key={c} className={cn("truncate border-r border-border px-3 py-1.5", numericCols[c] && "text-right tabular-nums")} title={r[c]}>
                    {r[c]}
                  </td>
                ))}
              </tr>
            ))}
            {slice.length === 0 && (
              <tr>
                <td colSpan={colCount + 1} className="px-3 py-8 text-center text-muted">No rows match.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <label className="flex items-center gap-2 text-muted">
          Rows per page
          <Select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }} className="h-9 w-24">
            {[50, 100, 250, 500].map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
        </label>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Previous page" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}><ChevronLeft aria-hidden /></Button>
          <span className="tabular-nums text-muted">Page {safePage + 1} of {pages.toLocaleString("en-IN")}</span>
          <Button variant="ghost" size="icon-sm" aria-label="Next page" disabled={safePage >= pages - 1} onClick={() => setPage(safePage + 1)}><ChevronRight aria-hidden /></Button>
        </div>
      </div>
    </div>
  );
}

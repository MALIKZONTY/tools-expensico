"use client";

import { useState } from "react";
import { Input, Select } from "@/components/ui/field";
import { CopyButton } from "@/components/ui/copy-button";

const UNITS = [
  { id: "B", label: "Bytes (B)", f: 1 },
  { id: "KB", label: "Kilobytes (KB, 1000)", f: 1e3 },
  { id: "MB", label: "Megabytes (MB, 1000²)", f: 1e6 },
  { id: "GB", label: "Gigabytes (GB, 1000³)", f: 1e9 },
  { id: "TB", label: "Terabytes (TB, 1000⁴)", f: 1e12 },
  { id: "KiB", label: "Kibibytes (KiB, 1024)", f: 1024 },
  { id: "MiB", label: "Mebibytes (MiB, 1024²)", f: 1024 ** 2 },
  { id: "GiB", label: "Gibibytes (GiB, 1024³)", f: 1024 ** 3 },
  { id: "TiB", label: "Tebibytes (TiB, 1024⁴)", f: 1024 ** 4 },
  { id: "bit", label: "Bits (b)", f: 1 / 8 },
  { id: "Mbit", label: "Megabits (Mb)", f: 1e6 / 8 },
  { id: "Gbit", label: "Gigabits (Gb)", f: 1e9 / 8 },
];

function fmt(n: number) {
  if (!Number.isFinite(n)) return "—";
  if (n !== 0 && (Math.abs(n) >= 1e15 || Math.abs(n) < 1e-6)) return n.toExponential(6);
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 6 }).format(n);
}

export default function FileSizeConverter() {
  const [value, setValue] = useState("1");
  const [unit, setUnit] = useState("TB");
  const [speed, setSpeed] = useState("100");
  const bytes = Number(value) * (UNITS.find((u) => u.id === unit)?.f ?? 1);
  const seconds = Number(speed) > 0 ? (bytes * 8) / (Number(speed) * 1e6) : NaN;
  const dur = Number.isFinite(seconds) ? (seconds < 60 ? `${seconds.toFixed(1)} seconds` : seconds < 3600 ? `${(seconds / 60).toFixed(1)} minutes` : `${(seconds / 3600).toFixed(1)} hours`) : "—";

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap gap-2">
        <Input aria-label="Value" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} className="w-40 text-lg tabular-nums" />
        <Select aria-label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="w-64">
          {UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
        </Select>
      </div>
      <div className="table-scroll rounded-lg border border-border">
        <table className="w-full text-sm">
          <caption className="sr-only">Conversions</caption>
          <tbody>
            {UNITS.map((u) => {
              const v = fmt(bytes / u.f);
              return (
                <tr key={u.id} className={u.id === unit ? "bg-brand-soft" : "border-t border-border first:border-0"}>
                  <th scope="row" className="px-3 py-2 text-left font-medium">{u.label}</th>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{v}</td>
                  <td className="w-10 px-1"><CopyButton value={v.replace(/,/g, "")} size="icon-sm" variant="ghost" label={`Copy ${u.id}`} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-surface-2 p-4 text-sm">
        Download time at
        <Input aria-label="Connection speed in megabits per second" inputMode="decimal" value={speed} onChange={(e) => setSpeed(e.target.value)} className="h-9 w-24" />
        Mbps: <strong className="tabular-nums">{dur}</strong>
        <span className="text-xs text-muted">(theoretical maximum; real downloads are slower)</span>
      </div>
    </div>
  );
}

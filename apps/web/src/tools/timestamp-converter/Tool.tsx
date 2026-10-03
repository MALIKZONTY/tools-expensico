"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Input, Select } from "@/components/ui/field";

function detectUnit(n: number): "s" | "ms" | "us" {
  const abs = Math.abs(n);
  if (abs >= 1e14) return "us";
  if (abs >= 1e11) return "ms";
  return "s";
}

function relative(ms: number, now: number) {
  const diff = (ms - now) / 1000;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60], ["second", 1]];
  for (const [u, s] of units) if (Math.abs(diff) >= s || u === "second") return rtf.format(Math.round(diff / s), u);
  return "";
}

function zones(): string[] {
  try {
    return (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone") ?? ["UTC", "Asia/Kolkata"];
  } catch {
    return ["UTC", "Asia/Kolkata"];
  }
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2.5 last:border-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="flex min-w-0 items-center gap-1 font-mono text-sm">
        <span className="break-all">{value}</span>
        <CopyButton value={value} size="icon-sm" variant="ghost" label={`Copy ${label}`} />
      </dd>
    </div>
  );
}

export default function TimestampConverter() {
  const [now, setNow] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [zone, setZone] = useState("Asia/Kolkata");
  const [dateInput, setDateInput] = useState("");
  const allZones = useMemo(() => zones(), []);

  useEffect(() => {
    // The current time and time zone exist only in the browser; set them after hydration.
    const t = Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(t);
    setInput(String(Math.floor(t / 1000)));
    setZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const parsed = useMemo(() => {
    const t = input.trim();
    if (!t) return null;
    if (/^-?\d+(\.\d+)?$/.test(t)) {
      const n = Number(t);
      const unit = detectUnit(n);
      const ms = unit === "s" ? n * 1000 : unit === "ms" ? n : n / 1000;
      return { ms, unit };
    }
    const d = Date.parse(t);
    return Number.isNaN(d) ? { error: true as const } : { ms: d, unit: "date" as const };
  }, [input]);

  const fmt = (ms: number, tz: string) =>
    new Intl.DateTimeFormat("en-IN", { timeZone: tz, dateStyle: "full", timeStyle: "long" }).format(new Date(ms));

  const fromLocal = dateInput ? new Date(dateInput).getTime() : NaN;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6" aria-labelledby="ts-h">
        <div className="flex items-center justify-between gap-2">
          <h2 id="ts-h" className="text-lg font-semibold">Timestamp → date</h2>
          {now !== null && (
            <span className="flex items-center gap-1.5 font-mono text-sm text-muted" aria-label="Current Unix time">
              <Clock aria-hidden className="size-4" />
              {Math.floor(now / 1000)}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Input aria-label="Unix timestamp or date string" value={input} onChange={(e) => setInput(e.target.value)} className="font-mono" placeholder="1700000000 or 2026-10-03T10:00:00Z" />
          <Button variant="secondary" onClick={() => setInput(String(Math.floor(Date.now() / 1000)))}>Now</Button>
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Time zone
          <Select value={zone} onChange={(e) => setZone(e.target.value)}>
            {allZones.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </Select>
        </label>
        {parsed && "error" in parsed ? (
          <Alert tone="danger" role="alert">Enter a number (seconds, milliseconds or microseconds) or a date like 2026-10-03T10:00:00Z.</Alert>
        ) : parsed && Number.isFinite(parsed.ms) && Math.abs(parsed.ms) < 8.64e15 ? (
          <>
            {parsed.unit !== "date" && <p className="text-sm text-muted">Interpreted as {parsed.unit === "s" ? "seconds" : parsed.unit === "ms" ? "milliseconds" : "microseconds"} since 1 January 1970 UTC.</p>}
            <dl>
              <Row label={zone} value={fmt(parsed.ms, zone)} />
              <Row label="UTC" value={fmt(parsed.ms, "UTC")} />
              <Row label="ISO 8601" value={new Date(parsed.ms).toISOString()} />
              <Row label="Unix seconds" value={String(Math.floor(parsed.ms / 1000))} />
              <Row label="Unix milliseconds" value={String(Math.round(parsed.ms))} />
              {now !== null && <Row label="Relative" value={relative(parsed.ms, now)} />}
            </dl>
          </>
        ) : parsed ? (
          <Alert tone="danger">That timestamp is outside the range JavaScript dates support.</Alert>
        ) : null}
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6" aria-labelledby="date-h">
        <h2 id="date-h" className="text-lg font-semibold">Date → timestamp</h2>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Date and time (your local time zone)
          <Input type="datetime-local" step={1} value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
        </label>
        {Number.isFinite(fromLocal) && (
          <dl>
            <Row label="Unix seconds" value={String(Math.floor(fromLocal / 1000))} />
            <Row label="Unix milliseconds" value={String(fromLocal)} />
            <Row label="ISO 8601 (UTC)" value={new Date(fromLocal).toISOString()} />
          </dl>
        )}
      </section>
    </div>
  );
}

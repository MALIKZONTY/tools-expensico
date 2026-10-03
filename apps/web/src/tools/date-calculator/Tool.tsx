"use client";

import { useState } from "react";
import { useClientValue } from "@/hooks/use-mounted";
import { Alert } from "@/components/ui/alert";
import { Checkbox, Input, Select } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { Stat } from "@/components/tool/ToolCard";
import { addDays, addMonths, businessDays, daysBetween, diffYmd, parseYmd, toYmdString, weekday, type Ymd } from "@/lib/text/dates";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function todayYmd(): string {
  const d = new Date();
  return toYmdString({ y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() });
}

function pretty(v: Ymd) {
  return `${WEEKDAYS[weekday(v)]}, ${new Date(Date.UTC(v.y, v.m - 1, v.d)).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}`;
}

function plural(n: number, w: string) {
  return `${n} ${w}${n === 1 ? "" : "s"}`;
}

export default function DateCalculator() {
  const [mode, setMode] = useState<"between" | "add" | "age">("between");
  const today = useClientValue(todayYmd, "");
  // Until the user picks dates, default to today and three months from today.
  const [aIn, setA] = useState<string | null>(null);
  const [bIn, setB] = useState<string | null>(null);
  const a = aIn ?? today;
  const b = bIn ?? (today ? toYmdString(addMonths(parseYmd(today)!, 3)) : "");
  const [inclusive, setInclusive] = useState(false);
  const [sat, setSat] = useState(true);
  const [n, setN] = useState(30);
  const [unit, setUnit] = useState<"days" | "weeks" | "months" | "years" | "business">("days");
  const [dir, setDir] = useState<1 | -1>(1);

  const A = parseYmd(a);
  const B = parseYmd(b);

  let addResult: Ymd | null = null;
  if (A && Number.isFinite(n)) {
    const k = Math.trunc(n) * dir;
    if (unit === "days") addResult = addDays(A, k);
    else if (unit === "weeks") addResult = addDays(A, k * 7);
    else if (unit === "months") addResult = addMonths(A, k);
    else if (unit === "years") addResult = addMonths(A, k * 12);
    else {
      let cur = A;
      let left = Math.abs(k);
      while (left > 0) {
        cur = addDays(cur, dir);
        const wd = weekday(cur);
        if (wd !== 0 && !(sat && wd === 6)) left--;
      }
      addResult = cur;
    }
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <Segmented label="Calculation" value={mode} onChange={setMode} options={[{ value: "between", label: "Days between dates" }, { value: "add", label: "Add / subtract" }, { value: "age", label: "Age" }]} />

      {mode === "between" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium">Start date<Input type="date" value={a} onChange={(e) => setA(e.target.value)} /></label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">End date<Input type="date" value={b} onChange={(e) => setB(e.target.value)} /></label>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Checkbox label="Include the end date" checked={inclusive} onChange={(e) => setInclusive(e.target.checked)} />
            <Checkbox label="Saturdays are non-working days" checked={sat} onChange={(e) => setSat(e.target.checked)} />
          </div>
          {A && B && (() => {
            const days = Math.abs(daysBetween(A, B)) + (inclusive ? 1 : 0);
            const [from, to] = daysBetween(A, B) >= 0 ? [A, B] : [B, A];
            const ymd = diffYmd(from, to);
            return (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-live="polite">
                <Stat emphasis label="Total days" value={days.toLocaleString("en-IN")} />
                <Stat label="Working days" value={businessDays(from, to, { includeEnd: inclusive, excludeSaturday: sat }).toLocaleString("en-IN")} sub={sat ? "Mon–Fri" : "Mon–Sat"} />
                <Stat label="Weeks" value={`${Math.floor(days / 7)} wk ${days % 7} d`} />
                <Stat className="sm:col-span-3" label="In years, months and days" value={[plural(ymd.years, "year"), plural(ymd.months, "month"), plural(ymd.days, "day")].join(", ")} />
              </div>
            );
          })()}
          <p className="text-xs text-muted">Working days exclude weekends but not public holidays, which vary by state and employer.</p>
        </>
      )}

      {mode === "add" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_6rem_10rem]">
            <label className="flex flex-col gap-1.5 text-sm font-medium">Start date<Input type="date" value={a} onChange={(e) => setA(e.target.value)} /></label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">Operation
              <Select value={dir} onChange={(e) => setDir(Number(e.target.value) as 1 | -1)}><option value={1}>Add</option><option value={-1}>Subtract</option></Select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">Amount<Input type="number" min={0} max={100000} value={n} onChange={(e) => setN(Number(e.target.value))} /></label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">Unit
              <Select value={unit} onChange={(e) => setUnit(e.target.value as typeof unit)}>
                <option value="days">Days</option><option value="business">Working days</option><option value="weeks">Weeks</option><option value="months">Months</option><option value="years">Years</option>
              </Select>
            </label>
          </div>
          {addResult && <Stat emphasis label="Result" value={pretty(addResult)} />}
          {(unit === "months" || unit === "years") && <p className="text-xs text-muted">If the day doesn&apos;t exist in the target month, the last day of that month is used (31 Jan + 1 month = 28 or 29 Feb).</p>}
        </>
      )}

      {mode === "age" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium">Date of birth<Input type="date" value={a} max={b || today} onChange={(e) => setA(e.target.value)} /></label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">Age on<Input type="date" value={b} onChange={(e) => setB(e.target.value)} /></label>
          </div>
          {A && B && (daysBetween(A, B) < 0 ? (
            <Alert tone="warning">The “age on” date is before the date of birth.</Alert>
          ) : (() => {
            const age = diffYmd(A, B);
            let next = addMonths(A, (age.years + 1) * 12);
            if (daysBetween(B, addMonths(A, age.years * 12)) === 0) next = B;
            const toNext = daysBetween(B, next);
            return (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-live="polite">
                <Stat emphasis className="sm:col-span-3" label="Age" value={`${plural(age.years, "year")}, ${plural(age.months, "month")}, ${plural(age.days, "day")}`} />
                <Stat label="Total days lived" value={daysBetween(A, B).toLocaleString("en-IN")} />
                <Stat label="Total weeks" value={Math.floor(daysBetween(A, B) / 7).toLocaleString("en-IN")} />
                <Stat label="Next birthday" value={toNext === 0 ? "Today! 🎉" : `in ${plural(toNext, "day")}`} sub={toNext === 0 ? undefined : WEEKDAYS[weekday(next)]} />
              </div>
            );
          })())}
        </>
      )}
    </div>
  );
}

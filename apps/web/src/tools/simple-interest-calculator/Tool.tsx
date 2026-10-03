"use client";

import { Segmented } from "@/components/ui/segmented";
import { Stat } from "@/components/tool/ToolCard";
import { CalculatorLayout, FinanceNote } from "@/components/finance/CalculatorLayout";
import { NumberField } from "@/components/finance/NumberField";
import { useStoredState } from "@/hooks/use-stored-state";
import { formatCurrency, formatNumber } from "@/lib/format";

type Solve = "interest" | "principal" | "rate" | "time";

export default function SimpleInterestCalculator() {
  const [s, setS] = useStoredState("si", { solve: "interest" as Solve, principal: 50_000, rate: 8, years: 3, interest: 12_000 });
  const inr = (n: number) => formatCurrency(n, "INR", 2);
  let result: { label: string; value: string; formula: string; total?: number };
  switch (s.solve) {
    case "interest": {
      const si = (s.principal * s.rate * s.years) / 100;
      result = { label: "Simple interest", value: inr(si), formula: `SI = P × R × T / 100 = ${formatNumber(s.principal)} × ${s.rate} × ${s.years} / 100`, total: s.principal + si };
      break;
    }
    case "principal": {
      const p = s.rate && s.years ? (s.interest * 100) / (s.rate * s.years) : NaN;
      result = { label: "Principal needed", value: inr(p), formula: `P = SI × 100 / (R × T) = ${formatNumber(s.interest)} × 100 / (${s.rate} × ${s.years})`, total: p + s.interest };
      break;
    }
    case "rate": {
      const r = s.principal && s.years ? (s.interest * 100) / (s.principal * s.years) : NaN;
      result = { label: "Interest rate", value: `${formatNumber(r, { maximumFractionDigits: 4 })}% per year`, formula: `R = SI × 100 / (P × T) = ${formatNumber(s.interest)} × 100 / (${formatNumber(s.principal)} × ${s.years})` };
      break;
    }
    case "time": {
      const t = s.principal && s.rate ? (s.interest * 100) / (s.principal * s.rate) : NaN;
      result = { label: "Time", value: `${formatNumber(t, { maximumFractionDigits: 3 })} years`, formula: `T = SI × 100 / (P × R) = ${formatNumber(s.interest)} × 100 / (${formatNumber(s.principal)} × ${s.rate})` };
      break;
    }
  }

  return (
    <CalculatorLayout
      inputs={
        <>
          <Segmented
            label="Solve for"
            size="sm"
            value={s.solve}
            onChange={(solve) => setS({ ...s, solve })}
            options={[
              { value: "interest", label: "Interest" },
              { value: "principal", label: "Principal" },
              { value: "rate", label: "Rate" },
              { value: "time", label: "Time" },
            ]}
          />
          {s.solve !== "principal" && <NumberField label="Principal" prefix="₹" value={s.principal} min={0} max={1e12} onChange={(principal) => setS({ ...s, principal })} />}
          {s.solve !== "rate" && <NumberField label="Rate of interest (per year)" suffix="%" value={s.rate} min={0} max={100} grouping={false} onChange={(rate) => setS({ ...s, rate })} />}
          {s.solve !== "time" && <NumberField label="Time" suffix="years" value={s.years} min={0} max={100} grouping={false} maxFraction={4} onChange={(years) => setS({ ...s, years })} hint="For months, divide by 12 (e.g. 18 months = 1.5)." />}
          {s.solve !== "interest" && <NumberField label="Interest earned/paid" prefix="₹" value={s.interest} min={0} max={1e12} onChange={(interest) => setS({ ...s, interest })} />}
        </>
      }
      results={
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Stat emphasis className={result.total === undefined ? "sm:col-span-2" : undefined} label={result.label} value={result.value} />
            {result.total !== undefined && <Stat label="Total amount (P + SI)" value={inr(result.total)} />}
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-3 font-mono text-sm text-fg break-words">{result.formula}</div>
          <FinanceNote />
        </>
      }
    />
  );
}

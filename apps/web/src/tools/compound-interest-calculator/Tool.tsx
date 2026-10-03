"use client";

import { useMemo } from "react";
import { Select } from "@/components/ui/field";
import { Stat } from "@/components/tool/ToolCard";
import { CalculatorLayout, FinanceNote } from "@/components/finance/CalculatorLayout";
import { StackedBars } from "@/components/finance/Charts";
import { DataTable } from "@/components/finance/DataTable";
import { NumberField } from "@/components/finance/NumberField";
import { useStoredState } from "@/hooks/use-stored-state";
import { compoundWithContributions } from "@/lib/finance/savings";
import { CURRENCIES, formatCurrency, formatPercent, type CurrencyCode } from "@/lib/format";

const FREQ: Record<number, string> = { 365: "Daily", 12: "Monthly", 4: "Quarterly", 2: "Half-yearly", 1: "Yearly" };

export default function CompoundInterestCalculator() {
  const [s, setS] = useStoredState("ci", { principal: 100_000, rate: 10, years: 10, freq: 1, monthly: 0, currency: "INR" as CurrencyCode });
  const r = useMemo(() => compoundWithContributions(s.principal, s.rate, s.years, s.freq, s.monthly), [s]);
  const money = (n: number) => formatCurrency(n, s.currency, 0);
  const effective = (Math.pow(1 + s.rate / 100 / s.freq, s.freq) - 1) * 100;

  return (
    <CalculatorLayout
      inputs={
        <>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ci-cur" className="text-sm font-medium">Currency</label>
            <Select id="ci-cur" value={s.currency} onChange={(e) => setS({ ...s, currency: e.target.value as CurrencyCode })}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </Select>
          </div>
          <NumberField label="Initial amount" value={s.principal} min={0} max={1e12} slider={{ min: 0, max: 5_000_000, step: 10_000 }} onChange={(principal) => setS({ ...s, principal })} />
          <NumberField label="Monthly contribution" value={s.monthly} min={0} max={1e10} onChange={(monthly) => setS({ ...s, monthly })} hint="Optional. Added at the end of each month." />
          <NumberField label="Annual interest rate" suffix="%" value={s.rate} min={0} max={100} grouping={false} slider={{ min: 0, max: 30, step: 0.25 }} onChange={(rate) => setS({ ...s, rate })} />
          <NumberField label="Time" suffix="years" value={s.years} min={1} max={100} grouping={false} slider={{ min: 1, max: 50, step: 1 }} onChange={(years) => setS({ ...s, years: Math.round(years) })} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ci-freq" className="text-sm font-medium">Compounding frequency</label>
            <Select id="ci-freq" value={s.freq} onChange={(e) => setS({ ...s, freq: Number(e.target.value) })}>
              {Object.entries(FREQ).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </div>
        </>
      }
      results={
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat emphasis className="sm:col-span-3" label="Future value" value={money(r.value)} />
            <Stat label="Total contributed" value={money(r.invested)} />
            <Stat label="Interest earned" value={money(r.value - r.invested)} />
            <Stat label="Effective annual rate" value={formatPercent(effective)} />
          </div>
          <FinanceNote />
        </>
      }
      below={
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold">Growth by year</h2>
          <StackedBars
            title="Contributions and interest at the end of each year"
            format={money}
            series={[
              { label: "Contributed", color: "var(--series-1)" },
              { label: "Interest", color: "var(--series-2)" },
            ]}
            bars={r.years.map((y) => ({ label: `Y${y.year}`, parts: [y.invested, Math.max(0, y.gain)] }))}
          />
          <DataTable
            caption="Compound growth by year"
            fileName="compound-interest.csv"
            rows={r.years}
            columns={[
              { header: "Year", cell: (y) => y.year, csv: (y) => y.year },
              { header: "Contributed", cell: (y) => money(y.invested), csv: (y) => y.invested.toFixed(2), align: "right" },
              { header: "Interest", cell: (y) => money(y.gain), csv: (y) => y.gain.toFixed(2), align: "right" },
              { header: "Balance", cell: (y) => money(y.value), csv: (y) => y.value.toFixed(2), align: "right" },
            ]}
          />
        </section>
      }
    />
  );
}

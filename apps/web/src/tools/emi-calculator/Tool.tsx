"use client";

import { useMemo, useState } from "react";
import { Segmented } from "@/components/ui/segmented";
import { Stat } from "@/components/tool/ToolCard";
import { CalculatorLayout, FinanceNote } from "@/components/finance/CalculatorLayout";
import { Donut, StackedBars } from "@/components/finance/Charts";
import { DataTable } from "@/components/finance/DataTable";
import { NumberField } from "@/components/finance/NumberField";
import { useStoredState } from "@/hooks/use-stored-state";
import { amortize, yearly } from "@/lib/finance/loan";
import { formatCurrency, formatIndianCompact } from "@/lib/format";

const PRESETS = {
  home: { label: "Home loan", amount: 5_000_000, rate: 8.5, years: 20 },
  car: { label: "Car loan", amount: 800_000, rate: 9.5, years: 5 },
  personal: { label: "Personal loan", amount: 300_000, rate: 12, years: 3 },
} as const;

type Preset = keyof typeof PRESETS;

export default function EmiCalculator() {
  const [s, setS] = useStoredState("emi", { amount: 5_000_000, rate: 8.5, years: 20, tenureUnit: "years" as "years" | "months" });
  const [preset, setPreset] = useState<Preset | "custom">("custom");
  const months = s.tenureUnit === "years" ? Math.round(s.years * 12) : Math.round(s.years);
  const [view, setView] = useState<"yearly" | "monthly">("yearly");

  const schedule = useMemo(() => amortize(s.amount, s.rate, months), [s.amount, s.rate, months]);
  const years = useMemo(() => yearly(schedule.rows), [schedule]);
  const inr = (n: number) => formatCurrency(n, "INR", 0);

  return (
    <CalculatorLayout
      inputs={
        <>
          <Segmented
            label="Loan type"
            size="sm"
            value={preset}
            onChange={(v) => {
              setPreset(v);
              if (v !== "custom") setS({ ...s, amount: PRESETS[v].amount, rate: PRESETS[v].rate, years: PRESETS[v].years, tenureUnit: "years" });
            }}
            options={[...(Object.keys(PRESETS) as Preset[]).map((k) => ({ value: k, label: PRESETS[k].label })), { value: "custom" as const, label: "Custom" }]}
          />
          <NumberField label="Loan amount" prefix="₹" value={s.amount} min={1_000} max={1_000_000_000} slider={{ min: 50_000, max: 20_000_000, step: 50_000 }} onChange={(amount) => setS({ ...s, amount })} />
          <NumberField label="Interest rate (per year)" suffix="%" value={s.rate} min={0} max={50} step={0.05} grouping={false} slider={{ min: 1, max: 24, step: 0.05 }} onChange={(rate) => setS({ ...s, rate })} />
          <div className="flex flex-col gap-2">
            <NumberField
              label="Loan tenure"
              suffix={s.tenureUnit}
              value={s.years}
              min={1}
              max={s.tenureUnit === "years" ? 40 : 480}
              grouping={false}
              slider={s.tenureUnit === "years" ? { min: 1, max: 30, step: 1 } : { min: 6, max: 360, step: 6 }}
              onChange={(years) => setS({ ...s, years })}
            />
            <Segmented
              label="Tenure unit"
              size="sm"
              value={s.tenureUnit}
              onChange={(u) => setS({ ...s, tenureUnit: u, years: u === "months" ? Math.round(s.years * 12) : Math.max(1, Math.round(s.years / 12)) })}
              options={[
                { value: "years", label: "Years" },
                { value: "months", label: "Months" },
              ]}
            />
          </div>
        </>
      }
      results={
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat emphasis label="Monthly EMI" value={formatCurrency(schedule.emi, "INR", 0)} className="sm:col-span-3" />
            <Stat label="Total interest" value={formatIndianCompact(schedule.totalInterest)} sub={inr(schedule.totalInterest)} />
            <Stat label="Total payment" value={formatIndianCompact(schedule.totalPaid)} sub={inr(schedule.totalPaid)} />
            <Stat label="Interest share" value={`${schedule.totalPaid ? Math.round((schedule.totalInterest / schedule.totalPaid) * 100) : 0}%`} sub="of total payment" />
          </div>
          <Donut
            format={inr}
            centerLabel="Total"
            centerValue={formatIndianCompact(schedule.totalPaid)}
            segments={[
              { label: "Principal", value: s.amount, color: "var(--series-1)" },
              { label: "Interest", value: schedule.totalInterest, color: "var(--series-2)" },
            ]}
          />
          <FinanceNote>EMI is calculated on a reducing balance with monthly compounding, as Indian banks do. Processing fees and insurance aren&apos;t included.</FinanceNote>
        </>
      }
      below={
        <section aria-labelledby="schedule-h" className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="schedule-h" className="text-lg font-semibold">Amortization schedule</h2>
            <Segmented label="Schedule view" size="sm" value={view} onChange={setView} options={[{ value: "yearly", label: "Yearly" }, { value: "monthly", label: "Monthly" }]} />
          </div>
          {years.length > 1 && (
            <StackedBars
              title="Principal and interest paid each year"
              format={inr}
              series={[
                { label: "Principal", color: "var(--series-1)" },
                { label: "Interest", color: "var(--series-2)" },
              ]}
              bars={years.map((y) => ({ label: `Y${y.year}`, parts: [y.principal, y.interest] }))}
            />
          )}
          {view === "yearly" ? (
            <DataTable
              caption="Yearly amortization schedule"
              fileName="emi-schedule-yearly.csv"
              rows={years}
              columns={[
                { header: "Year", cell: (r) => r.year, csv: (r) => r.year },
                { header: "Principal", cell: (r) => inr(r.principal), csv: (r) => r.principal.toFixed(2), align: "right" },
                { header: "Interest", cell: (r) => inr(r.interest), csv: (r) => r.interest.toFixed(2), align: "right" },
                { header: "Total paid", cell: (r) => inr(r.principal + r.interest), csv: (r) => (r.principal + r.interest).toFixed(2), align: "right" },
                { header: "Balance", cell: (r) => inr(r.balance), csv: (r) => r.balance.toFixed(2), align: "right" },
              ]}
            />
          ) : (
            <DataTable
              caption="Monthly amortization schedule"
              fileName="emi-schedule-monthly.csv"
              rows={schedule.rows}
              columns={[
                { header: "Month", cell: (r) => r.month, csv: (r) => r.month },
                { header: "EMI", cell: (r) => inr(r.emi), csv: (r) => r.emi.toFixed(2), align: "right" },
                { header: "Principal", cell: (r) => inr(r.principal), csv: (r) => r.principal.toFixed(2), align: "right" },
                { header: "Interest", cell: (r) => inr(r.interest), csv: (r) => r.interest.toFixed(2), align: "right" },
                { header: "Balance", cell: (r) => inr(r.balance), csv: (r) => r.balance.toFixed(2), align: "right" },
              ]}
            />
          )}
        </section>
      }
    />
  );
}

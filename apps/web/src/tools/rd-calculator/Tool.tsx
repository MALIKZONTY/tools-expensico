"use client";

import { useMemo } from "react";
import { Stat } from "@/components/tool/ToolCard";
import { CalculatorLayout, FinanceNote } from "@/components/finance/CalculatorLayout";
import { Donut } from "@/components/finance/Charts";
import { DataTable } from "@/components/finance/DataTable";
import { NumberField } from "@/components/finance/NumberField";
import { useStoredState } from "@/hooks/use-stored-state";
import { rdMaturity } from "@/lib/finance/savings";
import { formatCurrency, formatIndianCompact } from "@/lib/format";

export default function RdCalculator() {
  const [s, setS] = useStoredState("rd", { monthly: 5_000, rate: 6.5, months: 60 });
  const r = useMemo(() => rdMaturity(s.monthly, s.rate, s.months), [s]);
  const rows = useMemo(
    () =>
      Array.from({ length: Math.ceil(s.months / 12) }, (_, i) => {
        const m = Math.min(s.months, (i + 1) * 12);
        const v = rdMaturity(s.monthly, s.rate, m);
        return { year: i + 1, months: m, invested: v.invested, value: v.maturity };
      }),
    [s],
  );
  const interest = r.maturity - r.invested;
  const inr = (n: number) => formatCurrency(n, "INR", 0);

  return (
    <CalculatorLayout
      inputs={
        <>
          <NumberField label="Monthly deposit" prefix="₹" value={s.monthly} min={10} max={10_000_000} slider={{ min: 500, max: 100_000, step: 500 }} onChange={(monthly) => setS({ ...s, monthly })} />
          <NumberField label="Interest rate (per year)" suffix="%" value={s.rate} min={0} max={20} step={0.05} grouping={false} slider={{ min: 2, max: 10, step: 0.05 }} onChange={(rate) => setS({ ...s, rate })} />
          <NumberField label="Tenure" suffix="months" value={s.months} min={3} max={240} grouping={false} slider={{ min: 6, max: 120, step: 3 }} onChange={(months) => setS({ ...s, months: Math.round(months) })} />
        </>
      }
      results={
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Stat emphasis className="sm:col-span-2" label="Maturity value" value={inr(r.maturity)} sub={`after ${s.months} months`} />
            <Stat label="Total deposited" value={formatIndianCompact(r.invested)} sub={inr(r.invested)} />
            <Stat label="Interest earned" value={formatIndianCompact(interest)} sub={inr(interest)} />
          </div>
          <Donut
            format={inr}
            segments={[
              { label: "Deposits", value: r.invested, color: "var(--series-1)" },
              { label: "Interest", value: interest, color: "var(--series-2)" },
            ]}
          />
          <FinanceNote>Uses quarterly compounding on each instalment, the method used by Indian banks and India Post. Before tax.</FinanceNote>
        </>
      }
      below={
        rows.length > 1 ? (
          <section className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-semibold">Value by year</h2>
            <DataTable
              caption="Recurring deposit value by year"
              fileName="rd-schedule.csv"
              rows={rows}
              columns={[
                { header: "Year", cell: (y) => y.year, csv: (y) => y.year },
                { header: "Deposited", cell: (y) => inr(y.invested), csv: (y) => y.invested, align: "right" },
                { header: "Interest", cell: (y) => inr(y.value - y.invested), csv: (y) => (y.value - y.invested).toFixed(2), align: "right" },
                { header: "Value", cell: (y) => inr(y.value), csv: (y) => y.value.toFixed(2), align: "right" },
              ]}
            />
          </section>
        ) : null
      }
    />
  );
}

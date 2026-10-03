"use client";

import { useMemo } from "react";
import { Stat } from "@/components/tool/ToolCard";
import { CalculatorLayout, FinanceNote } from "@/components/finance/CalculatorLayout";
import { Donut, StackedBars } from "@/components/finance/Charts";
import { DataTable } from "@/components/finance/DataTable";
import { NumberField } from "@/components/finance/NumberField";
import { useStoredState } from "@/hooks/use-stored-state";
import { deflate, sip } from "@/lib/finance/savings";
import { formatCurrency, formatIndianCompact } from "@/lib/format";

export default function SipCalculator() {
  const [s, setS] = useStoredState("sip", { monthly: 10_000, rate: 12, years: 10, stepUp: 0, inflation: 6 });
  const r = useMemo(() => sip(s.monthly, s.rate, s.years, s.stepUp), [s.monthly, s.rate, s.years, s.stepUp]);
  const gain = r.value - r.invested;
  const real = deflate(r.value, s.inflation, s.years);
  const inr = (n: number) => formatCurrency(n, "INR", 0);

  return (
    <CalculatorLayout
      inputs={
        <>
          <NumberField label="Monthly investment" prefix="₹" value={s.monthly} min={100} max={10_000_000} slider={{ min: 500, max: 200_000, step: 500 }} onChange={(monthly) => setS({ ...s, monthly })} />
          <NumberField label="Expected annual return" suffix="%" value={s.rate} min={0} max={40} grouping={false} slider={{ min: 1, max: 30, step: 0.5 }} onChange={(rate) => setS({ ...s, rate })} hint="Equity funds have historically been volatile; returns are not guaranteed." />
          <NumberField label="Investment period" suffix="years" value={s.years} min={1} max={50} grouping={false} slider={{ min: 1, max: 40, step: 1 }} onChange={(years) => setS({ ...s, years })} />
          <NumberField label="Annual step-up" suffix="%" value={s.stepUp} min={0} max={100} grouping={false} slider={{ min: 0, max: 25, step: 1 }} onChange={(stepUp) => setS({ ...s, stepUp })} hint="Increase your SIP by this percentage every year. Use 0 for a fixed SIP." />
          <NumberField label="Inflation (for today's value)" suffix="%" value={s.inflation} min={0} max={20} grouping={false} onChange={(inflation) => setS({ ...s, inflation })} />
        </>
      }
      results={
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat emphasis className="sm:col-span-3" label={`Estimated value after ${s.years} years`} value={formatCurrency(r.value, "INR", 0)} sub={formatIndianCompact(r.value)} />
            <Stat label="Total invested" value={formatIndianCompact(r.invested)} sub={inr(r.invested)} />
            <Stat label="Estimated gains" value={formatIndianCompact(gain)} sub={inr(gain)} />
            <Stat label="In today's money" value={formatIndianCompact(real)} sub={`at ${s.inflation}% inflation`} />
          </div>
          <Donut
            format={inr}
            centerLabel="Value"
            centerValue={formatIndianCompact(r.value)}
            segments={[
              { label: "Invested", value: r.invested, color: "var(--series-1)" },
              { label: "Gains", value: Math.max(0, gain), color: "var(--series-2)" },
            ]}
          />
          <FinanceNote>Assumes a constant return compounded monthly with investments at the start of each month. Real fund returns vary every year; this is not investment advice.</FinanceNote>
        </>
      }
      below={
        <section aria-labelledby="sip-growth" className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
          <h2 id="sip-growth" className="text-lg font-semibold">Year-by-year growth</h2>
          <StackedBars
            title="Invested amount and gains at the end of each year"
            format={inr}
            series={[
              { label: "Invested", color: "var(--series-1)" },
              { label: "Gains", color: "var(--series-2)" },
            ]}
            bars={r.years.map((y) => ({ label: `Y${y.year}`, parts: [y.invested, Math.max(0, y.gain)] }))}
          />
          <DataTable
            caption="SIP growth by year"
            fileName="sip-growth.csv"
            rows={r.years}
            columns={[
              { header: "Year", cell: (y) => y.year, csv: (y) => y.year },
              { header: "Invested", cell: (y) => inr(y.invested), csv: (y) => y.invested.toFixed(2), align: "right" },
              { header: "Gains", cell: (y) => inr(y.gain), csv: (y) => y.gain.toFixed(2), align: "right" },
              { header: "Value", cell: (y) => inr(y.value), csv: (y) => y.value.toFixed(2), align: "right" },
            ]}
          />
        </section>
      }
    />
  );
}

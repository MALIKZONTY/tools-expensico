"use client";

import { Segmented } from "@/components/ui/segmented";
import { Stat } from "@/components/tool/ToolCard";
import { CalculatorLayout, FinanceNote } from "@/components/finance/CalculatorLayout";
import { NumberField } from "@/components/finance/NumberField";
import { useStoredState } from "@/hooks/use-stored-state";
import { deflate, inflate } from "@/lib/finance/savings";
import { formatCurrency, formatPercent } from "@/lib/format";

export default function InflationCalculator() {
  const [s, setS] = useStoredState("inflation", { mode: "future" as "future" | "present", amount: 100_000, rate: 6, years: 10 });
  const result = s.mode === "future" ? inflate(s.amount, s.rate, s.years) : deflate(s.amount, s.rate, s.years);
  const lost = (1 - deflate(1, s.rate, s.years)) * 100;
  const inr = (n: number) => formatCurrency(n, "INR", 0);

  return (
    <CalculatorLayout
      inputs={
        <>
          <Segmented
            label="Question"
            size="sm"
            value={s.mode}
            onChange={(mode) => setS({ ...s, mode })}
            options={[
              { value: "future", label: "Future cost of today's amount" },
              { value: "present", label: "Today's value of a future amount" },
            ]}
          />
          <NumberField label={s.mode === "future" ? "Cost today" : "Future amount"} prefix="₹" value={s.amount} min={0} max={1e12} onChange={(amount) => setS({ ...s, amount })} />
          <NumberField label="Average inflation" suffix="% per year" value={s.rate} min={0} max={50} step={0.1} grouping={false} slider={{ min: 0, max: 15, step: 0.1 }} onChange={(rate) => setS({ ...s, rate })} />
          <NumberField label="Years" value={s.years} min={0} max={100} grouping={false} slider={{ min: 1, max: 50, step: 1 }} onChange={(years) => setS({ ...s, years })} />
        </>
      }
      results={
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Stat emphasis className="sm:col-span-2" label={s.mode === "future" ? `Cost in ${s.years} years` : "Worth in today's money"} value={inr(result)} />
            <Stat label="Purchasing power lost" value={formatPercent(lost, 1)} sub={`over ${s.years} years`} />
            <Stat label="Prices multiply by" value={`${(inflate(1, s.rate, s.years)).toFixed(2)}×`} />
          </div>
          <FinanceNote>Uses a constant average inflation rate. Actual inflation varies year to year and by category — education and healthcare costs often rise faster than general CPI.</FinanceNote>
        </>
      }
    />
  );
}

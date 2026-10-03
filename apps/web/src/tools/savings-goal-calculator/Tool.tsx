"use client";

import { Stat } from "@/components/tool/ToolCard";
import { CalculatorLayout, FinanceNote } from "@/components/finance/CalculatorLayout";
import { NumberField } from "@/components/finance/NumberField";
import { Switch } from "@/components/ui/switch";
import { useStoredState } from "@/hooks/use-stored-state";
import { inflate, monthlyForGoal } from "@/lib/finance/savings";
import { formatCurrency, formatIndianCompact } from "@/lib/format";

export default function SavingsGoalCalculator() {
  const [s, setS] = useStoredState("goal", { target: 1_000_000, years: 5, rate: 10, saved: 0, adjustInflation: false, inflation: 6 });
  const target = s.adjustInflation ? inflate(s.target, s.inflation, s.years) : s.target;
  const months = Math.round(s.years * 12);
  const monthly = monthlyForGoal(target, months, s.rate, s.saved);
  const contributed = monthly * months + s.saved;
  const inr = (n: number) => formatCurrency(n, "INR", 0);

  return (
    <CalculatorLayout
      inputs={
        <>
          <NumberField label="Goal amount (today's cost)" prefix="₹" value={s.target} min={1} max={1e12} slider={{ min: 50_000, max: 10_000_000, step: 50_000 }} onChange={(target) => setS({ ...s, target })} />
          <NumberField label="Time to goal" suffix="years" value={s.years} min={0.5} max={50} step={0.5} grouping={false} slider={{ min: 1, max: 30, step: 1 }} onChange={(years) => setS({ ...s, years })} />
          <NumberField label="Already saved" prefix="₹" value={s.saved} min={0} max={1e12} onChange={(saved) => setS({ ...s, saved })} />
          <NumberField label="Expected annual return" suffix="%" value={s.rate} min={0} max={30} grouping={false} slider={{ min: 0, max: 15, step: 0.5 }} onChange={(rate) => setS({ ...s, rate })} />
          <Switch checked={s.adjustInflation} onChange={(adjustInflation) => setS({ ...s, adjustInflation })} label="Adjust goal for inflation" description="Grows the target by inflation until the goal date." />
          {s.adjustInflation && <NumberField label="Inflation" suffix="%" value={s.inflation} min={0} max={20} grouping={false} onChange={(inflation) => setS({ ...s, inflation })} />}
        </>
      }
      results={
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Stat emphasis className="sm:col-span-2" label="Save every month" value={inr(monthly)} sub={monthly === 0 ? "Your existing savings should reach the goal on their own." : undefined} />
            <Stat label="Target at goal date" value={formatIndianCompact(target)} sub={s.adjustInflation ? "inflation-adjusted" : undefined} />
            <Stat label="Growth from returns" value={formatIndianCompact(Math.max(0, target - contributed))} sub={`you put in ${formatIndianCompact(contributed)}`} />
          </div>
          <FinanceNote>Assumes savings are made at the end of each month and grow at a constant return. Higher-return investments carry more risk, especially for goals under five years away.</FinanceNote>
        </>
      }
    />
  );
}

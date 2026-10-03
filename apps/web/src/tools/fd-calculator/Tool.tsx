"use client";

import { useMemo } from "react";
import { Select } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { Stat } from "@/components/tool/ToolCard";
import { CalculatorLayout, FinanceNote } from "@/components/finance/CalculatorLayout";
import { Donut } from "@/components/finance/Charts";
import { NumberField } from "@/components/finance/NumberField";
import { useStoredState } from "@/hooks/use-stored-state";
import { fdMaturity, simpleInterest } from "@/lib/finance/savings";
import { formatCurrency, formatIndianCompact, formatPercent } from "@/lib/format";

const FREQ = { 12: "Monthly", 4: "Quarterly", 2: "Half-yearly", 1: "Yearly" } as const;

export default function FdCalculator() {
  const [s, setS] = useStoredState("fd", { amount: 100_000, rate: 7, years: 5, months: 0, freq: 4, mode: "cumulative" as "cumulative" | "payout" });
  const totalMonths = Math.max(1, Math.round(s.years * 12 + s.months));
  const r = useMemo(() => {
    if (s.mode === "cumulative") {
      const maturity = fdMaturity(s.amount, s.rate, totalMonths, s.freq);
      return { maturity, interest: maturity - s.amount, payout: 0 };
    }
    // Interest paid out each period: simple interest on the principal (non-cumulative FD).
    const interest = simpleInterest(s.amount, s.rate, totalMonths / 12);
    return { maturity: s.amount, interest, payout: (s.amount * s.rate) / 100 / s.freq };
  }, [s, totalMonths]);
  const effective = (Math.pow(1 + s.rate / 100 / s.freq, s.freq) - 1) * 100;
  const inr = (n: number) => formatCurrency(n, "INR", 0);

  return (
    <CalculatorLayout
      inputs={
        <>
          <Segmented
            label="Deposit type"
            value={s.mode}
            onChange={(mode) => setS({ ...s, mode })}
            options={[
              { value: "cumulative", label: "Cumulative (reinvest)" },
              { value: "payout", label: "Interest payout" },
            ]}
          />
          <NumberField label="Deposit amount" prefix="₹" value={s.amount} min={100} max={1_000_000_000} slider={{ min: 5_000, max: 5_000_000, step: 5_000 }} onChange={(amount) => setS({ ...s, amount })} />
          <NumberField label="Interest rate (per year)" suffix="%" value={s.rate} min={0} max={20} step={0.05} grouping={false} slider={{ min: 2, max: 10, step: 0.05 }} onChange={(rate) => setS({ ...s, rate })} />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Years" value={s.years} min={0} max={20} grouping={false} onChange={(years) => setS({ ...s, years })} />
            <NumberField label="Months" value={s.months} min={0} max={11} grouping={false} onChange={(months) => setS({ ...s, months })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fd-freq" className="text-sm font-medium">
              {s.mode === "cumulative" ? "Compounding" : "Payout frequency"}
            </label>
            <Select id="fd-freq" value={s.freq} onChange={(e) => setS({ ...s, freq: Number(e.target.value) })}>
              {Object.entries(FREQ).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
            {s.mode === "cumulative" && <p className="text-sm text-muted">Most Indian banks compound FDs quarterly.</p>}
          </div>
        </>
      }
      results={
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {s.mode === "cumulative" ? (
              <Stat emphasis className="sm:col-span-2" label="Maturity value" value={inr(r.maturity)} sub={`after ${totalMonths} months`} />
            ) : (
              <Stat emphasis className="sm:col-span-2" label={`${FREQ[s.freq as keyof typeof FREQ]} interest payout`} value={inr(r.payout)} sub={`principal of ${inr(s.amount)} returned at maturity`} />
            )}
            <Stat label="Total interest" value={formatIndianCompact(r.interest)} sub={inr(r.interest)} />
            <Stat label="Effective annual yield" value={formatPercent(s.mode === "cumulative" ? effective : s.rate)} sub={s.mode === "cumulative" ? `${FREQ[s.freq as keyof typeof FREQ].toLowerCase()} compounding` : "interest not reinvested"} />
          </div>
          <Donut
            format={inr}
            segments={[
              { label: "Deposit", value: s.amount, color: "var(--series-1)" },
              { label: "Interest", value: r.interest, color: "var(--series-2)" },
            ]}
          />
          <FinanceNote>Before tax. FD interest is taxable at your slab rate and banks deduct TDS above the threshold. Senior citizens usually get a higher rate — enter the rate your bank quotes.</FinanceNote>
        </>
      }
    />
  );
}

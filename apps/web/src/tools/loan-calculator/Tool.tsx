"use client";

import { useMemo } from "react";
import { Alert } from "@/components/ui/alert";
import { Segmented } from "@/components/ui/segmented";
import { Stat } from "@/components/tool/ToolCard";
import { CalculatorLayout, FinanceNote } from "@/components/finance/CalculatorLayout";
import { NumberField } from "@/components/finance/NumberField";
import { useStoredState } from "@/hooks/use-stored-state";
import { amortize, emi, monthsForEmi, principalForEmi } from "@/lib/finance/loan";
import { formatCurrency, formatIndianCompact } from "@/lib/format";

type Mode = "afford" | "tenure" | "prepay";

function yearsMonths(m: number) {
  const y = Math.floor(m / 12);
  const r = m % 12;
  return [y ? `${y} yr` : "", r ? `${r} mo` : ""].filter(Boolean).join(" ") || "0 mo";
}

export default function LoanCalculator() {
  const [s, setS] = useStoredState("loan", {
    mode: "afford" as Mode,
    emi: 30_000,
    rate: 9,
    years: 20,
    amount: 2_000_000,
    prepayAmount: 200_000,
    prepayMonth: 12,
    extraMonthly: 0,
  });
  const inr = (n: number) => formatCurrency(n, "INR", 0);

  const afford = useMemo(() => principalForEmi(s.emi, s.rate, s.years * 12), [s.emi, s.rate, s.years]);
  const tenure = useMemo(() => monthsForEmi(s.amount, s.rate, s.emi), [s.amount, s.rate, s.emi]);
  const prepay = useMemo(() => {
    const base = amortize(s.amount, s.rate, s.years * 12);
    const withPre = amortize(s.amount, s.rate, s.years * 12, s.prepayAmount > 0 ? [{ month: s.prepayMonth, amount: s.prepayAmount }] : [], s.extraMonthly);
    return { base, withPre };
  }, [s.amount, s.rate, s.years, s.prepayAmount, s.prepayMonth, s.extraMonthly]);

  return (
    <CalculatorLayout
      inputs={
        <>
          <Segmented
            label="Calculation"
            size="sm"
            value={s.mode}
            onChange={(mode) => setS({ ...s, mode })}
            options={[
              { value: "afford", label: "How much can I borrow?" },
              { value: "tenure", label: "How long to repay?" },
              { value: "prepay", label: "Prepayment savings" },
            ]}
          />
          {s.mode !== "afford" && <NumberField label="Loan amount" prefix="₹" value={s.amount} min={1_000} max={1e10} slider={{ min: 100_000, max: 20_000_000, step: 50_000 }} onChange={(amount) => setS({ ...s, amount })} />}
          {s.mode !== "prepay" && <NumberField label="Monthly EMI you can pay" prefix="₹" value={s.emi} min={100} max={1e9} slider={{ min: 1_000, max: 300_000, step: 500 }} onChange={(v) => setS({ ...s, emi: v })} />}
          <NumberField label="Interest rate (per year)" suffix="%" value={s.rate} min={0} max={50} step={0.05} grouping={false} slider={{ min: 5, max: 20, step: 0.05 }} onChange={(rate) => setS({ ...s, rate })} />
          {s.mode !== "tenure" && <NumberField label="Tenure" suffix="years" value={s.years} min={1} max={40} grouping={false} slider={{ min: 1, max: 30, step: 1 }} onChange={(years) => setS({ ...s, years: Math.round(years) })} />}
          {s.mode === "prepay" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <NumberField label="Lump-sum prepayment" prefix="₹" value={s.prepayAmount} min={0} max={1e10} onChange={(prepayAmount) => setS({ ...s, prepayAmount })} />
                <NumberField label="Paid in month" value={s.prepayMonth} min={1} max={480} grouping={false} onChange={(prepayMonth) => setS({ ...s, prepayMonth: Math.round(prepayMonth) })} />
              </div>
              <NumberField label="Extra every month (optional)" prefix="₹" value={s.extraMonthly} min={0} max={1e9} onChange={(extraMonthly) => setS({ ...s, extraMonthly })} />
            </>
          )}
        </>
      }
      results={
        <>
          {s.mode === "afford" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Stat emphasis className="sm:col-span-2" label="You could borrow up to" value={inr(afford)} sub={formatIndianCompact(afford)} />
              <Stat label="Total repayment" value={formatIndianCompact(s.emi * s.years * 12)} sub={inr(s.emi * s.years * 12)} />
              <Stat label="Total interest" value={formatIndianCompact(s.emi * s.years * 12 - afford)} />
            </div>
          )}
          {s.mode === "tenure" &&
            (Number.isFinite(tenure) ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Stat emphasis className="sm:col-span-2" label="Time to repay" value={yearsMonths(tenure)} sub={`${tenure} monthly payments`} />
                <Stat label="Total interest (approx.)" value={formatIndianCompact(s.emi * tenure - s.amount)} sub="last EMI is usually smaller" />
                <Stat label="Monthly interest at start" value={inr((s.amount * s.rate) / 1200)} />
              </div>
            ) : (
              <Alert tone="warning" title="This EMI never repays the loan">
                The first month&apos;s interest is {inr((s.amount * s.rate) / 1200)}, so an EMI of {inr(s.emi)} doesn&apos;t even cover interest. Increase the EMI or reduce the loan amount.
              </Alert>
            ))}
          {s.mode === "prepay" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Stat emphasis label="Interest saved" value={inr(prepay.base.totalInterest - prepay.withPre.totalInterest)} />
              <Stat emphasis label="Loan finishes earlier by" value={yearsMonths(prepay.base.months - prepay.withPre.months)} />
              <Stat label="EMI (unchanged)" value={inr(emi(s.amount, s.rate, s.years * 12))} />
              <Stat label="New tenure" value={yearsMonths(prepay.withPre.months)} sub={`instead of ${yearsMonths(prepay.base.months)}`} />
            </div>
          )}
          <FinanceNote>Prepayments are assumed to reduce tenure with the EMI unchanged. Some lenders charge prepayment fees on fixed-rate loans; floating-rate home loans to individuals generally have none.</FinanceNote>
        </>
      }
    />
  );
}

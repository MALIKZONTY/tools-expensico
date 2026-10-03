"use client";

import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { Stat } from "@/components/tool/ToolCard";
import { FinanceNote } from "@/components/finance/CalculatorLayout";
import { NumberField } from "@/components/finance/NumberField";
import { useStoredState } from "@/hooks/use-stored-state";
import { payoff, type Debt, type Strategy } from "@/lib/finance/debt";
import { formatCurrency } from "@/lib/format";

const uid = () => Math.random().toString(36).slice(2, 10);

function duration(m: number) {
  const y = Math.floor(m / 12);
  const r = m % 12;
  return [y ? `${y} yr` : "", r ? `${r} mo` : ""].filter(Boolean).join(" ") || "0 mo";
}

function debtFreeDate(months: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export default function DebtPayoffCalculator() {
  const [s, setS] = useStoredState("debt", {
    strategy: "avalanche" as Strategy,
    budget: 20_000,
    debts: [
      { id: "d1", name: "Credit card", balance: 80_000, annualRatePct: 36, minPayment: 4_000 },
      { id: "d2", name: "Personal loan", balance: 150_000, annualRatePct: 14, minPayment: 5_000 },
      { id: "d3", name: "Bike loan", balance: 40_000, annualRatePct: 11, minPayment: 2_500 },
    ] as Debt[],
  });
  const inr = (n: number) => formatCurrency(n, "INR", 0);
  const results = useMemo(() => ({ avalanche: payoff(s.debts, s.budget, "avalanche"), snowball: payoff(s.debts, s.budget, "snowball") }), [s.debts, s.budget]);
  const r = results[s.strategy];
  const minTotal = s.debts.reduce((t, d) => t + d.minPayment, 0);
  const update = (id: string, patch: Partial<Debt>) => setS({ ...s, debts: s.debts.map((d) => (d.id === id ? { ...d, ...patch } : d)) });
  const num = (v: string) => Math.max(0, Number(v.replace(/[,\s]/g, "")) || 0);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6" aria-labelledby="debts-h">
        <h2 id="debts-h" className="text-lg font-semibold">Your debts</h2>
        <div className="hidden grid-cols-[2fr_1.5fr_1fr_1.5fr_2.75rem] gap-2 text-sm font-medium text-muted sm:grid" aria-hidden>
          <span>Name</span>
          <span>Balance (₹)</span>
          <span>Interest % / yr</span>
          <span>Minimum / month (₹)</span>
          <span />
        </div>
        <ul className="flex flex-col gap-3 sm:gap-2">
          {s.debts.map((d) => (
            <li key={d.id} className="grid grid-cols-2 gap-2 rounded-lg border border-border p-3 sm:grid-cols-[2fr_1.5fr_1fr_1.5fr_2.75rem] sm:border-0 sm:p-0">
              <label className="col-span-2 flex flex-col gap-1 text-xs font-medium text-muted sm:col-span-1">
                <span className="sm:sr-only">Name</span>
                <Input value={d.name} onChange={(e) => update(d.id, { name: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                <span className="sm:sr-only">Balance (₹)</span>
                <Input inputMode="numeric" className="tabular-nums" value={d.balance ? d.balance.toLocaleString("en-IN") : ""} onChange={(e) => update(d.id, { balance: num(e.target.value) })} />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                <span className="sm:sr-only">Interest % per year</span>
                <Input inputMode="decimal" className="tabular-nums" value={String(d.annualRatePct)} onChange={(e) => update(d.id, { annualRatePct: Math.min(100, num(e.target.value)) })} />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-muted">
                <span className="sm:sr-only">Minimum per month (₹)</span>
                <Input inputMode="numeric" className="tabular-nums" value={d.minPayment ? d.minPayment.toLocaleString("en-IN") : ""} onChange={(e) => update(d.id, { minPayment: num(e.target.value) })} />
              </label>
              <div className="flex items-end justify-end">
                <Button variant="ghost" size="icon" aria-label={`Remove ${d.name}`} onClick={() => setS({ ...s, debts: s.debts.filter((x) => x.id !== d.id) })}>
                  <Trash2 aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <Button variant="secondary" size="sm" className="self-start" onClick={() => setS({ ...s, debts: [...s.debts, { id: uid(), name: `Debt ${s.debts.length + 1}`, balance: 0, annualRatePct: 12, minPayment: 0 }] })}>
          <Plus aria-hidden /> Add debt
        </Button>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField label="Total you can pay each month" prefix="₹" value={s.budget} min={0} max={1e9} hint={`Minimum payments add up to ${inr(minTotal)}.`} onChange={(budget) => setS({ ...s, budget })} />
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Strategy</span>
            <Segmented
              label="Strategy"
              value={s.strategy}
              onChange={(strategy) => setS({ ...s, strategy })}
              options={[
                { value: "avalanche", label: "Avalanche (highest rate first)" },
                { value: "snowball", label: "Snowball (smallest first)" },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6" aria-labelledby="plan-h" aria-live="polite">
        <h2 id="plan-h" className="text-lg font-semibold">Your plan</h2>
        {!r.feasible ? (
          <Alert tone="warning" title="This plan doesn't work yet">{r.reason}</Alert>
        ) : s.debts.length === 0 ? (
          <p className="text-muted">Add a debt to see a plan.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat emphasis label="Debt-free in" value={duration(r.months)} sub={`around ${debtFreeDate(r.months)}`} />
              <Stat label="Total interest" value={inr(r.totalInterest)} />
              <Stat label="Total paid" value={inr(r.totalPaid)} />
            </div>
            {results.avalanche.feasible && results.snowball.feasible && (
              <p className="rounded-lg bg-info-soft px-4 py-3 text-sm text-info-soft-fg">
                Avalanche costs {inr(results.avalanche.totalInterest)} in interest ({duration(results.avalanche.months)}); snowball costs {inr(results.snowball.totalInterest)} ({duration(results.snowball.months)}).{" "}
                {results.snowball.totalInterest - results.avalanche.totalInterest > 1 ? `Avalanche saves ${inr(results.snowball.totalInterest - results.avalanche.totalInterest)}.` : "Both cost about the same here."}
              </p>
            )}
            <ol className="flex flex-col gap-2">
              {r.order.map((id, i) => {
                const d = s.debts.find((x) => x.id === id)!;
                return (
                  <li key={id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                    <Badge tone="brand">{i + 1}</Badge>
                    <span className="font-medium">{d.name}</span>
                    <span className="text-sm text-muted">{d.annualRatePct}% · {inr(d.balance)}</span>
                    <span className="ml-auto text-sm">paid off in month <strong className="tabular-nums">{r.payoffMonth[id]}</strong></span>
                  </li>
                );
              })}
            </ol>
          </>
        )}
        <FinanceNote>Assumes fixed rates, no new borrowing and interest charged monthly on the outstanding balance. Credit cards may calculate interest daily and charge GST on interest and fees.</FinanceNote>
      </section>
    </div>
  );
}

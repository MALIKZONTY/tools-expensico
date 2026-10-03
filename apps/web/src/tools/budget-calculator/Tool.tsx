"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Stat } from "@/components/tool/ToolCard";
import { useStoredState } from "@/hooks/use-stored-state";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";

type Bucket = "needs" | "wants" | "savings";
interface Line {
  id: string;
  name: string;
  amount: number;
  bucket: Bucket;
}

const BUCKETS: { id: Bucket; label: string; target: number; hint: string }[] = [
  { id: "needs", label: "Needs", target: 50, hint: "Rent, EMIs, groceries, utilities, insurance" },
  { id: "wants", label: "Wants", target: 30, hint: "Dining out, shopping, subscriptions, travel" },
  { id: "savings", label: "Savings", target: 20, hint: "SIPs, deposits, emergency fund, extra loan payments" },
];

const uid = () => Math.random().toString(36).slice(2, 10);

const DEFAULT = {
  income: [{ id: "i1", name: "Salary (in-hand)", amount: 80_000 }],
  expenses: [
    { id: "e1", name: "Rent", amount: 22_000, bucket: "needs" },
    { id: "e2", name: "Groceries", amount: 9_000, bucket: "needs" },
    { id: "e3", name: "Utilities & phone", amount: 4_000, bucket: "needs" },
    { id: "e4", name: "Eating out", amount: 6_000, bucket: "wants" },
    { id: "e5", name: "SIP", amount: 15_000, bucket: "savings" },
  ] as Line[],
};

export default function BudgetCalculator() {
  const [s, setS] = useStoredState("budget", DEFAULT);
  const income = s.income.reduce((t, i) => t + (Number.isFinite(i.amount) ? i.amount : 0), 0);
  const totals = Object.fromEntries(BUCKETS.map((b) => [b.id, s.expenses.filter((e) => e.bucket === b.id).reduce((t, e) => t + (e.amount || 0), 0)])) as Record<Bucket, number>;
  const spent = totals.needs + totals.wants + totals.savings;
  const left = income - spent;
  const inr = (n: number) => formatCurrency(n, "INR", 0);
  const amt = (v: string) => Math.max(0, Number(v.replace(/[,\s]/g, "")) || 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Monthly income" value={inr(income)} />
        <Stat label="Planned spending & saving" value={inr(spent)} />
        <Stat emphasis label={left >= 0 ? "Unallocated" : "Over budget by"} value={inr(Math.abs(left))} className={left < 0 ? "bg-danger-soft [&_p]:text-danger-soft-fg" : undefined} />
      </div>

      <section className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6" aria-labelledby="split-h">
        <h2 id="split-h" className="text-lg font-semibold">Your split vs the 50/30/20 guideline</h2>
        <ul className="mt-4 flex flex-col gap-4">
          {BUCKETS.map((b) => {
            const pct = income ? (totals[b.id] / income) * 100 : 0;
            const over = b.id === "savings" ? pct < b.target : pct > b.target;
            return (
              <li key={b.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium text-fg">{b.label} <span className="font-normal text-muted">· {b.hint}</span></span>
                  <span className="tabular-nums text-fg">
                    {inr(totals[b.id])} · <strong>{pct.toFixed(0)}%</strong> <span className="text-muted">(guide {b.target}%)</span>
                  </span>
                </div>
                <div className="relative mt-2 h-2.5 rounded-full bg-surface-3" role="img" aria-label={`${b.label}: ${pct.toFixed(0)}% of income, guideline ${b.target}%`}>
                  <div className={cn("h-full rounded-full", over ? "bg-[var(--series-2)]" : "bg-[var(--series-1)]")} style={{ width: `${Math.min(100, pct)}%` }} />
                  <div aria-hidden className="absolute -top-1 h-[18px] w-0.5 bg-fg" style={{ left: `${b.target}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6" aria-labelledby="inc-h">
          <h2 id="inc-h" className="text-lg font-semibold">Income</h2>
          {s.income.map((i) => (
            <div key={i.id} className="flex gap-2">
              <Input aria-label="Income source" value={i.name} onChange={(e) => setS({ ...s, income: s.income.map((x) => (x.id === i.id ? { ...x, name: e.target.value } : x)) })} />
              <Input aria-label={`${i.name} amount`} inputMode="numeric" className="w-36 text-right tabular-nums" value={i.amount ? i.amount.toLocaleString("en-IN") : ""} onChange={(e) => setS({ ...s, income: s.income.map((x) => (x.id === i.id ? { ...x, amount: amt(e.target.value) } : x)) })} />
              <Button variant="ghost" size="icon" aria-label={`Remove ${i.name}`} onClick={() => setS({ ...s, income: s.income.filter((x) => x.id !== i.id) })}>
                <Trash2 aria-hidden />
              </Button>
            </div>
          ))}
          <Button variant="secondary" size="sm" className="self-start" onClick={() => setS({ ...s, income: [...s.income, { id: uid(), name: "", amount: 0 }] })}>
            <Plus aria-hidden /> Add income
          </Button>
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6" aria-labelledby="exp-h">
          <h2 id="exp-h" className="text-lg font-semibold">Expenses and savings</h2>
          {s.expenses.map((e) => (
            <div key={e.id} className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_7rem_8rem_auto]">
              <Input aria-label="Expense name" value={e.name} className="col-span-2 sm:col-span-1" onChange={(ev) => setS({ ...s, expenses: s.expenses.map((x) => (x.id === e.id ? { ...x, name: ev.target.value } : x)) })} />
              <Select aria-label={`${e.name} category`} value={e.bucket} onChange={(ev) => setS({ ...s, expenses: s.expenses.map((x) => (x.id === e.id ? { ...x, bucket: ev.target.value as Bucket } : x)) })}>
                {BUCKETS.map((b) => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </Select>
              <div className="flex gap-2 sm:contents">
                <Input aria-label={`${e.name} amount`} inputMode="numeric" className="text-right tabular-nums" value={e.amount ? e.amount.toLocaleString("en-IN") : ""} onChange={(ev) => setS({ ...s, expenses: s.expenses.map((x) => (x.id === e.id ? { ...x, amount: amt(ev.target.value) } : x)) })} />
                <Button variant="ghost" size="icon" aria-label={`Remove ${e.name}`} onClick={() => setS({ ...s, expenses: s.expenses.filter((x) => x.id !== e.id) })}>
                  <Trash2 aria-hidden />
                </Button>
              </div>
            </div>
          ))}
          <Button variant="secondary" size="sm" className="self-start" onClick={() => setS({ ...s, expenses: [...s.expenses, { id: uid(), name: "", amount: 0, bucket: "needs" }] })}>
            <Plus aria-hidden /> Add line
          </Button>
        </section>
      </div>
      <p className="text-xs text-muted">Your budget is saved in this browser only. <button type="button" className="underline hover:text-fg" onClick={() => setS(DEFAULT)}>Reset to example</button></p>
    </div>
  );
}

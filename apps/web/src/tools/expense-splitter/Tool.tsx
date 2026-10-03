"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Plus, Trash2, UserPlus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Checkbox, Input, Select } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";
import { useStoredState } from "@/hooks/use-stored-state";
import { balances, settle, type Expense } from "@/lib/finance/split";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";

const uid = () => Math.random().toString(36).slice(2, 10);

interface Person {
  id: string;
  name: string;
}

export default function ExpenseSplitter() {
  const [s, setS] = useStoredState("split", {
    title: "Trip",
    people: [
      { id: "p1", name: "Asha" },
      { id: "p2", name: "Ravi" },
      { id: "p3", name: "Meera" },
    ] as Person[],
    expenses: [] as Expense[],
  });
  const [newName, setNewName] = useState("");
  const [draft, setDraft] = useState({ description: "", amount: "", paidBy: "", splitAmong: [] as string[] });

  const name = (id: string) => s.people.find((p) => p.id === id)?.name || "Someone";
  const inr = (n: number) => formatCurrency(n, "INR", 2);
  const bal = useMemo(() => balances(s.people.map((p) => p.id), s.expenses), [s]);
  const settlements = useMemo(() => settle(bal), [bal]);
  const total = s.expenses.reduce((t, e) => t + e.amount, 0);

  function addPerson() {
    const n = newName.trim();
    if (!n) return;
    setS({ ...s, people: [...s.people, { id: uid(), name: n }] });
    setNewName("");
  }

  function removePerson(id: string) {
    if (s.expenses.some((e) => e.paidBy === id || e.splitAmong.includes(id))) return;
    setS({ ...s, people: s.people.filter((p) => p.id !== id) });
  }

  const draftAmount = Number(draft.amount.replace(/,/g, ""));
  const paidBy = draft.paidBy || s.people[0]?.id || "";
  const among = draft.splitAmong.length ? draft.splitAmong : s.people.map((p) => p.id);
  const canAdd = draft.description.trim() && draftAmount > 0 && paidBy && among.length > 0;

  function addExpense() {
    if (!canAdd) return;
    setS({ ...s, expenses: [...s.expenses, { id: uid(), description: draft.description.trim(), amount: Math.round(draftAmount * 100) / 100, paidBy, splitAmong: among }] });
    setDraft({ description: "", amount: "", paidBy, splitAmong: [] });
  }

  const summary = [
    `${s.title || "Shared expenses"} — total ${inr(total)}`,
    ...settlements.map((t) => `${name(t.from)} pays ${name(t.to)} ${inr(t.amount)}`),
  ].join("\n");

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6" aria-labelledby="people-h">
          <h2 id="people-h" className="text-lg font-semibold">People</h2>
          <Input aria-label="Group name" value={s.title} onChange={(e) => setS({ ...s, title: e.target.value })} placeholder="Group name (e.g. Goa trip)" />
          <ul className="flex flex-wrap gap-2">
            {s.people.map((p) => {
              const used = s.expenses.some((e) => e.paidBy === p.id || e.splitAmong.includes(p.id));
              return (
                <li key={p.id} className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 py-1 pl-3 pr-1 text-sm">
                  {p.name}
                  <button type="button" onClick={() => removePerson(p.id)} disabled={used} title={used ? "Remove their expenses first" : `Remove ${p.name}`} aria-label={`Remove ${p.name}`} className="inline-flex size-7 items-center justify-center rounded-full text-muted hover:bg-surface-3 hover:text-fg disabled:opacity-40">
                    <Trash2 aria-hidden className="size-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addPerson();
            }}
          >
            <Input aria-label="New person's name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Add a person" maxLength={40} />
            <Button type="submit" variant="secondary" disabled={!newName.trim()}>
              <UserPlus aria-hidden /> Add
            </Button>
          </form>
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6" aria-labelledby="add-h">
          <h2 id="add-h" className="text-lg font-semibold">Add an expense</h2>
          {s.people.length < 2 ? (
            <Alert tone="info">Add at least two people to start splitting.</Alert>
          ) : (
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                addExpense();
              }}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_9rem]">
                <Input aria-label="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="What was it for?" maxLength={80} />
                <Input aria-label="Amount in rupees" inputMode="decimal" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value })} placeholder="₹ Amount" className="tabular-nums" />
              </div>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Paid by
                <Select value={paidBy} onChange={(e) => setDraft({ ...draft, paidBy: e.target.value })}>
                  {s.people.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
              </label>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">Split equally between</legend>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {s.people.map((p) => (
                    <Checkbox
                      key={p.id}
                      label={p.name}
                      checked={among.includes(p.id)}
                      onChange={(e) => {
                        const next = e.target.checked ? [...among, p.id] : among.filter((x) => x !== p.id);
                        setDraft({ ...draft, splitAmong: next });
                      }}
                    />
                  ))}
                </div>
              </fieldset>
              <Button type="submit" disabled={!canAdd} className="self-start">
                <Plus aria-hidden /> Add expense
              </Button>
            </form>
          )}
        </section>
      </div>

      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6" aria-labelledby="settle-h" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="settle-h" className="text-lg font-semibold">Settle up</h2>
            {settlements.length > 0 && <CopyButton value={summary} label="Copy summary" />}
          </div>
          {s.expenses.length === 0 ? (
            <EmptyState title="No expenses yet" description="Add what each person paid and we'll work out who owes whom." />
          ) : settlements.length === 0 ? (
            <Alert tone="success">Everyone is settled up.</Alert>
          ) : (
            <ul className="flex flex-col gap-2">
              {settlements.map((t, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2 rounded-lg bg-surface-2 px-3 py-2.5">
                  <span className="font-medium">{name(t.from)}</span>
                  <ArrowRight aria-label="pays" className="size-4 text-muted" />
                  <span className="font-medium">{name(t.to)}</span>
                  <span className="ml-auto font-semibold tabular-nums">{inr(t.amount)}</span>
                </li>
              ))}
            </ul>
          )}
          <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted">Total spent</dt>
            <dd className="font-medium tabular-nums">{inr(total)}</dd>
            {s.people.map((p) => (
              <div key={p.id} className="contents">
                <dt className="text-muted">{p.name}</dt>
                <dd className={cn("tabular-nums", bal[p.id] > 0.004 ? "text-success" : bal[p.id] < -0.004 ? "text-danger" : "text-muted")}>
                  {bal[p.id] > 0.004 ? `gets back ${inr(bal[p.id])}` : bal[p.id] < -0.004 ? `owes ${inr(-bal[p.id])}` : "settled"}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {s.expenses.length > 0 && (
          <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6" aria-labelledby="exp-list-h">
            <h2 id="exp-list-h" className="text-lg font-semibold">Expenses ({s.expenses.length})</h2>
            <ul className="divide-y divide-border">
              {s.expenses.map((e) => (
                <li key={e.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{e.description}</p>
                    <p className="text-sm text-muted">
                      {name(e.paidBy)} paid · split {e.splitAmong.length === s.people.length ? "by everyone" : `by ${e.splitAmong.map(name).join(", ")}`}
                    </p>
                  </div>
                  <span className="tabular-nums">{inr(e.amount)}</span>
                  <Button variant="ghost" size="icon-sm" aria-label={`Delete ${e.description}`} onClick={() => setS({ ...s, expenses: s.expenses.filter((x) => x.id !== e.id) })}>
                    <Trash2 aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
            <Button variant="ghost" size="sm" className="self-start text-danger" onClick={() => setS({ ...s, expenses: [] })}>
              Clear all expenses
            </Button>
          </section>
        )}
        <p className="text-xs text-muted">Saved in this browser only — nothing is uploaded. Use “Copy summary” to share the result with your group.</p>
      </div>
    </div>
  );
}

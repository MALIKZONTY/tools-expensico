export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  /** Participant ids sharing this expense equally. */
  splitAmong: string[];
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

/** Net balance per person: positive = should receive, negative = owes. Amounts in paise for exactness. */
export function balances(people: string[], expenses: Expense[]): Record<string, number> {
  const bal: Record<string, number> = Object.fromEntries(people.map((p) => [p, 0]));
  for (const e of expenses) {
    const among = e.splitAmong.filter((p) => p in bal);
    if (!among.length || !(e.paidBy in bal) || !(e.amount > 0)) continue;
    const total = Math.round(e.amount * 100);
    const share = Math.floor(total / among.length);
    let remainder = total - share * among.length;
    bal[e.paidBy] += total;
    for (const p of among) {
      // Spread leftover paise one at a time so totals always balance exactly.
      const extra = remainder > 0 ? 1 : 0;
      remainder -= extra;
      bal[p] -= share + extra;
    }
  }
  return Object.fromEntries(Object.entries(bal).map(([k, v]) => [k, v / 100]));
}

/**
 * Greedy settlement: repeatedly match the largest debtor with the largest creditor.
 * Produces at most (people − 1) payments and settles every balance exactly.
 */
export function settle(bal: Record<string, number>): Settlement[] {
  const cents = Object.entries(bal).map(([p, v]) => ({ p, v: Math.round(v * 100) }));
  const creditors = cents.filter((x) => x.v > 0).sort((a, b) => b.v - a.v);
  const debtors = cents.filter((x) => x.v < 0).map((x) => ({ p: x.p, v: -x.v })).sort((a, b) => b.v - a.v);
  const out: Settlement[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amt = Math.min(debtors[i].v, creditors[j].v);
    if (amt > 0) out.push({ from: debtors[i].p, to: creditors[j].p, amount: amt / 100 });
    debtors[i].v -= amt;
    creditors[j].v -= amt;
    if (debtors[i].v === 0) i++;
    if (creditors[j].v === 0) j++;
  }
  return out;
}

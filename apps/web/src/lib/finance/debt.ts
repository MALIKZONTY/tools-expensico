export interface Debt {
  id: string;
  name: string;
  balance: number;
  annualRatePct: number;
  minPayment: number;
}

export type Strategy = "avalanche" | "snowball";

export interface PayoffResult {
  months: number;
  totalInterest: number;
  totalPaid: number;
  /** Month each debt is cleared, by id. */
  payoffMonth: Record<string, number>;
  order: string[];
  /** Remaining total balance at the end of each month (for charts). */
  balances: number[];
  feasible: boolean;
  reason?: string;
}

const MAX_MONTHS = 600;

/**
 * Simulates paying several debts with a fixed monthly budget. Every debt gets its minimum;
 * the rest goes to the target debt (highest rate for avalanche, smallest balance for snowball).
 * When a debt is cleared, its minimum rolls into the next target.
 */
export function payoff(debtsIn: Debt[], monthlyBudget: number, strategy: Strategy): PayoffResult {
  const debts = debtsIn.filter((d) => d.balance > 0).map((d) => ({ ...d }));
  const minTotal = debts.reduce((s, d) => s + d.minPayment, 0);
  const empty = { months: 0, totalInterest: 0, totalPaid: 0, payoffMonth: {}, order: [], balances: [] };
  if (!debts.length) return { ...empty, feasible: true };
  if (monthlyBudget < minTotal) {
    return { ...empty, feasible: false, reason: `Your monthly budget must cover the minimum payments (${Math.ceil(minTotal)}).` };
  }
  const payoffMonth: Record<string, number> = {};
  const order: string[] = [];
  const balances: number[] = [];
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;
  while (debts.some((d) => d.balance > 0.005) && month < MAX_MONTHS) {
    month++;
    for (const d of debts) {
      if (d.balance <= 0) continue;
      const interest = (d.balance * d.annualRatePct) / 1200;
      d.balance += interest;
      totalInterest += interest;
    }
    let available = monthlyBudget;
    for (const d of debts) {
      if (d.balance <= 0) continue;
      const pay = Math.min(d.minPayment, d.balance, available);
      d.balance -= pay;
      available -= pay;
      totalPaid += pay;
    }
    const active = debts.filter((d) => d.balance > 0.005);
    active.sort((a, b) => (strategy === "avalanche" ? b.annualRatePct - a.annualRatePct || a.balance - b.balance : a.balance - b.balance || b.annualRatePct - a.annualRatePct));
    for (const d of active) {
      if (available <= 0) break;
      const pay = Math.min(available, d.balance);
      d.balance -= pay;
      available -= pay;
      totalPaid += pay;
    }
    for (const d of debts) {
      if (d.balance <= 0.005 && payoffMonth[d.id] === undefined) {
        d.balance = 0;
        payoffMonth[d.id] = month;
        order.push(d.id);
      }
    }
    balances.push(debts.reduce((s, d) => s + d.balance, 0));
  }
  const feasible = debts.every((d) => d.balance <= 0.005);
  return {
    months: month,
    totalInterest,
    totalPaid,
    payoffMonth,
    order,
    balances,
    feasible,
    reason: feasible ? undefined : "At this budget the debts would take more than 50 years to repay. Increase the monthly budget.",
  };
}

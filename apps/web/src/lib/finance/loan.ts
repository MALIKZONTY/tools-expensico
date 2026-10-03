/**
 * Loan maths (reducing-balance, monthly compounding — how Indian banks quote EMIs).
 * All functions are pure and covered by tests.
 */

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Monthly EMI. EMI = P·r·(1+r)^n / ((1+r)^n − 1), r = annual% / 12 / 100. */
export function emi(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 1200;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

export interface ScheduleRow {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  prepayment: number;
  balance: number;
}

export interface YearRow {
  year: number;
  principal: number;
  interest: number;
  prepayment: number;
  balance: number;
}

export interface Prepayment {
  /** One-off lump sum paid in this month (1-based). */
  month: number;
  amount: number;
}

export interface Schedule {
  emi: number;
  rows: ScheduleRow[];
  totalInterest: number;
  totalPaid: number;
  months: number;
}

/**
 * Month-by-month amortization. Prepayments reduce the outstanding balance and keep the EMI
 * unchanged, shortening the tenure (the most common choice and the one that saves the most interest).
 */
export function amortize(principal: number, annualRatePct: number, months: number, prepayments: Prepayment[] = [], monthlyExtra = 0): Schedule {
  const payment = emi(principal, annualRatePct, months);
  const r = annualRatePct / 1200;
  const rows: ScheduleRow[] = [];
  let balance = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  for (let m = 1; balance > 0.005 && m <= months * 2 + 1200; m++) {
    const interest = balance * r;
    let principalPart = Math.min(payment - interest, balance);
    if (principalPart < 0) principalPart = 0;
    balance -= principalPart;
    const lump = prepayments.filter((p) => p.month === m).reduce((s, p) => s + p.amount, 0) + monthlyExtra;
    const pre = Math.min(lump, balance);
    balance -= pre;
    if (balance < 0.005) balance = 0;
    totalInterest += interest;
    totalPaid += interest + principalPart + pre;
    rows.push({ month: m, emi: interest + principalPart, principal: principalPart, interest, prepayment: pre, balance });
  }
  return { emi: payment, rows, totalInterest, totalPaid, months: rows.length };
}

export function yearly(rows: ScheduleRow[]): YearRow[] {
  const out: YearRow[] = [];
  for (const row of rows) {
    const y = Math.ceil(row.month / 12);
    let yr = out[y - 1];
    if (!yr) {
      yr = { year: y, principal: 0, interest: 0, prepayment: 0, balance: 0 };
      out[y - 1] = yr;
    }
    yr.principal += row.principal;
    yr.interest += row.interest;
    yr.prepayment += row.prepayment;
    yr.balance = row.balance;
  }
  return out;
}

/** Principal you can borrow for a given EMI. */
export function principalForEmi(payment: number, annualRatePct: number, months: number): number {
  if (payment <= 0 || months <= 0) return 0;
  const r = annualRatePct / 1200;
  if (r === 0) return payment * months;
  const f = Math.pow(1 + r, months);
  return (payment * (f - 1)) / (r * f);
}

/** Months needed to repay with a given EMI, or Infinity if the EMI doesn't cover interest. */
export function monthsForEmi(principal: number, annualRatePct: number, payment: number): number {
  if (principal <= 0) return 0;
  const r = annualRatePct / 1200;
  if (r === 0) return Math.ceil(principal / payment);
  if (payment <= principal * r) return Infinity;
  return Math.ceil(-Math.log(1 - (r * principal) / payment) / Math.log(1 + r));
}

/** Investment and deposit maths. Pure functions, covered by tests. */

export interface GrowthYear {
  year: number;
  invested: number;
  value: number;
  gain: number;
}

/**
 * SIP future value. Contributions are made at the start of each month (annuity due),
 * growing at an equivalent monthly rate of annual% / 12 — the convention used by most
 * Indian SIP calculators. Optional annual step-up increases the instalment each year.
 */
export function sip(monthly: number, annualRatePct: number, years: number, stepUpPct = 0): { invested: number; value: number; years: GrowthYear[] } {
  const r = annualRatePct / 1200;
  let value = 0;
  let invested = 0;
  let instalment = monthly;
  const out: GrowthYear[] = [];
  const months = Math.round(years * 12);
  for (let m = 1; m <= months; m++) {
    value = (value + instalment) * (1 + r);
    invested += instalment;
    if (m % 12 === 0 || m === months) {
      out.push({ year: Math.ceil(m / 12), invested, value, gain: value - invested });
      if (m % 12 === 0) instalment *= 1 + stepUpPct / 100;
    }
  }
  return { invested, value, years: out };
}

/** Closed-form SIP future value (no step-up) — used to cross-check the simulation. */
export function sipClosedForm(monthly: number, annualRatePct: number, months: number): number {
  const r = annualRatePct / 1200;
  if (r === 0) return monthly * months;
  return monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
}

/** Lump sum compound growth: A = P(1 + r/n)^(n·t). */
export function compound(principal: number, annualRatePct: number, years: number, timesPerYear: number): number {
  return principal * Math.pow(1 + annualRatePct / 100 / timesPerYear, timesPerYear * years);
}

/**
 * Compound growth with a regular monthly contribution (added at the end of each month).
 * Non-monthly compounding uses the equivalent monthly rate so the effective annual yield
 * matches the stated compounding frequency.
 */
export function compoundWithContributions(principal: number, annualRatePct: number, years: number, timesPerYear: number, monthly: number): { value: number; invested: number; years: GrowthYear[] } {
  const effectiveMonthly = Math.pow(1 + annualRatePct / 100 / timesPerYear, timesPerYear / 12) - 1;
  let value = principal;
  let invested = principal;
  const out: GrowthYear[] = [];
  const months = Math.round(years * 12);
  for (let m = 1; m <= months; m++) {
    value = value * (1 + effectiveMonthly) + monthly;
    invested += monthly;
    if (m % 12 === 0 || m === months) out.push({ year: Math.ceil(m / 12), invested, value, gain: value - invested });
  }
  return { value, invested, years: out };
}

export function simpleInterest(principal: number, annualRatePct: number, years: number): number {
  return (principal * annualRatePct * years) / 100;
}

/** Fixed deposit maturity for a tenure in months, compounding n times a year. */
export function fdMaturity(principal: number, annualRatePct: number, months: number, timesPerYear: number): number {
  return compound(principal, annualRatePct, months / 12, timesPerYear);
}

/**
 * Recurring deposit maturity using quarterly compounding, as Indian banks and India Post do:
 * each monthly instalment earns interest compounded quarterly for the months it stays deposited.
 */
export function rdMaturity(monthly: number, annualRatePct: number, months: number): { maturity: number; invested: number } {
  const i = annualRatePct / 400;
  let maturity = 0;
  for (let k = 1; k <= months; k++) maturity += monthly * Math.pow(1 + i, k / 3);
  return { maturity, invested: monthly * months };
}

/** Future cost of something that costs `today` now. */
export function inflate(amount: number, inflationPct: number, years: number): number {
  return amount * Math.pow(1 + inflationPct / 100, years);
}

/** Today's value of a future amount. */
export function deflate(amount: number, inflationPct: number, years: number): number {
  return amount / Math.pow(1 + inflationPct / 100, years);
}

/**
 * Monthly saving (made at the end of each month) needed to reach `target` in `months`,
 * given money already saved and an expected annual return.
 */
export function monthlyForGoal(target: number, months: number, annualRatePct: number, alreadySaved = 0): number {
  if (months <= 0) return Math.max(0, target - alreadySaved);
  const r = annualRatePct / 1200;
  const fvSaved = alreadySaved * Math.pow(1 + r, months);
  const remaining = target - fvSaved;
  if (remaining <= 0) return 0;
  if (r === 0) return remaining / months;
  return (remaining * r) / (Math.pow(1 + r, months) - 1);
}

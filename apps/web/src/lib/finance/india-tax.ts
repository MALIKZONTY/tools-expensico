import { CESS_PCT, EPF, GRATUITY_PCT_OF_BASIC, NEW_REGIME, OLD_REGIME, type AgeGroup, type Slab } from "./india-tax-rules";

export type Regime = "new" | "old";

export function slabTax(income: number, slabs: Slab[]): number {
  let tax = 0;
  let lower = 0;
  for (const s of slabs) {
    if (income <= lower) break;
    const taxable = Math.min(income, s.upTo) - lower;
    tax += (taxable * s.ratePct) / 100;
    lower = s.upTo;
  }
  return tax;
}

export interface TaxResult {
  taxableIncome: number;
  slabTax: number;
  rebate: number;
  surcharge: number;
  cess: number;
  total: number;
  /** Total tax as a percentage of taxable income. */
  effectiveRatePct: number;
}

function surchargeRate(income: number, table: { above: number; ratePct: number }[]): { ratePct: number; threshold: number } {
  let r = { ratePct: 0, threshold: 0 };
  for (const row of table) if (income > row.above) r = { ratePct: row.ratePct, threshold: row.above };
  return r;
}

/**
 * Income tax on taxable income (after deductions) for an individual with salary income.
 * Includes the s.87A rebate with marginal relief (new regime), surcharge with marginal
 * relief, and 4% health & education cess.
 */
export function incomeTax(taxableIncome: number, regime: Regime, age: AgeGroup = "below60"): TaxResult {
  const income = Math.max(0, Math.floor(taxableIncome));
  const slabs = regime === "new" ? NEW_REGIME.slabs : OLD_REGIME.slabs[age];
  const rules = regime === "new" ? NEW_REGIME : OLD_REGIME;
  const base = slabTax(income, slabs);

  // Section 87A rebate.
  let rebate = 0;
  if (income <= rules.rebateIncomeLimit) {
    rebate = Math.min(base, rules.rebateMax);
  } else if (regime === "new") {
    // Marginal relief: tax may not exceed the income above the rebate limit.
    const excess = income - rules.rebateIncomeLimit;
    if (base > excess) rebate = base - excess;
  }
  const afterRebate = base - rebate;

  // Surcharge with marginal relief at each threshold.
  const { ratePct, threshold } = surchargeRate(income, rules.surcharge);
  let surcharge = (afterRebate * ratePct) / 100;
  if (ratePct > 0) {
    const atThreshold = slabTax(threshold, slabs);
    const prev = surchargeRate(threshold, rules.surcharge).ratePct;
    const maxTotal = atThreshold * (1 + prev / 100) + (income - threshold);
    if (afterRebate + surcharge > maxTotal) surcharge = Math.max(0, maxTotal - afterRebate);
  }

  const cess = ((afterRebate + surcharge) * CESS_PCT) / 100;
  const total = Math.round(afterRebate + surcharge + cess);
  return {
    taxableIncome: income,
    slabTax: base,
    rebate,
    surcharge,
    cess,
    total,
    effectiveRatePct: income > 0 ? (total / income) * 100 : 0,
  };
}

export interface SalaryInput {
  ctc: number;
  basicPctOfCtc: number;
  /** Employer PF on the ₹15,000 ceiling (₹1,800/month) or on full basic. */
  pfOn: "ceiling" | "full" | "none";
  includeGratuity: boolean;
  professionalTax: number;
  regime: Regime;
  age?: AgeGroup;
  /** Old regime only: 80C investments excluding employee PF (PF is added automatically). */
  section80C?: number;
  /** Old regime only: 80D, HRA exemption, home-loan interest and other deductions combined. */
  otherDeductions?: number;
  /** Other monthly deductions from pay (e.g. insurance, meal cards). */
  otherMonthlyDeductions?: number;
}

export interface SalaryResult {
  basic: number;
  employerPf: number;
  gratuity: number;
  gross: number;
  employeePf: number;
  professionalTax: number;
  tax: TaxResult;
  otherDeductions: number;
  inHandAnnual: number;
  inHandMonthly: number;
  deductionsUsed: number;
}

export function pfAnnual(basicAnnual: number, mode: SalaryInput["pfOn"]): number {
  if (mode === "none") return 0;
  const monthlyBasic = basicAnnual / 12;
  const wage = mode === "ceiling" ? Math.min(monthlyBasic, EPF.wageCeiling) : monthlyBasic;
  return Math.round(wage * 0.12) * 12;
}

/** CTC → in-hand estimate for a salaried employee in India. */
export function salaryBreakdown(input: SalaryInput): SalaryResult {
  const basic = (input.ctc * input.basicPctOfCtc) / 100;
  const employerPf = pfAnnual(basic, input.pfOn);
  const gratuity = input.includeGratuity ? Math.round((basic * GRATUITY_PCT_OF_BASIC) / 100) : 0;
  const gross = Math.max(0, input.ctc - employerPf - gratuity);
  const employeePf = employerPf;
  const pt = Math.max(0, input.professionalTax);

  let deductions: number;
  if (input.regime === "new") {
    deductions = Math.min(gross, NEW_REGIME.standardDeduction);
  } else {
    const c80 = Math.min(OLD_REGIME.section80CLimit, employeePf + Math.max(0, input.section80C ?? 0));
    deductions = Math.min(gross, OLD_REGIME.standardDeduction + pt + c80 + Math.max(0, input.otherDeductions ?? 0));
  }
  const tax = incomeTax(gross - deductions, input.regime, input.age);
  const other = Math.max(0, input.otherMonthlyDeductions ?? 0) * 12;
  const inHandAnnual = gross - employeePf - pt - tax.total - other;
  return {
    basic,
    employerPf,
    gratuity,
    gross,
    employeePf,
    professionalTax: pt,
    tax,
    otherDeductions: other,
    inHandAnnual,
    inHandMonthly: inHandAnnual / 12,
    deductionsUsed: deductions,
  };
}

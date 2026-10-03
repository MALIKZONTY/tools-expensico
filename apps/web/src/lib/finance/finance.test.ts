import { describe, expect, it } from "vitest";
import { amortize, emi, monthsForEmi, principalForEmi, yearly } from "./loan";
import { compound, compoundWithContributions, deflate, fdMaturity, inflate, monthlyForGoal, rdMaturity, simpleInterest, sip, sipClosedForm } from "./savings";
import { addGst, removeGst } from "./gst";
import { decreaseBy, increaseBy, percentChange, percentOf, reversePercent, stackedDiscount, whatPercent } from "./percent";
import { incomeTax, pfAnnual, salaryBreakdown, slabTax } from "./india-tax";
import { NEW_REGIME } from "./india-tax-rules";
import { monthlySplit, projectEpf } from "./epf";
import { payoff } from "./debt";
import { balances, settle } from "./split";

describe("EMI", () => {
  it("matches published bank examples", () => {
    // ₹10 lakh at 8.5% for 20 years → ₹8,678 (SBI/HDFC calculators)
    expect(emi(1_000_000, 8.5, 240)).toBeCloseTo(8678.23, 1);
    // ₹5 lakh at 10% for 5 years → ₹10,624
    expect(emi(500_000, 10, 60)).toBeCloseTo(10623.52, 1);
    // ₹1 lakh at 12% for 12 months → ₹8,885
    expect(emi(100_000, 12, 12)).toBeCloseTo(8884.88, 1);
  });
  it("handles zero interest and invalid input", () => {
    expect(emi(120_000, 0, 12)).toBe(10_000);
    expect(emi(0, 10, 12)).toBe(0);
    expect(emi(1000, 10, 0)).toBe(0);
  });
  it("amortizes to zero and totals add up", () => {
    const s = amortize(1_000_000, 8.5, 240);
    expect(s.rows).toHaveLength(240);
    expect(s.rows.at(-1)!.balance).toBe(0);
    const principalSum = s.rows.reduce((t, r) => t + r.principal, 0);
    expect(principalSum).toBeCloseTo(1_000_000, 2);
    expect(s.totalInterest).toBeCloseTo(8678.23 * 240 - 1_000_000, -1);
    expect(yearly(s.rows)).toHaveLength(20);
  });
  it("prepayments shorten tenure and reduce interest", () => {
    const base = amortize(2_000_000, 9, 240);
    const pre = amortize(2_000_000, 9, 240, [{ month: 12, amount: 200_000 }]);
    expect(pre.months).toBeLessThan(base.months);
    expect(pre.totalInterest).toBeLessThan(base.totalInterest);
    expect(pre.rows.at(-1)!.balance).toBe(0);
  });
  it("inverts correctly", () => {
    const payment = emi(750_000, 9.5, 84);
    expect(principalForEmi(payment, 9.5, 84)).toBeCloseTo(750_000, 2);
    expect(monthsForEmi(750_000, 9.5, payment)).toBe(84);
    expect(monthsForEmi(100_000, 12, 1000)).toBe(Infinity);
  });
});

describe("SIP and compounding", () => {
  it("₹10,000/month at 12% for 10 years ≈ ₹23.23 lakh", () => {
    const r = sip(10_000, 12, 10);
    expect(r.invested).toBe(1_200_000);
    expect(r.value).toBeCloseTo(2_323_390.76, 0);
    expect(r.value).toBeCloseTo(sipClosedForm(10_000, 12, 120), 4);
    expect(r.years).toHaveLength(10);
  });
  it("step-up increases each year's instalment", () => {
    const r = sip(10_000, 12, 2, 10);
    expect(r.invested).toBe(120_000 + 132_000);
  });
  it("compound interest textbook values", () => {
    expect(compound(100_000, 10, 2, 1)).toBeCloseTo(121_000, 6);
    expect(fdMaturity(100_000, 7, 60, 4)).toBeCloseTo(141_477.82, 1); // 1.0175^20 = 1.414778
    const c = compoundWithContributions(100_000, 10, 2, 1, 0);
    expect(c.value).toBeCloseTo(121_000, 4);
  });
  it("simple interest", () => {
    expect(simpleInterest(50_000, 8, 3)).toBe(12_000);
  });
  it("RD uses quarterly compounding (matches bank closed form)", () => {
    const { maturity, invested } = rdMaturity(5_000, 6.5, 12);
    expect(invested).toBe(60_000);
    const i = 6.5 / 400;
    const closed = (5_000 * (Math.pow(1 + i, 4) - 1)) / (1 - Math.pow(1 + i, -1 / 3));
    expect(maturity).toBeCloseTo(closed, 6);
    expect(maturity).toBeCloseTo(62_143.23, 1);
  });
  it("inflation and goals", () => {
    expect(inflate(100, 6, 1)).toBeCloseTo(106, 8);
    expect(deflate(106, 6, 1)).toBeCloseTo(100, 8);
    expect(monthlyForGoal(1_200, 12, 0)).toBe(100);
    expect(monthlyForGoal(1_000, 12, 8, 2_000)).toBe(0);
    const m = monthlyForGoal(1_000_000, 60, 10);
    // Future value of that monthly saving must hit the target.
    const r = 10 / 1200;
    expect((m * (Math.pow(1 + r, 60) - 1)) / r).toBeCloseTo(1_000_000, 4);
  });
});

describe("GST", () => {
  it("adds and removes GST symmetrically", () => {
    expect(addGst(1000, 18)).toMatchObject({ gst: 180, total: 1180, cgst: 90, sgst: 90, igst: 180 });
    const r = removeGst(1180, 18);
    expect(r.base).toBeCloseTo(1000, 10);
    expect(r.gst).toBeCloseTo(180, 10);
  });
});

describe("percentages", () => {
  it("covers everyday questions", () => {
    expect(percentOf(15, 200)).toBe(30);
    expect(whatPercent(30, 200)).toBe(15);
    expect(percentChange(80, 100)).toBe(25);
    expect(percentChange(100, 80)).toBe(-20);
    expect(increaseBy(200, 10)).toBeCloseTo(220);
    expect(decreaseBy(200, 10)).toBe(180);
    expect(reversePercent(110, 10)).toBeCloseTo(100);
    expect(whatPercent(1, 0)).toBeNaN();
  });
  it("stacks discounts multiplicatively", () => {
    const d = stackedDiscount(1000, [50, 20]);
    expect(d.final).toBe(400);
    expect(d.effectivePct).toBe(60);
  });
});

describe("Indian income tax (FY 2026-27)", () => {
  it("new regime: nil tax up to ₹12 lakh via rebate", () => {
    expect(incomeTax(1_200_000, "new").total).toBe(0);
    expect(slabTax(1_200_000, NEW_REGIME.slabs)).toBe(60_000);
  });
  it("new regime marginal relief just above ₹12 lakh", () => {
    // Slab tax ₹61,500 is capped at the ₹10,000 earned above ₹12L, plus 4% cess.
    expect(incomeTax(1_210_000, "new").total).toBe(10_400);
  });
  it("new regime slab values", () => {
    expect(incomeTax(1_300_000, "new").total).toBe(78_000);
    expect(incomeTax(2_000_000, "new").total).toBe(208_000);
    expect(incomeTax(2_500_000, "new").total).toBe(343_200);
  });
  it("old regime with rebate and age slabs", () => {
    expect(incomeTax(500_000, "old").total).toBe(0);
    expect(incomeTax(1_000_000, "old").total).toBe(117_000);
    expect(incomeTax(1_000_000, "old", "60to80").total).toBe(114_400);
    expect(incomeTax(1_000_000, "old", "above80").total).toBe(104_000);
  });
  it("applies surcharge with marginal relief", () => {
    const at50 = incomeTax(5_000_000, "new").total;
    const above = incomeTax(5_010_000, "new");
    // Extra ₹10,000 of income can't cost more than ₹10,000 (+cess) of extra tax.
    expect(above.total - at50).toBeLessThanOrEqual(10_400 + 1);
    expect(above.surcharge).toBeGreaterThan(0);
    // Far above the threshold, full 10% surcharge applies.
    const t = incomeTax(6_000_000, "new");
    expect(t.surcharge).toBeCloseTo(t.slabTax * 0.1, 0);
  });
});

describe("salary breakdown", () => {
  it("₹12.75L CTC style: gross minus deductions gives zero tax under new regime", () => {
    const r = salaryBreakdown({ ctc: 1_275_000, basicPctOfCtc: 40, pfOn: "none", includeGratuity: false, professionalTax: 0, regime: "new" });
    expect(r.gross).toBe(1_275_000);
    expect(r.tax.taxableIncome).toBe(1_200_000);
    expect(r.tax.total).toBe(0);
    expect(r.inHandMonthly).toBeCloseTo(106_250, 2);
  });
  it("deducts PF from both CTC and pay", () => {
    expect(pfAnnual(600_000, "full")).toBe(72_000);
    expect(pfAnnual(600_000, "ceiling")).toBe(21_600);
    const r = salaryBreakdown({ ctc: 1_500_000, basicPctOfCtc: 40, pfOn: "full", includeGratuity: true, professionalTax: 2_400, regime: "new" });
    expect(r.employerPf).toBe(72_000);
    expect(r.gross).toBe(1_500_000 - 72_000 - r.gratuity);
    expect(r.inHandAnnual).toBeCloseTo(r.gross - 72_000 - 2_400 - r.tax.total, 6);
  });
  it("old regime caps 80C at ₹1.5 lakh including employee PF", () => {
    const r = salaryBreakdown({ ctc: 1_500_000, basicPctOfCtc: 40, pfOn: "full", includeGratuity: false, professionalTax: 2_500, regime: "old", section80C: 150_000 });
    expect(r.deductionsUsed).toBe(50_000 + 2_500 + 150_000);
  });
});

describe("EPF", () => {
  it("splits contributions with EPS on the ₹15,000 ceiling", () => {
    expect(monthlySplit(30_000, 12, "full", true)).toEqual({ employee: 3_600, employerEpf: 3_600 - 1_250, eps: 1_250 });
    expect(monthlySplit(30_000, 12, "ceiling", true)).toEqual({ employee: 3_600, employerEpf: 1_800 - 1_250, eps: 1_250 });
    expect(monthlySplit(30_000, 12, "full", false).employerEpf).toBe(3_600);
  });
  it("credits interest on the monthly running balance", () => {
    const r = projectEpf({ monthlyBasic: 10_000, currentAge: 30, retirementAge: 31, currentBalance: 0, employeeRatePct: 12, employerOn: "full", epsMember: true, annualIncreasePct: 0, interestRatePct: 12 });
    const monthly = 1_200 + (1_200 - 833);
    // running balances: monthly × (1+2+…+12) = 78 × monthly; interest = 78·monthly·1%
    expect(r.totalInterest).toBeCloseTo(78 * monthly * 0.01, 6);
    expect(r.balance).toBeCloseTo(12 * monthly + 78 * monthly * 0.01, 6);
  });
});

describe("debt payoff", () => {
  const debts = [
    { id: "card", name: "Card", balance: 50_000, annualRatePct: 36, minPayment: 2_500 },
    { id: "car", name: "Car", balance: 200_000, annualRatePct: 9, minPayment: 6_000 },
  ];
  it("avalanche pays the highest rate first and costs less interest", () => {
    const a = payoff(debts, 15_000, "avalanche");
    const s = payoff(debts, 15_000, "snowball");
    expect(a.feasible).toBe(true);
    expect(a.order[0]).toBe("card");
    expect(a.totalInterest).toBeLessThanOrEqual(s.totalInterest + 0.01);
  });
  it("rejects budgets below the minimum payments", () => {
    expect(payoff(debts, 5_000, "avalanche").feasible).toBe(false);
  });
});

describe("expense splitting", () => {
  it("balances to zero and settles in at most n-1 payments", () => {
    const people = ["a", "b", "c"];
    const bal = balances(people, [
      { id: "1", description: "Hotel", amount: 9_000, paidBy: "a", splitAmong: people },
      { id: "2", description: "Cab", amount: 1_000, paidBy: "b", splitAmong: ["b", "c"] },
    ]);
    expect(Object.values(bal).reduce((s, v) => s + v, 0)).toBeCloseTo(0, 10);
    expect(bal).toEqual({ a: 6_000, b: -2_500, c: -3_500 });
    const s = settle(bal);
    expect(s.length).toBeLessThanOrEqual(2);
    expect(s).toEqual([
      { from: "c", to: "a", amount: 3_500 },
      { from: "b", to: "a", amount: 2_500 },
    ]);
  });
  it("splits indivisible amounts to the paisa", () => {
    const bal = balances(["a", "b", "c"], [{ id: "1", description: "x", amount: 100, paidBy: "a", splitAmong: ["a", "b", "c"] }]);
    expect(Object.values(bal).reduce((s, v) => s + v, 0)).toBeCloseTo(0, 10);
    expect(bal.b).toBeCloseTo(-33.33, 2);
  });
});

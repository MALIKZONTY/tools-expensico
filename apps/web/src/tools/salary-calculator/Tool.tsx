"use client";

import { useMemo } from "react";
import { Select } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { Switch } from "@/components/ui/switch";
import { Stat } from "@/components/tool/ToolCard";
import { CalculatorLayout, FinanceNote } from "@/components/finance/CalculatorLayout";
import { NumberField } from "@/components/finance/NumberField";
import { useStoredState } from "@/hooks/use-stored-state";
import { salaryBreakdown, type Regime, type SalaryInput } from "@/lib/finance/india-tax";
import { TAX_YEAR_LABEL, type AgeGroup } from "@/lib/finance/india-tax-rules";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";

export default function SalaryCalculator() {
  const [s, setS] = useStoredState<Required<SalaryInput>>("salary", {
    ctc: 1_200_000,
    basicPctOfCtc: 40,
    pfOn: "ceiling",
    includeGratuity: true,
    professionalTax: 2_400,
    regime: "new",
    age: "below60",
    section80C: 0,
    otherDeductions: 0,
    otherMonthlyDeductions: 0,
  });
  const result = useMemo(() => salaryBreakdown(s), [s]);
  const other = useMemo(() => salaryBreakdown({ ...s, regime: s.regime === "new" ? "old" : "new" }), [s]);
  const inr = (n: number) => formatCurrency(n, "INR", 0);
  const better = result.inHandAnnual >= other.inHandAnnual ? s.regime : s.regime === "new" ? "old" : "new";

  const rows: { label: string; annual: number; tone?: "minus" | "total" }[] = [
    { label: "Cost to company (CTC)", annual: s.ctc },
    { label: "Employer PF contribution", annual: -result.employerPf, tone: "minus" },
    ...(result.gratuity ? [{ label: "Gratuity (accrued, paid on leaving after 5 yrs)", annual: -result.gratuity, tone: "minus" as const }] : []),
    { label: "Gross salary", annual: result.gross, tone: "total" },
    { label: "Employee PF contribution", annual: -result.employeePf, tone: "minus" },
    { label: "Professional tax", annual: -result.professionalTax, tone: "minus" },
    { label: "Income tax (incl. 4% cess)", annual: -result.tax.total, tone: "minus" },
    ...(result.otherDeductions ? [{ label: "Other deductions", annual: -result.otherDeductions, tone: "minus" as const }] : []),
    { label: "In-hand salary", annual: result.inHandAnnual, tone: "total" },
  ];

  return (
    <CalculatorLayout
      inputs={
        <>
          <NumberField label="Annual CTC" prefix="₹" value={s.ctc} min={0} max={1e9} slider={{ min: 300_000, max: 10_000_000, step: 50_000 }} onChange={(ctc) => setS({ ...s, ctc })} />
          <NumberField label="Basic salary (% of CTC)" suffix="%" value={s.basicPctOfCtc} min={10} max={100} grouping={false} slider={{ min: 20, max: 70, step: 1 }} onChange={(basicPctOfCtc) => setS({ ...s, basicPctOfCtc })} hint="Usually 35–50%. Check your offer letter." />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pf-on" className="text-sm font-medium">Provident fund (PF)</label>
            <Select id="pf-on" value={s.pfOn} onChange={(e) => setS({ ...s, pfOn: e.target.value as SalaryInput["pfOn"] })}>
              <option value="ceiling">12% of basic, capped at ₹15,000 wage (₹1,800/month)</option>
              <option value="full">12% of full basic</option>
              <option value="none">No PF</option>
            </Select>
          </div>
          <Switch checked={s.includeGratuity} onChange={(includeGratuity) => setS({ ...s, includeGratuity })} label="Gratuity is part of my CTC" description="≈4.81% of basic. Not paid monthly." />
          <NumberField label="Professional tax (per year)" prefix="₹" value={s.professionalTax} min={0} max={2_500} hint="Set by your state: up to ₹2,500 a year; zero in states that don't levy it." onChange={(professionalTax) => setS({ ...s, professionalTax })} />
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Tax regime</span>
            <Segmented
              label="Tax regime"
              value={s.regime}
              onChange={(regime: Regime) => setS({ ...s, regime })}
              options={[
                { value: "new", label: "New (default)" },
                { value: "old", label: "Old" },
              ]}
            />
          </div>
          {s.regime === "old" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="age" className="text-sm font-medium">Age</label>
                <Select id="age" value={s.age} onChange={(e) => setS({ ...s, age: e.target.value as AgeGroup })}>
                  <option value="below60">Below 60</option>
                  <option value="60to80">60 to 79</option>
                  <option value="above80">80 or above</option>
                </Select>
              </div>
              <NumberField label="80C investments (besides PF)" prefix="₹" value={s.section80C} min={0} max={1e8} hint="ELSS, PPF, life insurance, tuition fees… Combined 80C limit is ₹1.5 lakh including your PF." onChange={(section80C) => setS({ ...s, section80C })} />
              <NumberField label="Other deductions & exemptions" prefix="₹" value={s.otherDeductions} min={0} max={1e9} hint="80D, HRA exemption, home-loan interest (24b), 80CCD(1B), etc." onChange={(otherDeductions) => setS({ ...s, otherDeductions })} />
            </>
          )}
          <NumberField label="Other monthly deductions" prefix="₹" value={s.otherMonthlyDeductions} min={0} max={1e8} hint="Optional: insurance premiums, meal cards, loans deducted from pay." onChange={(otherMonthlyDeductions) => setS({ ...s, otherMonthlyDeductions })} />
        </>
      }
      results={
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Stat emphasis label="Monthly in-hand" value={inr(result.inHandMonthly)} />
            <Stat emphasis label="Annual in-hand" value={inr(result.inHandAnnual)} />
            <Stat label="Taxable income" value={inr(result.tax.taxableIncome)} sub={`after ${inr(result.deductionsUsed)} of deductions`} />
            <Stat label="Income tax" value={inr(result.tax.total)} sub={`${result.tax.effectiveRatePct.toFixed(1)}% of taxable income`} />
          </div>
          <div className="table-scroll rounded-lg border border-border">
            <table className="w-full text-sm">
              <caption className="sr-only">Salary breakdown</caption>
              <thead className="bg-surface-2 text-muted">
                <tr>
                  <th scope="col" className="px-2 py-2 text-left font-medium sm:px-3">Component</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Monthly</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Annual</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className={cn("border-t border-border", r.tone === "total" && "bg-surface-2 font-semibold")}>
                    <th scope="row" className="px-3 py-2 text-left font-[inherit] text-fg">{r.label}</th>
                    <td className={cn("px-3 py-2 text-right tabular-nums", r.tone === "minus" ? "text-muted" : "text-fg")}>{inr(r.annual / 12)}</td>
                    <td className={cn("px-3 py-2 text-right tabular-nums", r.tone === "minus" ? "text-muted" : "text-fg")}>{inr(r.annual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="rounded-lg bg-info-soft px-4 py-3 text-sm text-info-soft-fg">
            {Math.abs(result.inHandAnnual - other.inHandAnnual) < 1
              ? "Both tax regimes give the same take-home pay with these inputs."
              : better === s.regime
                ? `The ${s.regime} regime gives you ${inr(Math.abs(result.inHandAnnual - other.inHandAnnual))} more a year than the ${s.regime === "new" ? "old" : "new"} regime.`
                : `Switching to the ${better} regime would give you ${inr(Math.abs(result.inHandAnnual - other.inHandAnnual))} more a year.`}
          </p>
          <FinanceNote>
            {TAX_YEAR_LABEL} rules for resident individuals with salary income only. HRA, LTA, other allowances, NPS and surcharge-relevant income are simplified. Your employer&apos;s payroll may spread tax
            differently across months.
          </FinanceNote>
        </>
      }
    />
  );
}

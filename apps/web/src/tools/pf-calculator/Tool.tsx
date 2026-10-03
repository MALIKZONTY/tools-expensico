"use client";

import { useMemo } from "react";
import { Segmented } from "@/components/ui/segmented";
import { Switch } from "@/components/ui/switch";
import { Stat } from "@/components/tool/ToolCard";
import { CalculatorLayout, FinanceNote } from "@/components/finance/CalculatorLayout";
import { StackedBars } from "@/components/finance/Charts";
import { DataTable } from "@/components/finance/DataTable";
import { NumberField } from "@/components/finance/NumberField";
import { useStoredState } from "@/hooks/use-stored-state";
import { monthlySplit, projectEpf, type EpfInput } from "@/lib/finance/epf";
import { EPF } from "@/lib/finance/india-tax-rules";
import { formatCurrency, formatIndianCompact } from "@/lib/format";

export default function PfCalculator() {
  const [s, setS] = useStoredState<EpfInput>("pf", {
    monthlyBasic: 30_000,
    currentAge: 30,
    retirementAge: 58,
    currentBalance: 0,
    employeeRatePct: 12,
    employerOn: "full",
    epsMember: true,
    annualIncreasePct: 5,
    interestRatePct: EPF.interestRatePct,
  });
  const r = useMemo(() => projectEpf(s), [s]);
  const split = monthlySplit(s.monthlyBasic, s.employeeRatePct, s.employerOn, s.epsMember);
  const inr = (n: number) => formatCurrency(n, "INR", 0);

  return (
    <CalculatorLayout
      inputs={
        <>
          <NumberField label="Monthly basic + DA" prefix="₹" value={s.monthlyBasic} min={0} max={1e8} slider={{ min: 5_000, max: 300_000, step: 1_000 }} onChange={(monthlyBasic) => setS({ ...s, monthlyBasic })} />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Current age" value={s.currentAge} min={15} max={70} grouping={false} onChange={(currentAge) => setS({ ...s, currentAge: Math.round(currentAge) })} />
            <NumberField label="Retirement age" value={s.retirementAge} min={s.currentAge + 1} max={75} grouping={false} onChange={(retirementAge) => setS({ ...s, retirementAge: Math.round(retirementAge) })} />
          </div>
          <NumberField label="Current EPF balance" prefix="₹" value={s.currentBalance} min={0} max={1e10} onChange={(currentBalance) => setS({ ...s, currentBalance })} />
          <NumberField label="Your contribution" suffix="% of basic" value={s.employeeRatePct} min={12} max={100} grouping={false} hint="12% is mandatory; anything more is a voluntary contribution (VPF)." onChange={(employeeRatePct) => setS({ ...s, employeeRatePct })} />
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Employer contributes on</span>
            <Segmented
              label="Employer contribution basis"
              size="sm"
              value={s.employerOn}
              onChange={(employerOn) => setS({ ...s, employerOn })}
              options={[
                { value: "full", label: "Full basic" },
                { value: "ceiling", label: "₹15,000 ceiling" },
              ]}
            />
          </div>
          <Switch checked={s.epsMember} onChange={(epsMember) => setS({ ...s, epsMember })} label="Member of EPS (pension)" description="8.33% of up to ₹15,000 goes to the pension scheme instead of your PF balance." />
          <NumberField label="Expected annual salary increase" suffix="%" value={s.annualIncreasePct} min={0} max={50} grouping={false} onChange={(annualIncreasePct) => setS({ ...s, annualIncreasePct })} />
          <NumberField label="EPF interest rate" suffix="%" value={s.interestRatePct} min={0} max={15} step={0.05} grouping={false} hint={`${EPF.interestRatePct}% was declared for ${EPF.interestRateYear}. Future rates may differ.`} onChange={(interestRatePct) => setS({ ...s, interestRatePct })} />
        </>
      }
      results={
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat emphasis className="sm:col-span-3" label={`EPF balance at ${s.retirementAge}`} value={inr(r.balance)} sub={formatIndianCompact(r.balance)} />
            <Stat label="Your contributions" value={formatIndianCompact(r.totalEmployee)} />
            <Stat label="Employer contributions" value={formatIndianCompact(r.totalEmployer)} />
            <Stat label="Interest earned" value={formatIndianCompact(r.totalInterest)} />
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-4 text-sm">
            <p className="font-medium text-fg">This month&apos;s contributions</p>
            <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
              <dt className="text-muted">You → EPF</dt>
              <dd className="tabular-nums">{inr(split.employee)}</dd>
              <dt className="text-muted">Employer → EPF</dt>
              <dd className="tabular-nums">{inr(split.employerEpf)}</dd>
              <dt className="text-muted">Employer → EPS (pension)</dt>
              <dd className="tabular-nums">{inr(split.eps)}</dd>
            </dl>
          </div>
          <FinanceNote>Interest is calculated on the monthly running balance and credited yearly, as EPFO does. Interest on employee contributions above ₹2.5 lakh a year is taxable.</FinanceNote>
        </>
      }
      below={
        r.years.length > 0 ? (
          <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold">Projection by year</h2>
            <StackedBars
              title="Contributions and interest added each year"
              format={inr}
              series={[
                { label: "Contributions", color: "var(--series-1)" },
                { label: "Interest", color: "var(--series-2)" },
              ]}
              bars={r.years.map((y) => ({ label: `${y.age}`, parts: [y.employee + y.employer, y.interest] }))}
            />
            <DataTable
              caption="EPF projection by year"
              fileName="epf-projection.csv"
              rows={r.years}
              columns={[
                { header: "Age", cell: (y) => y.age, csv: (y) => y.age },
                { header: "You", cell: (y) => inr(y.employee), csv: (y) => y.employee, align: "right" },
                { header: "Employer", cell: (y) => inr(y.employer), csv: (y) => y.employer, align: "right" },
                { header: "Interest", cell: (y) => inr(y.interest), csv: (y) => y.interest.toFixed(2), align: "right" },
                { header: "Balance", cell: (y) => inr(y.balance), csv: (y) => y.balance.toFixed(2), align: "right" },
              ]}
            />
          </section>
        ) : null
      }
    />
  );
}

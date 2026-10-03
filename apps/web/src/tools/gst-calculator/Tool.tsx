"use client";

import { Segmented } from "@/components/ui/segmented";
import { Stat } from "@/components/tool/ToolCard";
import { CalculatorLayout, FinanceNote } from "@/components/finance/CalculatorLayout";
import { NumberField } from "@/components/finance/NumberField";
import { useStoredState } from "@/hooks/use-stored-state";
import { COMMON_GST_RATES, addGst, removeGst } from "@/lib/finance/gst";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";

export default function GstCalculator() {
  const [s, setS] = useStoredState("gst", { amount: 1_000, rate: 18, mode: "add" as "add" | "remove", supply: "intra" as "intra" | "inter" });
  const r = s.mode === "add" ? addGst(s.amount, s.rate) : removeGst(s.amount, s.rate);
  const inr = (n: number) => formatCurrency(n, "INR", 2);

  return (
    <CalculatorLayout
      inputs={
        <>
          <Segmented
            label="Calculation"
            value={s.mode}
            onChange={(mode) => setS({ ...s, mode })}
            options={[
              { value: "add", label: "Add GST" },
              { value: "remove", label: "Remove GST" },
            ]}
          />
          <NumberField label={s.mode === "add" ? "Amount before GST" : "Amount including GST"} prefix="₹" value={s.amount} min={0} max={1e12} onChange={(amount) => setS({ ...s, amount })} />
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">GST rate</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Common GST rates">
              {COMMON_GST_RATES.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  aria-pressed={s.rate === rate}
                  onClick={() => setS({ ...s, rate })}
                  className={cn("h-10 min-w-14 rounded-md border px-3 text-sm font-medium", s.rate === rate ? "border-brand bg-brand-soft text-brand-soft-fg" : "border-border bg-surface hover:bg-surface-2")}
                >
                  {rate}%
                </button>
              ))}
            </div>
            <NumberField label="Custom rate" suffix="%" value={s.rate} min={0} max={100} step={0.01} grouping={false} onChange={(rate) => setS({ ...s, rate })} />
          </div>
          <Segmented
            label="Type of supply"
            size="sm"
            value={s.supply}
            onChange={(supply) => setS({ ...s, supply })}
            options={[
              { value: "intra", label: "Within a state (CGST + SGST)" },
              { value: "inter", label: "Between states (IGST)" },
            ]}
          />
        </>
      }
      results={
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat label="Taxable value" value={inr(r.base)} />
            <Stat label={`GST @ ${s.rate}%`} value={inr(r.gst)} />
            <Stat emphasis label="Total" value={inr(r.total)} />
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-4 text-sm">
            <p className="font-medium text-fg">Tax split</p>
            <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
              {s.supply === "intra" ? (
                <>
                  <dt className="text-muted">CGST @ {s.rate / 2}%</dt>
                  <dd className="tabular-nums">{inr(r.cgst)}</dd>
                  <dt className="text-muted">SGST/UTGST @ {s.rate / 2}%</dt>
                  <dd className="tabular-nums">{inr(r.sgst)}</dd>
                </>
              ) : (
                <>
                  <dt className="text-muted">IGST @ {s.rate}%</dt>
                  <dd className="tabular-nums">{inr(r.igst)}</dd>
                </>
              )}
            </dl>
          </div>
          <p className="font-mono text-sm text-muted">
            {s.mode === "add" ? `GST = ${s.amount} × ${s.rate} / 100` : `Taxable value = ${s.amount} × 100 / (100 + ${s.rate})`}
          </p>
          <FinanceNote>Check the correct GST rate for your goods or service (HSN/SAC code) on the official GST portal. Invoices usually round tax to the nearest rupee or paisa.</FinanceNote>
        </>
      }
    />
  );
}

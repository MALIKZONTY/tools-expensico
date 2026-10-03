"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stat } from "@/components/tool/ToolCard";
import { CalculatorLayout } from "@/components/finance/CalculatorLayout";
import { NumberField } from "@/components/finance/NumberField";
import { useStoredState } from "@/hooks/use-stored-state";
import { stackedDiscount } from "@/lib/finance/percent";
import { formatCurrency, formatPercent } from "@/lib/format";

export default function DiscountCalculator() {
  const [s, setS] = useStoredState("discount", { price: 2_999, discounts: [50, 20], tax: 0 });
  const r = stackedDiscount(s.price, s.discounts);
  const finalWithTax = r.final * (1 + s.tax / 100);
  const inr = (n: number) => formatCurrency(n, "INR", 2);

  return (
    <CalculatorLayout
      inputs={
        <>
          <NumberField label="Original price" prefix="₹" value={s.price} min={0} max={1e12} onChange={(price) => setS({ ...s, price })} />
          {s.discounts.map((d, i) => (
            <div key={i} className="flex items-end gap-2">
              <NumberField
                className="flex-1"
                label={i === 0 ? "Discount" : `Extra discount ${i}`}
                suffix="%"
                value={d}
                min={0}
                max={100}
                grouping={false}
                onChange={(v) => setS({ ...s, discounts: s.discounts.map((x, j) => (j === i ? v : x)) })}
              />
              {s.discounts.length > 1 && (
                <Button variant="ghost" size="icon" aria-label={`Remove discount ${i + 1}`} onClick={() => setS({ ...s, discounts: s.discounts.filter((_, j) => j !== i) })}>
                  <X aria-hidden />
                </Button>
              )}
            </div>
          ))}
          {s.discounts.length < 5 && (
            <Button variant="secondary" size="sm" className="self-start" onClick={() => setS({ ...s, discounts: [...s.discounts, 10] })}>
              <Plus aria-hidden />
              Add another discount
            </Button>
          )}
          <NumberField label="Tax added after discount (optional)" suffix="%" value={s.tax} min={0} max={100} grouping={false} onChange={(tax) => setS({ ...s, tax })} />
        </>
      }
      results={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Stat emphasis className="sm:col-span-2" label="You pay" value={inr(s.tax ? finalWithTax : r.final)} sub={s.tax ? `${inr(r.final)} + ${s.tax}% tax` : undefined} />
          <Stat label="You save" value={inr(r.saved)} />
          <Stat label="Effective discount" value={formatPercent(r.effectivePct)} sub={s.discounts.length > 1 ? `not ${formatPercent(s.discounts.reduce((a, b) => a + b, 0))}` : undefined} />
        </div>
      }
    />
  );
}

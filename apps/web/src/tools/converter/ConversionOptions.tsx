"use client";

import type { ConversionDef } from "@/lib/convert/catalog";
import type { OptionValues } from "@/lib/processing";
import { cn } from "@/lib/cn";
import { Checkbox, Field, Input, Range, Select } from "@/components/ui/field";

export function ConversionOptions({ def, values, onChange, disabled, columns = 2 }: { def: ConversionDef; values: OptionValues; onChange: (v: OptionValues) => void; disabled?: boolean; columns?: 1 | 2 }) {
  const options = def.options ?? [];
  if (!options.length) return null;
  const set = (id: string, v: string | number | boolean) => onChange({ ...values, [id]: v });

  return (
    <fieldset disabled={disabled} className={cn("grid grid-cols-1 gap-4", columns === 2 && "sm:grid-cols-2")}>
      <legend className="sr-only">Conversion options</legend>
      {options.map((o) => {
        switch (o.type) {
          case "select":
            return (
              <Field key={o.id} label={o.label} hint={o.hint}>
                {(p) => (
                  <Select {...p} value={String(values[o.id] ?? o.default)} onChange={(e) => set(o.id, e.target.value)}>
                    {o.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            );
          case "range": {
            const v = Number(values[o.id] ?? o.default);
            return (
              <Field key={o.id} label={o.label} hint={o.hint} trailing={<span className="text-sm tabular-nums text-muted">{v}{o.unit ?? ""}</span>}>
                {(p) => <Range {...p} min={o.min} max={o.max} step={o.step} value={v} onChange={(e) => set(o.id, Number(e.target.value))} />}
              </Field>
            );
          }
          case "color":
            return (
              <Field key={o.id} label={o.label} hint={o.hint}>
                {(p) => (
                  <div className="flex items-center gap-2">
                    <input
                      {...p}
                      type="color"
                      value={String(values[o.id] ?? o.default)}
                      onChange={(e) => set(o.id, e.target.value)}
                      className="h-11 w-14 cursor-pointer rounded-md border border-border-strong bg-surface p-1"
                    />
                    <span className="font-mono text-sm text-muted">{String(values[o.id] ?? o.default)}</span>
                  </div>
                )}
              </Field>
            );
          case "text":
            return (
              <Field key={o.id} label={o.label} hint={o.hint}>
                {(p) => <Input {...p} value={String(values[o.id] ?? o.default)} placeholder={o.placeholder} onChange={(e) => set(o.id, e.target.value)} />}
              </Field>
            );
          case "checkbox":
            return (
              <Checkbox
                key={o.id}
                className={columns === 2 ? "sm:col-span-2" : undefined}
                label={o.label}
                description={o.hint}
                checked={Boolean(values[o.id] ?? o.default)}
                onChange={(e) => set(o.id, e.target.checked)}
              />
            );
        }
      })}
    </fieldset>
  );
}

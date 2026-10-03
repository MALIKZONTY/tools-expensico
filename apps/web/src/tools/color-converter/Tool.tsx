"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/field";
import { contrastRatio, parseColor, rgbToCmyk, rgbToHsl, rgbToHsv, rgbToOklch, toHex, type Rgb } from "@/lib/dev/color";

const r1 = (n: number) => Math.round(n * 10) / 10;

function formats(c: Rgb) {
  const hsl = rgbToHsl(c);
  const hsv = rgbToHsv(c);
  const cmyk = rgbToCmyk(c);
  const ok = rgbToOklch(c);
  const alpha = c.a < 1 ? ` / ${r1(c.a)}` : "";
  return [
    ["HEX", toHex(c)],
    ["RGB", `rgb(${c.r} ${c.g} ${c.b}${alpha})`],
    ["HSL", `hsl(${Math.round(hsl.h)} ${Math.round(hsl.s)}% ${Math.round(hsl.l)}%${alpha})`],
    ["HSV / HSB", `${Math.round(hsv.h)}°, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%`],
    ["CMYK", `${Math.round(cmyk.c)}%, ${Math.round(cmyk.m)}%, ${Math.round(cmyk.y)}%, ${Math.round(cmyk.k)}%`],
    ["OKLCH", `oklch(${r1(ok.l)}% ${Math.round(ok.c * 1000) / 1000} ${Math.round(ok.h)}${alpha})`],
  ] as const;
}

function Pass({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={ok ? "inline-flex items-center gap-1 text-success" : "inline-flex items-center gap-1 text-danger"}>
      {ok ? <CheckCircle2 aria-hidden className="size-4" /> : <XCircle aria-hidden className="size-4" />}
      {label} {ok ? "pass" : "fail"}
    </span>
  );
}

export default function ColorConverter() {
  const [input, setInput] = useState("#0d7a63");
  const [bgInput, setBgInput] = useState("#ffffff");
  const color = useMemo(() => parseColor(input), [input]);
  const bg = useMemo(() => parseColor(bgInput), [bgInput]);
  const ratio = color && bg ? contrastRatio(color, bg) : null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6" aria-labelledby="cc-h">
        <h2 id="cc-h" className="text-lg font-semibold">Convert a colour</h2>
        <div className="flex gap-2">
          <input type="color" aria-label="Pick a colour" value={color ? toHex({ ...color, a: 1 }) : "#000000"} onChange={(e) => setInput(e.target.value)} className="h-11 w-14 cursor-pointer rounded-md border border-border-strong bg-surface p-1" />
          <Input aria-label="Colour value" value={input} onChange={(e) => setInput(e.target.value)} placeholder="#0d7a63, rgb(13 122 99), hsl(167 81% 27%)" className="font-mono" />
        </div>
        {!color ? (
          <Alert tone="warning">Enter a HEX (#rgb, #rrggbb, #rrggbbaa), rgb() or hsl() colour.</Alert>
        ) : (
          <>
            <div className="checkerboard h-24 overflow-hidden rounded-lg border border-border">
              <div className="h-full w-full" style={{ background: `rgb(${color.r} ${color.g} ${color.b} / ${color.a})` }} />
            </div>
            <dl className="divide-y divide-border rounded-lg border border-border">
              {formats(color).map(([k, v]) => (
                <div key={k} className="flex items-center gap-3 px-3 py-2">
                  <dt className="w-24 shrink-0 text-sm text-muted">{k}</dt>
                  <dd className="min-w-0 flex-1 truncate font-mono text-sm">{v}</dd>
                  <CopyButton value={v} size="icon-sm" variant="ghost" label={`Copy ${k}`} />
                </div>
              ))}
            </dl>
          </>
        )}
      </section>
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6" aria-labelledby="contrast-h">
        <h2 id="contrast-h" className="text-lg font-semibold">Contrast checker (WCAG 2.2)</h2>
        <p className="text-sm text-muted">Text colour is the colour on the left. Choose a background:</p>
        <div className="flex gap-2">
          <input type="color" aria-label="Pick background colour" value={bg ? toHex({ ...bg, a: 1 }) : "#ffffff"} onChange={(e) => setBgInput(e.target.value)} className="h-11 w-14 cursor-pointer rounded-md border border-border-strong bg-surface p-1" />
          <Input aria-label="Background colour" value={bgInput} onChange={(e) => setBgInput(e.target.value)} className="font-mono" />
        </div>
        {color && bg && ratio !== null && (
          <>
            <div className="rounded-lg border border-border p-5" style={{ background: toHex({ ...bg, a: 1 }), color: toHex({ ...color, a: 1 }) }}>
              <p className="text-2xl font-semibold">Large heading text</p>
              <p className="mt-1">Normal body text at regular size — can you read this comfortably?</p>
            </div>
            <p className="text-3xl font-semibold tabular-nums">{ratio.toFixed(2)}:1</p>
            <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <li><Pass ok={ratio >= 4.5} label="AA normal text (4.5:1)" /></li>
              <li><Pass ok={ratio >= 3} label="AA large text (3:1)" /></li>
              <li><Pass ok={ratio >= 7} label="AAA normal text (7:1)" /></li>
              <li><Pass ok={ratio >= 4.5} label="AAA large text (4.5:1)" /></li>
            </ul>
            {color.a < 1 && <p className="text-xs text-muted">Transparency is ignored in the contrast calculation.</p>}
          </>
        )}
      </section>
    </div>
  );
}

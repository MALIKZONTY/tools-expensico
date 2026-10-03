"use client";

import { useState } from "react";
import { Checkbox, Select } from "@/components/ui/field";
import { FormatterTool } from "@/components/tool/FormatterTool";
import { prettierFormat } from "@/lib/dev/prettier";

const SAMPLE = 'const total=items.reduce((sum,{qty,price})=>sum+qty*price,0);export async function checkout(cart,{coupon}={}){if(!cart.length)throw new Error("Cart is empty");const res=await fetch("/api/orders",{method:"POST",body:JSON.stringify({cart,coupon})});return res.json()}';

export default function JsFormatter() {
  const [lang, setLang] = useState<"babel" | "typescript">("babel");
  const [semi, setSemi] = useState(true);
  const [single, setSingle] = useState(false);
  const [width, setWidth] = useState(80);
  return (
    <FormatterTool
      language={lang === "babel" ? "JavaScript" : "TypeScript"}
      sample={SAMPLE}
      fileName={lang === "babel" ? "formatted.js" : "formatted.ts"}
      mime="text/javascript"
      accept=".js,.mjs,.cjs,.jsx,.ts,.tsx,text/javascript"
      deps={[lang, semi, single, width]}
      format={(code) => prettierFormat(code, lang, { semi, singleQuote: single, printWidth: width })}
      toolbar={
        <>
          <label className="flex flex-col gap-1 text-sm font-medium">Language
            <Select value={lang} onChange={(e) => setLang(e.target.value as typeof lang)} className="h-10 w-48">
              <option value="babel">JavaScript / JSX</option><option value="typescript">TypeScript / TSX</option>
            </Select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">Line width
            <Select value={width} onChange={(e) => setWidth(Number(e.target.value))} className="h-10 w-24">
              {[80, 100, 120].map((w) => <option key={w} value={w}>{w}</option>)}
            </Select>
          </label>
          <Checkbox label="Semicolons" checked={semi} onChange={(e) => setSemi(e.target.checked)} className="self-end pb-2" />
          <Checkbox label="Single quotes" checked={single} onChange={(e) => setSingle(e.target.checked)} className="self-end pb-2" />
        </>
      }
    />
  );
}

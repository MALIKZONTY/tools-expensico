"use client";

import { useState } from "react";
import { Select } from "@/components/ui/field";
import { FormatterTool } from "@/components/tool/FormatterTool";
import { prettierFormat } from "@/lib/dev/prettier";

const SAMPLE = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Invoice</title></head><body><div class="card"><h1>Invoice #1024</h1><p>Thank you for your order, <strong>Asha</strong>.</p><ul><li>Notebook × 2</li><li>Pen × 5</li></ul><a href="/pay" class="btn">Pay now</a></div></body></html>';

export default function HtmlFormatter() {
  const [width, setWidth] = useState(100);
  const [indent, setIndent] = useState(2);
  return (
    <FormatterTool
      language="HTML"
      sample={SAMPLE}
      fileName="formatted.html"
      mime="text/html"
      accept=".html,.htm,text/html"
      deps={[width, indent]}
      format={(code) => prettierFormat(code, "html", { printWidth: width, tabWidth: indent, htmlWhitespaceSensitivity: "css" })}
      toolbar={
        <>
          <label className="flex flex-col gap-1 text-sm font-medium">Line width
            <Select value={width} onChange={(e) => setWidth(Number(e.target.value))} className="h-10 w-28">
              {[80, 100, 120].map((w) => <option key={w} value={w}>{w}</option>)}
            </Select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">Indent
            <Select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="h-10 w-28">
              <option value={2}>2 spaces</option><option value={4}>4 spaces</option>
            </Select>
          </label>
        </>
      }
    />
  );
}

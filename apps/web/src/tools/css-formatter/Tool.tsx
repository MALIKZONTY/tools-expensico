"use client";

import { useState } from "react";
import { Select } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { FormatterTool } from "@/components/tool/FormatterTool";
import { prettierFormat } from "@/lib/dev/prettier";
import { minifyCss } from "@/lib/dev/css-minify";

const SAMPLE = ".card{display:flex;gap:12px;padding:16px 20px;border:1px solid #e1e5e3;border-radius:12px}.card:hover{box-shadow:0 4px 12px rgb(0 0 0/.08)}@media (max-width:600px){.card{flex-direction:column}}";

export default function CssFormatter() {
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [syntax, setSyntax] = useState<"css" | "scss" | "less">("css");
  return (
    <FormatterTool
      language="CSS"
      sample={SAMPLE}
      fileName={mode === "minify" ? "styles.min.css" : `styles.${syntax}`}
      mime="text/css"
      accept=".css,.scss,.less,text/css"
      deps={[mode, syntax]}
      format={async (code) => {
        // Validate by parsing with Prettier first so minify never silently accepts broken CSS.
        const pretty = await prettierFormat(code, syntax);
        return mode === "minify" ? minifyCss(pretty) : pretty;
      }}
      toolbar={
        <>
          <Segmented label="Mode" value={mode} onChange={setMode} options={[{ value: "format", label: "Beautify" }, { value: "minify", label: "Minify" }]} />
          <label className="flex items-center gap-2 text-sm font-medium">Syntax
            <Select value={syntax} onChange={(e) => setSyntax(e.target.value as typeof syntax)} className="h-10 w-28">
              <option value="css">CSS</option><option value="scss">SCSS</option><option value="less">Less</option>
            </Select>
          </label>
        </>
      }
    />
  );
}

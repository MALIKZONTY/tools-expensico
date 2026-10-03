"use client";

import { useState } from "react";
import { Segmented } from "@/components/ui/segmented";
import { FormatterTool } from "@/components/tool/FormatterTool";
import { validateXml, StructuredError } from "@/lib/convert/structured";
import { formatXml, minifyXml } from "@/lib/dev/xml-format";

const SAMPLE = '<?xml version="1.0" encoding="UTF-8"?><invoice number="1024"><customer><name>Asha Rao</name><gstin>27AAPFU0939F1ZV</gstin></customer><items><item sku="BK-01" qty="2">Notebook</item><item sku="PN-07" qty="5">Pen</item></items><total currency="INR">948.50</total></invoice>';

export default function XmlFormatter() {
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [indent, setIndent] = useState<"2" | "4" | "tab">("2");
  return (
    <FormatterTool
      language="XML"
      sample={SAMPLE}
      fileName={mode === "minify" ? "minified.xml" : "formatted.xml"}
      mime="application/xml"
      accept=".xml,.svg,.rss,.atom,application/xml,text/xml"
      deps={[mode, indent]}
      format={(xml) => {
        try {
          validateXml(xml);
        } catch (e) {
          if (e instanceof StructuredError) throw new Error(`${e.message}${e.line ? ` (line ${e.line}, column ${e.column})` : ""}`);
          throw e;
        }
        return mode === "minify" ? minifyXml(xml) : formatXml(xml, indent === "tab" ? "\t" : " ".repeat(Number(indent)));
      }}
      toolbar={
        <>
          <Segmented label="Mode" value={mode} onChange={setMode} options={[{ value: "format", label: "Beautify" }, { value: "minify", label: "Minify" }]} />
          {mode === "format" && <Segmented label="Indent" size="sm" value={indent} onChange={setIndent} options={[{ value: "2", label: "2 spaces" }, { value: "4", label: "4 spaces" }, { value: "tab", label: "Tab" }]} />}
        </>
      }
    />
  );
}

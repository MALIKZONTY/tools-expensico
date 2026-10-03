import { FORMATS } from "./formats";
import type { ConversionDef } from "./catalog";
import type { ToolContent } from "@/registry/content-types";

const QUALITY_TEXT: Record<ConversionDef["quality"], string> = {
  exact: "Exact",
  high: "High fidelity",
  basic: "Basic (simplified)",
};

/** Builds the long-form page content for a converter from its hand-written catalogue entry. */
export function converterContent(def: ConversionDef): ToolContent {
  const from = FORMATS[def.from];
  const to = FORMATS[def.to];
  const c = def.content;
  const fromLabel = from.label.replace(/ \(.*\)$/, "");
  const toLabel = to.label.replace(/ \(.*\)$/, "");
  const extraInputs = def.accepts.filter((f) => f !== def.from).map((f) => FORMATS[f].label.replace(/ \(.*\)$/, ""));

  const steps = [
    def.multipleInputs ? `Choose or drop one or more ${fromLabel} files.` : `Choose or drop your ${fromLabel} file.`,
    ...(def.options?.length ? ["Adjust the options if needed — the defaults work well for most files."] : []),
    `Select Convert. ${def.engine === "server" ? "Your file is uploaded securely, converted and deleted." : "Conversion happens instantly in your browser."}`,
    def.multipleOutputs || def.multipleInputs ? "Preview the results, then download files individually or all at once as a ZIP." : `Preview the result and download your ${toLabel} file.`,
  ];

  const sections: ToolContent["sections"] = [];
  if (c) {
    sections.push({ heading: `About this ${fromLabel} to ${toLabel} converter`, body: <p>{c.intro}</p> });
    sections.push({
      heading: `How ${fromLabel} to ${toLabel} conversion works`,
      body: (
        <>
          <ol>
            {c.how.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p>
            <strong>Conversion quality: {QUALITY_TEXT[def.quality]}.</strong> {def.qualityNote}
          </p>
        </>
      ),
    });
    sections.push({
      heading: `When to convert ${fromLabel} to ${toLabel}`,
      body: (
        <ul>
          {c.whenToUse.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ),
    });
    sections.push({
      heading: "Limitations to be aware of",
      body: (
        <ul>
          {c.limitations.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ),
    });
  }
  sections.push({
    heading: `${fromLabel} vs ${toLabel}`,
    body: (
      <>
        <p>
          <strong>{from.label}.</strong> {from.summary}
        </p>
        <p>
          <strong>{to.label}.</strong> {to.summary}
        </p>
        {extraInputs.length > 0 && (
          <p>
            This converter also accepts {extraInputs.join(", ")} files as input.
          </p>
        )}
      </>
    ),
  });

  return { steps, sections, faqs: c?.faqs ?? [] };
}

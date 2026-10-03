import { ToolError } from "@/lib/files/errors";
import { readTextFile } from "@/lib/files/text";
import { stripExtension } from "@/lib/format";
import { StructuredError, jsonToXml, jsonToYaml, parseJsonStrict, xmlToJson, yamlToData } from "@/lib/convert/structured";
import type { BrowserImplementation, ConversionInput } from "@/lib/processing/types";

function invalid(kind: string, err: unknown): ToolError {
  if (err instanceof StructuredError) {
    const where = err.line ? ` (line ${err.line}${err.column ? `, column ${err.column}` : ""})` : "";
    return new ToolError("invalid-format", `${err.message}${where}`, { title: `Invalid ${kind}` });
  }
  return new ToolError("invalid-format", (err as Error)?.message, { title: `Invalid ${kind}` });
}

async function text(input: ConversionInput): Promise<{ text: string; warnings: string[] }> {
  const d = await readTextFile(input.files[0]);
  return { text: d.text, warnings: d.warning ? [d.warning] : [] };
}

function out(input: ConversionInput, ext: string, mime: string, body: string, warnings: string[]) {
  return { files: [{ name: `${stripExtension(input.files[0].name)}.${ext}`, blob: new Blob([body], { type: mime }), preview: "text" as const }], warnings };
}

export const jsonToXmlImpl: BrowserImplementation = async (_def, input) => {
  const { text: src, warnings } = await text(input);
  let data: unknown;
  try {
    data = parseJsonStrict(src);
  } catch (err) {
    throw invalid("JSON", err);
  }
  const root = String(input.options.root || "root");
  return out(input, "xml", "application/xml", jsonToXml(data, root), warnings);
};

export const xmlToJsonImpl: BrowserImplementation = async (_def, input) => {
  const { text: src, warnings } = await text(input);
  let data: unknown;
  try {
    data = xmlToJson(src);
  } catch (err) {
    throw invalid("XML", err);
  }
  return out(input, "json", "application/json", JSON.stringify(data, null, 2) + "\n", warnings);
};

export const jsonToYamlImpl: BrowserImplementation = async (_def, input) => {
  const { text: src, warnings } = await text(input);
  let data: unknown;
  try {
    data = parseJsonStrict(src);
  } catch (err) {
    throw invalid("JSON", err);
  }
  return out(input, "yaml", "application/yaml", jsonToYaml(data), warnings);
};

export const yamlToJsonImpl: BrowserImplementation = async (_def, input) => {
  const { text: src, warnings } = await text(input);
  let data: unknown;
  try {
    data = yamlToData(src);
  } catch (err) {
    throw invalid("YAML", err);
  }
  return out(input, "json", "application/json", JSON.stringify(data, null, 2) + "\n", warnings);
};

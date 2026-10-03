/**
 * Pure JSON ⇄ XML ⇄ YAML helpers (unit-tested).
 */

import { XMLParser, XMLValidator } from "fast-xml-parser";
import { dump, loadAll } from "js-yaml";

export class StructuredError extends Error {
  constructor(
    message: string,
    readonly line?: number,
    readonly column?: number,
  ) {
    super(message);
  }
}

/** Turn any string into a valid XML element name. */
export function xmlName(key: string): string {
  let name = key.replace(/[^\p{L}\p{M}\p{N}_.:-]/gu, "_");
  if (!/^[\p{L}_]/u.test(name)) name = `_${name}`;
  if (/^xml/i.test(name)) name = `_${name}`;
  return name || "_";
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    // Strip characters that are illegal in XML 1.0.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

export function jsonToXml(data: unknown, rootName = "root", indent = "  "): string {
  const lines: string[] = ['<?xml version="1.0" encoding="UTF-8"?>'];

  function write(name: string, value: unknown, depth: number) {
    const pad = indent.repeat(depth);
    const tag = xmlName(name);
    if (value === null || value === undefined) {
      lines.push(`${pad}<${tag}/>`);
    } else if (Array.isArray(value)) {
      if (value.length === 0) lines.push(`${pad}<${tag}/>`);
      for (const item of value) write(name, item, depth);
    } else if (typeof value === "object") {
      const entries = Object.entries(value as Record<string, unknown>);
      if (!entries.length) {
        lines.push(`${pad}<${tag}/>`);
        return;
      }
      lines.push(`${pad}<${tag}>`);
      for (const [k, v] of entries) write(k, v, depth + 1);
      lines.push(`${pad}</${tag}>`);
    } else {
      lines.push(`${pad}<${tag}>${escapeXml(String(value))}</${tag}>`);
    }
  }

  if (Array.isArray(data)) {
    lines.push(`<${xmlName(rootName)}>`);
    for (const item of data) write("item", item, 1);
    lines.push(`</${xmlName(rootName)}>`);
  } else {
    write(rootName, data, 0);
  }
  return lines.join("\n") + "\n";
}

export function validateXml(text: string): void {
  const res = XMLValidator.validate(text, { allowBooleanAttributes: true });
  if (res !== true) throw new StructuredError(res.err.msg, res.err.line, res.err.col);
}

export function xmlToJson(text: string): unknown {
  validateXml(text);
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@",
    textNodeName: "#text",
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: true,
    ignoreDeclaration: true,
    ignorePiTags: true,
    commentPropName: false,
    processEntities: true,
    htmlEntities: false,
  });
  return parser.parse(text);
}

export function parseJsonStrict(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (err) {
    const loc = jsonErrorLocation(text, (err as Error).message);
    throw new StructuredError((err as Error).message, loc?.line, loc?.column);
  }
}

/** Derive a 1-based line/column from V8/SpiderMonkey/JSC JSON error messages. */
export function jsonErrorLocation(text: string, message: string): { line: number; column: number } | undefined {
  const lc = message.match(/line (\d+) column (\d+)/i);
  if (lc) return { line: Number(lc[1]), column: Number(lc[2]) };
  const pos = message.match(/position (\d+)/i);
  if (pos) {
    const p = Number(pos[1]);
    const before = text.slice(0, p);
    const line = before.split("\n").length;
    const column = p - before.lastIndexOf("\n");
    return { line, column };
  }
  if (/unexpected end/i.test(message)) {
    const lines = text.split("\n");
    return { line: lines.length, column: lines[lines.length - 1].length + 1 };
  }
  return undefined;
}

export function jsonToYaml(data: unknown): string {
  return dump(data, { indent: 2, lineWidth: -1, noRefs: true, quoteStyle: "double", sortKeys: false });
}

export function yamlToData(text: string): unknown {
  try {
    const docs = loadAll(text).filter((d) => d !== undefined);
    return docs.length <= 1 ? (docs[0] ?? null) : docs;
  } catch (err) {
    const e = err as { reason?: string; message: string; mark?: { line: number; column: number } };
    throw new StructuredError(e.reason ?? e.message, e.mark ? e.mark.line + 1 : undefined, e.mark ? e.mark.column + 1 : undefined);
  }
}

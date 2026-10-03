/**
 * JSON helpers for the developer tools: strict parsing with precise, human-readable errors.
 */

import { jsonErrorLocation } from "@/lib/convert/structured";

export interface JsonIssue {
  message: string;
  line?: number;
  column?: number;
  /** Plain-English explanation of the likely cause. */
  explanation?: string;
  /** The offending line, for display. */
  excerpt?: string;
}

export type ParseResult = { ok: true; value: unknown } | { ok: false; issue: JsonIssue };

function explain(text: string, line?: number, column?: number): string | undefined {
  const lines = text.split("\n");
  const src = line ? (lines[line - 1] ?? "") : "";
  const before = line ? lines.slice(0, line - 1).join("\n") + "\n" + src.slice(0, (column ?? 1) - 1) : text;
  const trimmedBefore = before.trimEnd();
  const at = line && column ? src.slice(column - 1) : "";

  if (!text.trim()) return "The input is empty.";
  if (/^\s*\/[/*]/m.test(text) && /\/\/|\/\*/.test(src)) return "JSON doesn't allow comments. Remove // or /* */ comments.";
  if (/,\s*$/.test(trimmedBefore) && /^\s*[}\]]/.test(at)) return "There's a trailing comma before a closing bracket. JSON doesn't allow a comma after the last item.";
  if (/^\s*'/.test(at) || /'[^']*'\s*:/.test(src)) return "JSON strings and keys must use double quotes (\"), not single quotes (').";
  if (/^\s*[A-Za-z_$][\w$]*\s*:/.test(at)) return "Object keys must be wrapped in double quotes, e.g. {\"name\": 1}.";
  if (/^\s*(undefined|NaN|Infinity|-Infinity)\b/.test(at)) return "undefined, NaN and Infinity aren't valid JSON values. Use null or a number.";
  if (/^\s*["{[\d-]/.test(at) && /["\]}\d]\s*$/.test(trimmedBefore.split("\n").pop() ?? "")) return "A comma seems to be missing between two values.";
  if (/unexpected end/i.test(text) || (line === lines.length && column && column > (lines[lines.length - 1]?.length ?? 0))) return "The JSON ends too early — a closing } or ] or a closing quote is probably missing.";
  return undefined;
}

export function parseJson(text: string): ParseResult {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (err) {
    const message = (err as Error).message.replace(/^JSON\.parse: /, "");
    const loc = jsonErrorLocation(text, message);
    const lines = text.split("\n");
    return {
      ok: false,
      issue: {
        message,
        line: loc?.line,
        column: loc?.column,
        explanation: explain(text, loc?.line, loc?.column) ?? (/unexpected end/i.test(message) ? "The JSON ends too early — a closing } or ] or a closing quote is probably missing." : undefined),
        excerpt: loc?.line ? lines[loc.line - 1] : undefined,
      },
    };
  }
}

export function sortKeysDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeysDeep);
  if (v && typeof v === "object") {
    return Object.fromEntries(Object.keys(v as object).sort((a, b) => a.localeCompare(b)).map((k) => [k, sortKeysDeep((v as Record<string, unknown>)[k])]));
  }
  return v;
}

export function stringify(value: unknown, indent: number | "tab", sortKeys = false): string {
  const v = sortKeys ? sortKeysDeep(value) : value;
  if (indent === 0) return JSON.stringify(v);
  return JSON.stringify(v, null, indent === "tab" ? "\t" : indent);
}

export function byteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

/** JSONPath-style accessor for a key path, e.g. $.users[0]["first name"] */
export function jsonPath(path: (string | number)[]): string {
  return (
    "$" +
    path
      .map((p) => (typeof p === "number" ? `[${p}]` : /^[A-Za-z_$][\w$]*$/.test(p) ? `.${p}` : `[${JSON.stringify(p)}]`))
      .join("")
  );
}

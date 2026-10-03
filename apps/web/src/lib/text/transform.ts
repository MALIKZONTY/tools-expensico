/** Case conversion and text clean-up operations. */

function wordsForCase(s: string): string[] {
  return s
    .replace(/([\p{Ll}\d])(\p{Lu})/gu, "$1 $2")
    .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, "$1 $2")
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter(Boolean);
}

const SMALL = new Set("a an and as at but by for in nor of on or per the to vs via".split(" "));

export type CaseKind = "upper" | "lower" | "title" | "sentence" | "camel" | "pascal" | "snake" | "kebab" | "constant" | "dot" | "alternating" | "inverse";

export function convertCase(text: string, kind: CaseKind): string {
  switch (kind) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return text.toLowerCase().replace(/[\p{L}\p{N}][\p{L}\p{M}\p{N}'’]*/gu, (w, offset: number) => {
        const isFirst = offset === 0 || /[.!?:\n]\s*$/.test(text.slice(0, offset));
        return !isFirst && SMALL.has(w) ? w : w[0].toUpperCase() + w.slice(1);
      });
    case "sentence":
      return text.toLowerCase().replace(/(^\s*|[.!?।]\s+|\n\s*)(\p{L})/gu, (_m, pre: string, ch: string) => pre + ch.toUpperCase());
    case "camel":
      return text
        .split("\n")
        .map((line) => wordsForCase(line).map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())).join(""))
        .join("\n");
    case "pascal":
      return text.split("\n").map((line) => wordsForCase(line).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join("")).join("\n");
    case "snake":
      return text.split("\n").map((line) => wordsForCase(line).map((w) => w.toLowerCase()).join("_")).join("\n");
    case "kebab":
      return text.split("\n").map((line) => wordsForCase(line).map((w) => w.toLowerCase()).join("-")).join("\n");
    case "constant":
      return text.split("\n").map((line) => wordsForCase(line).map((w) => w.toUpperCase()).join("_")).join("\n");
    case "dot":
      return text.split("\n").map((line) => wordsForCase(line).map((w) => w.toLowerCase()).join(".")).join("\n");
    case "alternating": {
      let i = 0;
      return [...text].map((c) => (/\p{L}/u.test(c) ? (i++ % 2 ? c.toUpperCase() : c.toLowerCase()) : c)).join("");
    }
    case "inverse":
      return [...text].map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join("");
  }
}

export type CleanOp =
  | "trim-lines"
  | "collapse-spaces"
  | "remove-blank-lines"
  | "remove-line-breaks"
  | "dedupe-lines"
  | "sort-asc"
  | "sort-desc"
  | "sort-natural"
  | "reverse-lines"
  | "shuffle-lines"
  | "remove-punctuation"
  | "strip-non-ascii"
  | "smart-to-straight-quotes"
  | "add-line-numbers"
  | "remove-line-numbers";

export function cleanText(text: string, op: CleanOp, random: () => number = Math.random): string {
  const lines = text.split(/\r?\n/);
  switch (op) {
    case "trim-lines":
      return lines.map((l) => l.trim()).join("\n");
    case "collapse-spaces":
      return lines.map((l) => l.replace(/[ \t ]+/g, " ")).join("\n");
    case "remove-blank-lines":
      return lines.filter((l) => l.trim()).join("\n");
    case "remove-line-breaks":
      // Keep paragraph breaks (blank lines); join wrapped lines with a space.
      return text.replace(/\r\n/g, "\n").split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, " ").trim()).join("\n\n");
    case "dedupe-lines": {
      const seen = new Set<string>();
      return lines.filter((l) => (seen.has(l) ? false : (seen.add(l), true))).join("\n");
    }
    case "sort-asc":
      return [...lines].sort((a, b) => a.localeCompare(b)).join("\n");
    case "sort-desc":
      return [...lines].sort((a, b) => b.localeCompare(a)).join("\n");
    case "sort-natural":
      return [...lines].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })).join("\n");
    case "reverse-lines":
      return [...lines].reverse().join("\n");
    case "shuffle-lines": {
      const a = [...lines];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a.join("\n");
    }
    case "remove-punctuation":
      return text.replace(/[\p{P}]/gu, "");
    case "strip-non-ascii":
      return text.replace(/[^\x09\x0a\x0d\x20-\x7e]/g, "");
    case "smart-to-straight-quotes":
      return text.replace(/[‘’‚‛]/g, "'").replace(/[“”„‟]/g, '"').replace(/[–—]/g, "-").replace(/…/g, "...");
    case "add-line-numbers": {
      const w = String(lines.length).length;
      return lines.map((l, i) => `${String(i + 1).padStart(w, " ")}. ${l}`).join("\n");
    }
    case "remove-line-numbers":
      return lines.map((l) => l.replace(/^\s*\d+[.):]\s?/, "")).join("\n");
  }
}

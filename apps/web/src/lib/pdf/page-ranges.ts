/**
 * Parse page selections like "1-3, 5, 8-" into a sorted list of 1-based page numbers.
 * Pure and unit-tested.
 */

export interface PageRangeResult {
  pages: number[];
  error?: string;
}

export function parsePageRanges(input: string, total: number, { keepOrder = false } = {}): PageRangeResult {
  const text = input.trim();
  if (!text) return { pages: Array.from({ length: total }, (_, i) => i + 1) };
  const out: number[] = [];
  for (const raw of text.split(/[,;]+/)) {
    const part = raw.trim().toLowerCase();
    if (!part) continue;
    let m: RegExpMatchArray | null;
    if ((m = part.match(/^(\d+)$/))) {
      const n = Number(m[1]);
      if (n < 1 || n > total) return { pages: [], error: `Page ${n} doesn't exist — this PDF has ${total} page${total === 1 ? "" : "s"}.` };
      out.push(n);
    } else if ((m = part.match(/^(\d*)\s*[-–]\s*(\d*|end|last)$/))) {
      const start = m[1] ? Number(m[1]) : 1;
      const end = !m[2] || m[2] === "end" || m[2] === "last" ? total : Number(m[2]);
      if (start < 1 || end > total || start > total) return { pages: [], error: `“${raw.trim()}” is outside the document (1–${total}).` };
      if (start > end) {
        for (let i = start; i >= end; i--) out.push(i);
      } else {
        for (let i = start; i <= end; i++) out.push(i);
      }
    } else {
      return { pages: [], error: `“${raw.trim()}” isn't a valid page or range. Use numbers like 1-3, 5.` };
    }
  }
  if (!out.length) return { pages: [], error: "No pages selected." };
  if (keepOrder) return { pages: out };
  return { pages: [...new Set(out)].sort((a, b) => a - b) };
}

/** Compress [1,2,3,5,7,8] → "1–3, 5, 7–8". */
export function formatPageList(pages: number[]): string {
  const sorted = [...new Set(pages)].sort((a, b) => a - b);
  const parts: string[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    parts.push(i === j ? `${sorted[i]}` : `${sorted[i]}–${sorted[j]}`);
    i = j + 1;
  }
  return parts.join(", ");
}

/**
 * Turns positioned PDF text items into lines and paragraphs.
 * Pure (no pdf.js import) so it can be unit-tested with synthetic items.
 */

export interface RawTextItem {
  str: string;
  /** PDF transform matrix [a, b, c, d, e, f]; e/f are x/y in user space. */
  transform: number[];
  width: number;
  height: number;
  hasEOL?: boolean;
}

export interface TextLine {
  text: string;
  x: number;
  y: number;
  fontSize: number;
}

export interface Block {
  kind: "heading" | "paragraph";
  /** Lines as they appear in the PDF. */
  lines: string[];
  /** Lines reflowed into one string (de-hyphenated). */
  text: string;
  fontSize: number;
}

function fontSizeOf(item: RawTextItem): number {
  const [, , c, d] = item.transform;
  // Font size is the length of the transform's vertical axis; works for rotated text too.
  return Math.hypot(c, d) || Math.abs(item.height) || 10;
}

export function itemsToLines(items: RawTextItem[]): TextLine[] {
  const usable = items.filter((it) => it.str.length > 0);
  if (!usable.length) return [];
  const sorted = [...usable].sort((p, q) => q.transform[5] - p.transform[5] || p.transform[4] - q.transform[4]);

  const lines: { items: RawTextItem[]; y: number; size: number }[] = [];
  for (const item of sorted) {
    const y = item.transform[5];
    const size = fontSizeOf(item);
    const line = lines.find((l) => Math.abs(l.y - y) <= Math.max(l.size, size) * 0.45);
    if (line) {
      line.items.push(item);
      line.size = Math.max(line.size, size);
    } else {
      lines.push({ items: [item], y, size });
    }
  }

  return lines
    .sort((p, q) => q.y - p.y)
    .map((line) => {
      const its = line.items.sort((p, q) => p.transform[4] - q.transform[4]);
      let text = "";
      let prevEnd: number | null = null;
      for (const it of its) {
        const x = it.transform[4];
        if (prevEnd !== null) {
          const gap = x - prevEnd;
          const needsSpace = gap > line.size * 0.18 && !text.endsWith(" ") && !it.str.startsWith(" ");
          if (needsSpace) text += gap > line.size * 2.5 ? "    " : " ";
        }
        text += it.str;
        prevEnd = x + it.width;
      }
      return { text: text.replace(/\s+$/, ""), x: its[0].transform[4], y: line.y, fontSize: line.size };
    })
    .filter((l) => l.text.trim().length > 0);
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function reflow(lines: string[]): string {
  let out = "";
  for (const raw of lines) {
    const line = raw.trim();
    if (!out) {
      out = line;
    } else if (/[a-zÀ-ɏ]-$/.test(out) && /^[a-zÀ-ɏ]/.test(line)) {
      out = out.slice(0, -1) + line; // join hyphenated word broken across lines
    } else {
      out += ` ${line}`;
    }
  }
  return out.replace(/ {2,}/g, " ");
}

/** Group lines into paragraphs and headings using vertical gaps and font size. */
export function linesToBlocks(lines: TextLine[], bodySize?: number): Block[] {
  if (!lines.length) return [];
  const body = bodySize ?? median(lines.map((l) => l.fontSize));
  const blocks: Block[] = [];
  let current: { lines: TextLine[] } | null = null;

  const flush = () => {
    if (!current) return;
    const size = Math.max(...current.lines.map((l) => l.fontSize));
    const texts = current.lines.map((l) => l.text);
    const joined = reflow(texts);
    const heading = size >= body * 1.2 && joined.length <= 140 && current.lines.length <= 3;
    blocks.push({ kind: heading ? "heading" : "paragraph", lines: texts, text: joined, fontSize: size });
    current = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prev = lines[i - 1];
    if (!current || !prev) {
      current = { lines: [line] };
      continue;
    }
    const gap = prev.y - line.y;
    const sizeChange = Math.abs(line.fontSize - prev.fontSize) > Math.max(1, body * 0.15);
    const bigGap = gap > Math.max(prev.fontSize, line.fontSize) * 1.75;
    const prevEndsSentence = /[.:!?]["')\]]?$/.test(prev.text.trim());
    const shortPrev = prev.text.trim().length < 40 && prevEndsSentence;
    if (bigGap || sizeChange || shortPrev) {
      flush();
      current = { lines: [line] };
    } else {
      current.lines.push(line);
    }
  }
  flush();
  return blocks;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

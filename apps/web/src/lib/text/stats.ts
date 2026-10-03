/** Unicode-aware text statistics (works for English and Indian scripts). */

const wordSeg = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter(undefined, { granularity: "word" }) : null;
const graphemeSeg = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
const sentenceSeg = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter(undefined, { granularity: "sentence" }) : null;

export function words(text: string): string[] {
  if (wordSeg) return [...wordSeg.segment(text)].filter((s) => s.isWordLike).map((s) => s.segment);
  return text.match(/[\p{L}\p{M}\p{N}'’-]+/gu) ?? [];
}

/** User-perceived characters: an emoji or a Devanagari conjunct counts once. */
export function graphemeCount(text: string): number {
  if (graphemeSeg) return [...graphemeSeg.segment(text)].length;
  return [...text].length;
}

export function sentences(text: string): string[] {
  const t = text.trim();
  if (!t) return [];
  const raw = sentenceSeg ? [...sentenceSeg.segment(t)].map((s) => s.segment) : t.split(/(?<=[.!?।])\s+/);
  return raw.map((s) => s.trim()).filter((s) => /[\p{L}\p{N}]/u.test(s));
}

export function paragraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

/** Rough English syllable count (vowel groups, silent-e adjustment). */
export function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const trimmed = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

/** Flesch Reading Ease (English). 60–70 is plain English; higher is easier. */
export function fleschReadingEase(text: string): number | null {
  const ws = words(text).filter((w) => /[a-z]/i.test(w));
  const ss = sentences(text);
  if (ws.length < 5 || ss.length === 0) return null;
  const syl = ws.reduce((n, w) => n + syllables(w), 0);
  return 206.835 - 1.015 * (ws.length / ss.length) - 84.6 * (syl / ws.length);
}

export function readingLabel(score: number): string {
  if (score >= 90) return "Very easy";
  if (score >= 80) return "Easy";
  if (score >= 70) return "Fairly easy";
  if (score >= 60) return "Plain English";
  if (score >= 50) return "Fairly difficult";
  if (score >= 30) return "Difficult";
  return "Very difficult";
}

const STOP = new Set("a an and are as at be but by for from has have he her his i in is it its me my of on or our she so that the their them they this to was we were what when which who will with you your not do does did can could would should there here than then also into about over just".split(" "));

export function topKeywords(text: string, limit = 10): { word: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const w of words(text)) {
    const k = w.toLowerCase();
    if (k.length < 3 || STOP.has(k) || /^\d+$/.test(k)) continue;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([word, count]) => ({ word, count }));
}

export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingMinutes: number;
  speakingMinutes: number;
}

export function textStats(text: string): TextStats {
  const w = words(text).length;
  return {
    words: w,
    characters: graphemeCount(text),
    charactersNoSpaces: graphemeCount(text.replace(/\s+/g, "")),
    sentences: sentences(text).length,
    paragraphs: paragraphs(text).length,
    lines: text ? text.split("\n").length : 0,
    readingMinutes: w / 238,
    speakingMinutes: w / 140,
  };
}

/** SMS segments: GSM-7 messages hold 160 chars (153 when split); Unicode ones 70 (67). */
export function smsSegments(text: string): { encoding: "GSM-7" | "Unicode"; segments: number; perSegment: number } {
  const GSM = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
  const EXT = "^{}\\[~]|€";
  let units = 0;
  let gsm = true;
  for (const ch of text) {
    if (GSM.includes(ch)) units += 1;
    else if (EXT.includes(ch)) units += 2;
    else {
      gsm = false;
      break;
    }
  }
  if (!gsm) {
    const len = [...text].reduce((n, ch) => n + (ch.codePointAt(0)! > 0xffff ? 2 : 1), 0);
    return { encoding: "Unicode", perSegment: len <= 70 ? 70 : 67, segments: len === 0 ? 0 : len <= 70 ? 1 : Math.ceil(len / 67) };
  }
  return { encoding: "GSM-7", perSegment: units <= 160 ? 160 : 153, segments: units === 0 ? 0 : units <= 160 ? 1 : Math.ceil(units / 153) };
}

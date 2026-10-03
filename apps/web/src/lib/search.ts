/**
 * Tiny, dependency-free search for the tool index.
 * Every query token must match somewhere; matches in the title weigh most.
 */

export interface SearchEntry {
  /** Canonical URL path. */
  href: string;
  title: string;
  description: string;
  /** Category label shown in results. */
  group: string;
  /** Category id used for the icon tint. */
  category: string;
  keywords: string[];
  popular?: boolean;
}

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[→>]/g, " to ")
    .replace(/[^a-z0-9%₹+#.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP = new Set(["a", "an", "the", "online", "free", "tool", "my", "for", "of", "file", "files"]);

export function tokenize(query: string): string[] {
  const tokens = normalize(query).split(" ").filter(Boolean);
  const meaningful = tokens.filter((t) => !STOP.has(t));
  return meaningful.length ? meaningful : tokens;
}

const SYNONYMS: Record<string, string[]> = {
  jpeg: ["jpg"],
  jpg: ["jpeg"],
  excel: ["xlsx", "xls", "spreadsheet"],
  xlsx: ["excel"],
  word: ["docx", "doc"],
  docx: ["word"],
  note: ["notes", "notepad"],
  notes: ["notepad", "note"],
  compress: ["compressor", "reduce", "shrink"],
  reduce: ["compress"],
  combine: ["merge"],
  merge: ["combine", "join"],
  picture: ["image", "photo"],
  photo: ["image"],
  image: ["photo", "picture"],
  emi: ["loan"],
  tax: ["salary", "gst"],
  beautify: ["format", "formatter"],
  format: ["formatter"],
  pretty: ["format", "formatter"],
  epoch: ["timestamp"],
  guid: ["uuid"],
};

function tokenScore(token: string, entry: SearchEntry, fields: { title: string; keywords: string; description: string; group: string }): number {
  const variants = [token, ...(SYNONYMS[token] ?? [])];
  let best = 0;
  for (const v of variants) {
    const penalty = v === token ? 1 : 0.8;
    const titleWords = fields.title.split(" ");
    if (titleWords.includes(v)) best = Math.max(best, 10 * penalty);
    else if (titleWords.some((w) => w.startsWith(v))) best = Math.max(best, 8 * penalty);
    else if (fields.title.includes(v)) best = Math.max(best, 6 * penalty);
    if (fields.keywords.includes(v)) best = Math.max(best, (v.length > 2 ? 5 : 3) * penalty);
    if (fields.group.includes(v)) best = Math.max(best, 3 * penalty);
    if (v.length > 2 && fields.description.includes(v)) best = Math.max(best, 1.5 * penalty);
  }
  return best;
}

export function searchEntries(entries: SearchEntry[], query: string, limit = 20): SearchEntry[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  const normalizedQuery = normalize(query);
  const scored: { entry: SearchEntry; score: number }[] = [];
  for (const entry of entries) {
    const fields = {
      title: normalize(entry.title),
      keywords: normalize(entry.keywords.join(" | ")),
      description: normalize(entry.description),
      group: normalize(entry.group),
    };
    let total = 0;
    let matchedAll = true;
    for (const t of tokens) {
      const s = tokenScore(t, entry, fields);
      if (s === 0) {
        matchedAll = false;
        break;
      }
      total += s;
    }
    if (!matchedAll) continue;
    // Phrase bonuses: whole query appears in the title or a keyword (e.g. "pdf to jpg").
    if (fields.title.includes(normalizedQuery)) total += 12;
    if (fields.title.startsWith(normalizedQuery)) total += 4;
    if (fields.keywords.split(" | ").some((k) => k === normalizedQuery)) total += 10;
    if (entry.popular) total += 1;
    scored.push({ entry, score: total });
  }
  scored.sort((a, b) => b.score - a.score || a.entry.title.length - b.entry.title.length);
  return scored.slice(0, limit).map((s) => s.entry);
}

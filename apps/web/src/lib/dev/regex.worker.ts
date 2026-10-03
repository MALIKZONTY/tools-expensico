/// <reference lib="webworker" />
// Runs user regular expressions off the main thread so a catastrophic pattern can be
// terminated without freezing the page.

interface Req {
  id: number;
  pattern: string;
  flags: string;
  text: string;
  replacement: string | null;
}

const MAX_MATCHES = 5000;

self.onmessage = (e: MessageEvent<Req>) => {
  const { id, pattern, flags, text, replacement } = e.data;
  try {
    const re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
    const matches: { index: number; text: string; groups: (string | undefined)[]; named: Record<string, string | undefined> | null }[] = [];
    let m: RegExpExecArray | null;
    let truncated = false;
    while ((m = re.exec(text)) !== null) {
      matches.push({ index: m.index, text: m[0], groups: m.slice(1), named: m.groups ? { ...m.groups } : null });
      if (m[0] === "") re.lastIndex++;
      if (!flags.includes("g")) break;
      if (matches.length >= MAX_MATCHES) {
        truncated = true;
        break;
      }
    }
    let replaced: string | null = null;
    if (replacement !== null) replaced = text.replace(new RegExp(pattern, flags), replacement);
    (self as unknown as Worker).postMessage({ id, ok: true, matches, truncated, replaced });
  } catch (err) {
    (self as unknown as Worker).postMessage({ id, ok: false, error: (err as Error).message });
  }
};

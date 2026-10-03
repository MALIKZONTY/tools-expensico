import { parseCsvText, type ParsedCsv } from "./table";

/** Parse CSV off the main thread for large inputs; inline for small ones. */
export function parseCsvAsync(text: string, delimiter?: string): Promise<ParsedCsv> {
  if (text.length < 2_000_000 || typeof Worker === "undefined") return Promise.resolve(parseCsvText(text, delimiter));
  return new Promise((resolve, reject) => {
    const w = new Worker(new URL("./csv.worker.ts", import.meta.url), { type: "module" });
    w.onmessage = (e: MessageEvent<({ ok: true } & ParsedCsv) | { ok: false; error: string }>) => {
      w.terminate();
      if (e.data.ok) resolve({ rows: e.data.rows, delimiter: e.data.delimiter, problems: e.data.problems });
      else reject(new Error(e.data.error));
    };
    w.onerror = () => {
      w.terminate();
      resolve(parseCsvText(text, delimiter));
    };
    w.postMessage({ text, delimiter });
  });
}

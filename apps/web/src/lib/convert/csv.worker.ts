/// <reference lib="webworker" />
import { parseCsvText } from "./table";

self.onmessage = (e: MessageEvent<{ text: string; delimiter?: string }>) => {
  try {
    const r = parseCsvText(e.data.text, e.data.delimiter);
    (self as unknown as Worker).postMessage({ ok: true, ...r });
  } catch (err) {
    (self as unknown as Worker).postMessage({ ok: false, error: (err as Error).message });
  }
};

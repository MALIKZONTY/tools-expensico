/**
 * Privacy-conscious analytics facade.
 *
 * - No-op unless a cookieless provider is configured (Plausible or Umami).
 * - Never send file names, file contents, note text, form input or anything personal.
 *   Only tool identifiers, coarse categories and outcome labels.
 */

export type AnalyticsEvent =
  | "tool_opened"
  | "conversion_started"
  | "conversion_completed"
  | "tool_error"
  | "search"
  | "search_selected";

export type AnalyticsProps = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
    umami?: { track: (event: string, data?: Record<string, string | number | boolean>) => void };
  }
}

function clean(props?: AnalyticsProps): Record<string, string | number | boolean> | undefined {
  if (!props) return undefined;
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined) continue;
    out[k] = typeof v === "string" ? v.slice(0, 80) : v;
  }
  return out;
}

export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  if (typeof window === "undefined") return;
  const data = clean(props);
  try {
    if (window.plausible) window.plausible(event, data ? { props: data } : undefined);
    else if (window.umami) window.umami.track(event, data);
  } catch {
    // Analytics must never break a tool.
  }
}

/** Coarse size bucket so we learn about typical workloads without precise fingerprints. */
export function sizeBucket(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return "<1MB";
  if (mb < 10) return "1-10MB";
  if (mb < 50) return "10-50MB";
  if (mb < 200) return "50-200MB";
  return "200MB+";
}

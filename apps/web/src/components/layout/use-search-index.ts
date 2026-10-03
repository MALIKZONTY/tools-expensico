"use client";

import { useEffect, useState } from "react";
import type { SearchEntry } from "@/lib/search";

let cache: Promise<SearchEntry[]> | null = null;

function load(): Promise<SearchEntry[]> {
  if (!cache) {
    cache = fetch("/search-index.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<SearchEntry[]>;
      })
      .catch((err) => {
        cache = null; // allow retry
        throw err;
      });
  }
  return cache;
}

/** Fetches the search index once per session, only when `enabled` becomes true. */
export function useSearchIndex(enabled: boolean) {
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enabled || entries) return;
    let alive = true;
    load()
      .then((data) => alive && setEntries(data))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [enabled, entries]);

  return { entries, error };
}

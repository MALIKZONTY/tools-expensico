"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parse<T>(raw: string | null, initial: T): T {
  if (raw === null) return initial;
  try {
    const parsed = JSON.parse(raw) as T;
    // Merge objects so fields added in later versions keep their defaults.
    return typeof initial === "object" && initial !== null && !Array.isArray(initial) && typeof parsed === "object" && parsed !== null ? { ...initial, ...parsed } : parsed;
  } catch {
    return initial;
  }
}

/**
 * useState that remembers its value in localStorage (per browser) and stays in sync across
 * tabs. The server render uses `initial`, so there are no hydration mismatches. If storage
 * is unavailable (private mode, quota), the value still works for the current page view.
 */
export function useStoredState<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void, boolean] {
  const fullKey = `ex:${key}`;
  const [defaults] = useState(initial);
  const [memoryOnly, setMemoryOnly] = useState<T | null>(null);
  const raw = useSyncExternalStore(subscribe, () => read(fullKey), () => null);
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const value = useMemo(() => memoryOnly ?? parse(raw, defaults), [memoryOnly, raw, defaults]);

  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      const prev = memoryOnly ?? parse(read(fullKey), defaults);
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      try {
        localStorage.setItem(fullKey, JSON.stringify(next));
        setMemoryOnly(null);
      } catch {
        setMemoryOnly(next);
      }
      listeners.forEach((l) => l());
    },
    [fullKey, defaults, memoryOnly],
  );

  return [value, set, hydrated];
}

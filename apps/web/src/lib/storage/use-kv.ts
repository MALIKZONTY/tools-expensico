"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDb } from "./db";

export type KvStatus = "loading" | "ready" | "unavailable";

/**
 * Persistent state in IndexedDB with debounced writes. If storage is unavailable the
 * state still works for the session and `status` is "unavailable" so the UI can say so.
 */
export function useKv<T>(key: string, initial: T, debounceMs = 400): [T, (v: T | ((p: T) => T)) => void, KvStatus, number | null] {
  const [value, setValue] = useState<T>(initial);
  const [status, setStatus] = useState<KvStatus>("loading");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const timer = useRef<number | null>(null);
  const latest = useRef(value);
  const loaded = useRef(false);

  useEffect(() => {
    let alive = true;
    getDb()
      .kv.get(key)
      .then((rec) => {
        if (!alive) return;
        if (rec) {
          setValue(rec.value as T);
          latest.current = rec.value as T;
          setSavedAt(rec.updatedAt);
        }
        loaded.current = true;
        setStatus("ready");
      })
      .catch(() => {
        if (!alive) return;
        loaded.current = true;
        setStatus("unavailable");
      });
    return () => {
      alive = false;
    };
  }, [key]);

  const flush = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    if (!loaded.current) return;
    const now = Date.now();
    getDb()
      .kv.put({ key, value: latest.current, updatedAt: now })
      .then(() => setSavedAt(now))
      .catch(() => setStatus("unavailable"));
  }, [key]);

  const set = useCallback(
    (v: T | ((p: T) => T)) => {
      setValue((prev) => {
        const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        latest.current = next;
        return next;
      });
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(flush, debounceMs);
    },
    [flush, debounceMs],
  );

  // Save pending changes when the tab is hidden or closed.
  useEffect(() => {
    const onHide = () => {
      if (timer.current) flush();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      if (timer.current) flush();
    };
  }, [flush]);

  return [value, set, status, savedAt];
}

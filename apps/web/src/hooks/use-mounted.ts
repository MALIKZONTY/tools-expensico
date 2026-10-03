"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** True after hydration — use for values that depend on the clock, locale or time zone. */
export function useMounted(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}

/**
 * A browser-only value read once on the client (server render uses `serverValue`), without
 * hydration mismatches or setState-in-effect.
 */
export function useClientValue<T>(read: () => T, serverValue: T): T {
  return useSyncExternalStore(noop, read, () => serverValue);
}

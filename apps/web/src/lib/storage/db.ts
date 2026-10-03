/**
 * The single IndexedDB database used by Expensico (via Dexie).
 * Everything here lives only in the user's browser.
 */

import Dexie, { type EntityTable } from "dexie";
import type { Note } from "@/lib/notes/types";

export interface KvRecord {
  key: string;
  value: unknown;
  updatedAt: number;
}

export class ExpensicoDB extends Dexie {
  notes!: EntityTable<Note, "id">;
  kv!: EntityTable<KvRecord, "key">;

  constructor() {
    super("expensico");
    // Version 1 schema. Add new versions (never edit this one) when the schema changes.
    this.version(1).stores({
      notes: "id, updatedAt, pinned, deletedAt",
      kv: "key",
    });
  }
}

let db: ExpensicoDB | null = null;

export function getDb(): ExpensicoDB {
  if (typeof window === "undefined") throw new Error("IndexedDB is only available in the browser");
  db ??= new ExpensicoDB();
  return db;
}

/** Resolves false when IndexedDB is unavailable (some private modes, blocked storage). */
export async function storageAvailable(): Promise<boolean> {
  try {
    await getDb().open();
    return true;
  } catch {
    return false;
  }
}

/** Ask the browser not to evict our data under storage pressure. Best effort. */
export async function requestPersistence(): Promise<boolean> {
  try {
    if (navigator.storage?.persisted && (await navigator.storage.persisted())) return true;
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}

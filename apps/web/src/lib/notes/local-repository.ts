import { getDb } from "@/lib/storage/db";
import type { Note, NotesRepository } from "./types";

const CHANNEL = "expensico-notes";

function newId(): string {
  return typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/** Notes stored in this browser's IndexedDB. Cross-tab updates via BroadcastChannel. */
export class LocalNotesRepository implements NotesRepository {
  readonly kind = "local" as const;
  private channel: BroadcastChannel | null = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL) : null;
  private listeners = new Set<() => void>();

  constructor() {
    this.channel?.addEventListener("message", () => this.listeners.forEach((l) => l()));
  }

  private changed() {
    this.listeners.forEach((l) => l());
    this.channel?.postMessage("changed");
  }

  async list(): Promise<Note[]> {
    return getDb().notes.toArray();
  }

  async get(id: string) {
    return getDb().notes.get(id);
  }

  async create(input: Partial<Pick<Note, "title" | "content">> = {}): Promise<Note> {
    const now = Date.now();
    const note: Note = { id: newId(), title: input.title ?? "", content: input.content ?? "", pinned: false, createdAt: now, updatedAt: now, deletedAt: null, rev: 1 };
    await getDb().notes.add(note);
    this.changed();
    return note;
  }

  async update(id: string, patch: Partial<Pick<Note, "title" | "content" | "pinned">>) {
    const db = getDb();
    const updated = await db.transaction("rw", db.notes, async () => {
      const cur = await db.notes.get(id);
      if (!cur) return undefined;
      const next: Note = { ...cur, ...patch, updatedAt: Date.now(), rev: cur.rev + 1 };
      await db.notes.put(next);
      return next;
    });
    this.changed();
    return updated;
  }

  async trash(id: string) {
    await getDb().notes.update(id, { deletedAt: Date.now(), pinned: false });
    this.changed();
  }

  async restore(id: string) {
    await getDb().notes.update(id, { deletedAt: null, updatedAt: Date.now() });
    this.changed();
  }

  async purge(id: string) {
    await getDb().notes.delete(id);
    this.changed();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async exportAll() {
    return (await this.list()).filter((n) => !n.deletedAt);
  }

  async importMany(notes: Note[]) {
    const db = getDb();
    const now = Date.now();
    const clean = notes
      .filter((n) => n && typeof n.content === "string")
      .map((n) => ({
        id: newId(),
        title: String(n.title ?? "").slice(0, 500),
        content: n.content,
        pinned: Boolean(n.pinned),
        createdAt: Number(n.createdAt) || now,
        updatedAt: Number(n.updatedAt) || now,
        deletedAt: null,
        rev: 1,
      }));
    await db.notes.bulkAdd(clean);
    this.changed();
    return clean.length;
  }
}

let repo: NotesRepository | null = null;
export function notesRepository(): NotesRepository {
  repo ??= new LocalNotesRepository();
  return repo;
}

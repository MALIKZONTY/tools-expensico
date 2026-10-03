export interface Note {
  id: string;
  title: string;
  /** Plain text / Markdown body. */
  content: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
  /** Soft delete so a future sync engine can propagate deletions; also powers Trash. */
  deletedAt: number | null;
  /** Incremented on every change — used for conflict detection when sync is added. */
  rev: number;
}

export type NoteSort = "updated" | "created" | "title";

/**
 * Storage abstraction for notes. The UI only talks to this interface, so a cloud-backed
 * implementation (or a syncing wrapper around the local one) can be added later.
 */
export interface NotesRepository {
  readonly kind: "local" | "remote";
  list(): Promise<Note[]>;
  get(id: string): Promise<Note | undefined>;
  create(input?: Partial<Pick<Note, "title" | "content">>): Promise<Note>;
  update(id: string, patch: Partial<Pick<Note, "title" | "content" | "pinned">>): Promise<Note | undefined>;
  /** Move to trash. */
  trash(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  /** Permanently delete. */
  purge(id: string): Promise<void>;
  /** Subscribe to changes made in this or other tabs. Returns an unsubscribe function. */
  subscribe(listener: () => void): () => void;
  exportAll(): Promise<Note[]>;
  importMany(notes: Note[]): Promise<number>;
}

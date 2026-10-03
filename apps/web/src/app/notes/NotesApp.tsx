"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArchiveRestore, ArrowLeft, Download, Eye, FileDown, FileUp, HardDrive, MoreHorizontal, Pencil, Pin, PinOff, Plus, Search, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/use-confirm";
import { notesRepository } from "@/lib/notes/local-repository";
import type { Note, NoteSort } from "@/lib/notes/types";
import { notePreview, noteTitle, relativeTime, searchNotes, sortNotes } from "@/lib/notes/utils";
import { requestPersistence, storageAvailable } from "@/lib/storage/db";
import { downloadText } from "@/lib/files/download";
import { markdownToSafeHtml } from "@/lib/html/sanitize";
import { words } from "@/lib/text/stats";
import { cn } from "@/lib/cn";

type View = "notes" | "trash";

function NoteEditor({ note, onBack, onChange }: { note: Note; onBack: () => void; onChange: (patch: Partial<Pick<Note, "title" | "content">>) => void }) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [preview, setPreview] = useState(false);
  const [html, setHtml] = useState("");
  const [saved, setSaved] = useState(true);
  const timer = useRef<number | null>(null);
  const pending = useRef<Partial<Pick<Note, "title" | "content">>>({});

  const flush = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    if (Object.keys(pending.current).length) {
      onChange(pending.current);
      pending.current = {};
      setSaved(true);
    }
  }, [onChange]);

  const queue = (patch: Partial<Pick<Note, "title" | "content">>) => {
    pending.current = { ...pending.current, ...patch };
    setSaved(false);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(flush, 500);
  };

  // Save on unmount / when switching notes / hiding the tab.
  useEffect(() => {
    const onHide = () => flush();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      flush();
    };
  }, [flush]);

  useEffect(() => {
    if (!preview) return;
    let alive = true;
    markdownToSafeHtml(content).then((h) => alive && setHtml(h));
    return () => {
      alive = false;
    };
  }, [preview, content]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 sm:px-4">
        <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={() => { flush(); onBack(); }} aria-label="Back to notes">
          <ArrowLeft aria-hidden />
        </Button>
        <span className="text-xs text-muted" role="status">{saved ? `Saved · edited ${relativeTime(note.updatedAt)}` : "Saving…"}</span>
        <div className="ml-auto flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setPreview((p) => !p)} aria-pressed={preview}>
            {preview ? <Pencil aria-hidden /> : <Eye aria-hidden />}
            {preview ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>
      <input
        aria-label="Note title"
        value={title}
        placeholder="Title"
        maxLength={200}
        onChange={(e) => {
          setTitle(e.target.value);
          queue({ title: e.target.value });
        }}
        className="border-0 bg-transparent px-4 pb-1 pt-4 text-xl font-semibold text-fg outline-none placeholder:text-subtle sm:px-6"
      />
      {preview ? (
        <div className="prose-ex min-h-0 max-w-none flex-1 overflow-y-auto px-4 pb-6 sm:px-6" dangerouslySetInnerHTML={{ __html: html || "<p><em>Nothing to preview yet.</em></p>" }} />
      ) : (
        <textarea
          aria-label="Note content"
          value={content}
          placeholder="Start writing… Markdown is supported."
          onChange={(e) => {
            setContent(e.target.value);
            queue({ content: e.target.value });
          }}
          className="min-h-[50vh] flex-1 resize-none border-0 bg-transparent px-4 pb-6 text-[15px] leading-relaxed text-fg outline-none placeholder:text-subtle sm:px-6 md:min-h-0"
        />
      )}
      <div className="border-t border-border px-4 py-1.5 text-xs text-muted sm:px-6">{words(content).length.toLocaleString("en-IN")} words</div>
    </div>
  );
}

export function NotesApp() {
  const repo = useMemo(() => notesRepository(), []);
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [available, setAvailable] = useState(true);
  // NotesApp is client-only (ssr: false), so the URL can be read during the first render.
  const [selectedId, setSelectedId] = useState<string | null>(() => new URLSearchParams(window.location.search).get("note"));
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<NoteSort>("updated");
  const [view, setView] = useState<View>("notes");
  const [mobileEditor, setMobileEditor] = useState(() => new URLSearchParams(window.location.search).has("note"));
  const [menuOpen, setMenuOpen] = useState(false);
  const { toast } = useToast();
  const [confirm, confirmDialog] = useConfirm();
  const importRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const reload = useCallback(async () => {
    try {
      setNotes(await repo.list());
    } catch {
      setAvailable(false);
      setNotes([]);
    }
  }, [repo]);

  useEffect(() => {
    storageAvailable().then((ok) => {
      setAvailable(ok);
      if (ok) void reload();
      else setNotes([]);
    });
    const unsub = repo.subscribe(() => void reload());
    return () => {
      unsub();
    };
  }, [repo, reload]);

  const live = useMemo(() => (notes ?? []).filter((n) => (view === "trash" ? n.deletedAt : !n.deletedAt)), [notes, view]);
  const visible = useMemo(() => sortNotes(searchNotes(live, query), sort), [live, query, sort]);
  const selected = notes?.find((n) => n.id === selectedId && !n.deletedAt) ?? null;
  const trashCount = (notes ?? []).filter((n) => n.deletedAt).length;

  function select(id: string | null) {
    setSelectedId(id);
    setMobileEditor(Boolean(id));
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("note", id);
    else url.searchParams.delete("note");
    window.history.replaceState(null, "", url);
  }

  async function create() {
    try {
      const n = await repo.create();
      setView("notes");
      setQuery("");
      await reload();
      select(n.id);
      void requestPersistence();
    } catch {
      toast("Couldn't create a note — this browser is blocking storage.", "error");
    }
  }

  const onChange = useCallback(
    (id: string) => (patch: Partial<Pick<Note, "title" | "content">>) => {
      repo.update(id, patch).catch(() => toast("Couldn't save your note. Storage may be full or blocked.", "error"));
    },
    [repo, toast],
  );

  async function exportAll() {
    const all = await repo.exportAll();
    downloadText(JSON.stringify({ app: "expensico-notes", version: 1, exportedAt: new Date().toISOString(), notes: all }, null, 2), `expensico-notes-${new Date().toISOString().slice(0, 10)}.json`, "application/json");
    setMenuOpen(false);
  }

  async function importFile(f: File) {
    try {
      const data = JSON.parse(await f.text());
      const list: Note[] = Array.isArray(data) ? data : data?.notes;
      if (!Array.isArray(list)) throw new Error();
      const n = await repo.importMany(list);
      toast(`Imported ${n} note${n === 1 ? "" : "s"}`);
    } catch {
      toast("That file isn't an Expensico notes backup.", "error");
    }
  }

  if (notes === null) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-border bg-surface">
        <Spinner label="Loading notes" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {!available ? (
        <Alert tone="warning" title="Notes can't be saved in this browser">
          This browser is blocking storage (common in private browsing or with strict privacy settings), so notes can&apos;t be created here. Open Expensico in a normal window, or use a browser that allows site storage.
        </Alert>
      ) : (
        <p className="flex items-center gap-2 text-sm text-muted">
          <HardDrive aria-hidden className="size-4 shrink-0" />
          Your notes are stored locally in this browser on this device. They aren&apos;t uploaded or synced — export a backup to move them.
        </p>
      )}

      <div className="grid grid-cols-1 h-[min(80vh,52rem)] min-h-[32rem] overflow-hidden rounded-xl border border-border bg-surface shadow-sm md:grid-cols-[20rem_minmax(0,1fr)]">
        {/* List */}
        <aside className={cn("flex min-h-0 flex-col border-border md:border-r", mobileEditor && "hidden md:flex")} aria-label="Notes list">
          <div className="flex flex-col gap-2 border-b border-border p-3">
            <div className="flex gap-2">
              <Button onClick={create} className="flex-1">
                <Plus aria-hidden /> New note
              </Button>
              <div className="relative" ref={menuRef}>
                <Button variant="secondary" size="icon" aria-label="More options" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
                  <MoreHorizontal aria-hidden />
                </Button>
                {menuOpen && (
                  <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-border bg-surface p-1 shadow-lg" role="menu">
                    <button role="menuitem" type="button" onClick={exportAll} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-surface-2"><FileDown aria-hidden className="size-4" /> Export backup (.json)</button>
                    <button role="menuitem" type="button" onClick={() => { setMenuOpen(false); importRef.current?.click(); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-surface-2"><FileUp aria-hidden className="size-4" /> Import backup</button>
                    <button role="menuitem" type="button" onClick={() => { setMenuOpen(false); setView(view === "trash" ? "notes" : "trash"); select(null); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-surface-2"><Trash2 aria-hidden className="size-4" /> {view === "trash" ? "Back to notes" : `Trash (${trashCount})`}</button>
                  </div>
                )}
                <input ref={importRef} type="file" accept=".json,application/json" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void importFile(f); }} />
              </div>
            </div>
            <div className="relative">
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
              <Input aria-label="Search notes" placeholder="Search notes" value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 pl-9" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-subtle">{view === "trash" ? "Trash" : `${live.length} note${live.length === 1 ? "" : "s"}`}</span>
              <Select aria-label="Sort notes" value={sort} onChange={(e) => setSort(e.target.value as NoteSort)} className="h-8 w-36 text-sm">
                <option value="updated">Last edited</option><option value="created">Date created</option><option value="title">Title</option>
              </Select>
            </div>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto p-1.5">
            {visible.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => view === "notes" && select(n.id)}
                  aria-current={n.id === selectedId}
                  className={cn("flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left", n.id === selectedId ? "bg-brand-soft" : "hover:bg-surface-2", view === "trash" && "cursor-default")}
                >
                  <span className="flex items-center gap-1.5">
                    {n.pinned && <Pin aria-label="Pinned" className="size-3.5 shrink-0 text-brand" />}
                    <span className={cn("truncate font-medium", n.id === selectedId ? "text-brand-soft-fg" : "text-fg")}>{noteTitle(n)}</span>
                  </span>
                  <span className="line-clamp-1 text-sm text-muted">{notePreview(n) || "No additional text"}</span>
                  <span className="text-xs text-subtle">{relativeTime(view === "trash" && n.deletedAt ? n.deletedAt : n.updatedAt)}</span>
                </button>
                {view === "trash" && (
                  <div className="flex gap-1 px-2 pb-2">
                    <Button size="sm" variant="secondary" onClick={() => repo.restore(n.id)}><ArchiveRestore aria-hidden /> Restore</Button>
                    <Button size="sm" variant="ghost" className="text-danger" onClick={async () => { if (await confirm({ title: "Delete forever?", description: `“${noteTitle(n)}” will be permanently deleted.`, confirmLabel: "Delete forever", danger: true })) await repo.purge(n.id); }}>Delete forever</Button>
                  </div>
                )}
              </li>
            ))}
            {visible.length === 0 && (
              <li>
                <EmptyState
                  title={query ? "No matching notes" : view === "trash" ? "Trash is empty" : "No notes yet"}
                  description={query ? "Try different words." : view === "trash" ? "Deleted notes appear here until you remove them permanently." : "Create your first note — it saves automatically."}
                />
              </li>
            )}
          </ul>
        </aside>

        {/* Editor */}
        <section className={cn("flex min-h-0 flex-col", !mobileEditor && "hidden md:flex")} aria-label="Note editor">
          {selected ? (
            <>
              <div className="flex flex-wrap items-center justify-end gap-1 border-b border-border px-3 py-1.5">
                <Button variant="ghost" size="sm" onClick={() => repo.update(selected.id, { pinned: !selected.pinned })}>
                  {selected.pinned ? <PinOff aria-hidden /> : <Pin aria-hidden />} {selected.pinned ? "Unpin" : "Pin"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => downloadText(`${selected.title ? `# ${selected.title}\n\n` : ""}${selected.content}`, `${noteTitle(selected).replace(/[\\/:*?"<>|]/g, "_").slice(0, 60) || "note"}.md`, "text/markdown;charset=utf-8")}>
                  <Download aria-hidden /> Export
                </Button>
                <Button variant="ghost" size="sm" className="text-danger" onClick={async () => { await repo.trash(selected.id); select(null); toast("Moved to trash"); }}>
                  <Trash2 aria-hidden /> Delete
                </Button>
              </div>
              <NoteEditor key={selected.id} note={selected} onBack={() => select(null)} onChange={onChange(selected.id)} />
            </>
          ) : (
            <EmptyState className="m-auto" icon={<Pencil />} title="Select a note or create a new one" action={<Button onClick={create}><Plus aria-hidden /> New note</Button>} />
          )}
        </section>
      </div>
      {confirmDialog}
    </div>
  );
}

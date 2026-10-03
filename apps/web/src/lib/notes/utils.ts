import type { Note, NoteSort } from "./types";

export function noteTitle(n: Pick<Note, "title" | "content">): string {
  if (n.title.trim()) return n.title.trim();
  const first = n.content.split("\n").find((l) => l.trim());
  return first ? first.replace(/^#+\s*/, "").trim().slice(0, 80) : "Untitled note";
}

export function notePreview(n: Pick<Note, "title" | "content">): string {
  const lines = n.content.split("\n").map((l) => l.trim()).filter(Boolean);
  const body = n.title.trim() ? lines : lines.slice(1);
  return body.join(" ").replace(/[#*_`>]/g, "").slice(0, 140);
}

export function sortNotes(notes: Note[], sort: NoteSort): Note[] {
  const by = (a: Note, b: Note) => (sort === "title" ? noteTitle(a).localeCompare(noteTitle(b)) : sort === "created" ? b.createdAt - a.createdAt : b.updatedAt - a.updatedAt);
  return [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || by(a, b));
}

export function searchNotes(notes: Note[], q: string): Note[] {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return notes;
  return notes.filter((n) => {
    const hay = `${n.title}\n${n.content}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

export function relativeTime(ts: number, now = Date.now()): string {
  const diff = Math.round((ts - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const abs = Math.abs(diff);
  if (abs < 45) return "just now";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 7 * 86400) return rtf.format(Math.round(diff / 86400), "day");
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: new Date(ts).getFullYear() === new Date(now).getFullYear() ? undefined : "numeric" });
}

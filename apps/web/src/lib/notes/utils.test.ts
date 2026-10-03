import { describe, expect, it } from "vitest";
import { noteTitle, notePreview, searchNotes, sortNotes } from "./utils";
import type { Note } from "./types";

const n = (p: Partial<Note>): Note => ({ id: Math.random().toString(), title: "", content: "", pinned: false, createdAt: 0, updatedAt: 0, deletedAt: null, rev: 1, ...p });

describe("note utils", () => {
  it("derives a title from content when untitled", () => {
    expect(noteTitle(n({ content: "\n# Groceries\nmilk" }))).toBe("Groceries");
    expect(noteTitle(n({}))).toBe("Untitled note");
    expect(notePreview(n({ content: "Groceries\nmilk\neggs" }))).toBe("milk eggs");
  });
  it("sorts pinned first", () => {
    const list = sortNotes([n({ id: "a", updatedAt: 3 }), n({ id: "b", updatedAt: 1, pinned: true }), n({ id: "c", updatedAt: 2 })], "updated");
    expect(list.map((x) => x.id)).toEqual(["b", "a", "c"]);
  });
  it("searches all terms across title and body", () => {
    const list = [n({ id: "a", title: "Trip", content: "Goa beach" }), n({ id: "b", content: "Goa office" })];
    expect(searchNotes(list, "goa beach").map((x) => x.id)).toEqual(["a"]);
  });
});

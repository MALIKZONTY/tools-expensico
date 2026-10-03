import { describe, expect, it } from "vitest";
import { searchEntries, type SearchEntry } from "./search";
import { buildSearchIndex } from "@/registry/search-index";

const index: SearchEntry[] = buildSearchIndex();
const top = (q: string) => searchEntries(index, q, 5).map((e) => e.href);

describe("tool search", () => {
  it("finds exact tools first", () => {
    expect(top("pdf to jpg")[0]).toBe("/convert/pdf-to-jpg");
    expect(top("EMI")[0]).toBe("/finance/emi-calculator");
    expect(top("json formatter")[0]).toBe("/developer/json-formatter");
    expect(top("image compressor")[0]).toBe("/tools/image-compressor");
    expect(top("csv")).toContain("/tools/csv-viewer");
  });
  it("understands synonyms and arrows", () => {
    expect(top("jpeg to png")[0]).toBe("/convert/jpg-to-png");
    expect(top("pdf → jpg")[0]).toBe("/convert/pdf-to-jpg");
    expect(top("combine pdf")[0]).toBe("/pdf/pdf-merge");
    expect(top("notes")).toContain("/notes");
  });
  it("returns nothing for nonsense", () => {
    expect(top("zzzxqv")).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { formatPageList, parsePageRanges } from "./page-ranges";

describe("parsePageRanges", () => {
  it("returns all pages for empty input", () => {
    expect(parsePageRanges("  ", 3).pages).toEqual([1, 2, 3]);
  });
  it("parses lists, ranges and open ends", () => {
    expect(parsePageRanges("1-3, 5, 8-", 10).pages).toEqual([1, 2, 3, 5, 8, 9, 10]);
    expect(parsePageRanges("-2", 5).pages).toEqual([1, 2]);
    expect(parsePageRanges("4-end", 5).pages).toEqual([4, 5]);
  });
  it("de-duplicates and sorts unless order is requested", () => {
    expect(parsePageRanges("3,1,3", 5).pages).toEqual([1, 3]);
    expect(parsePageRanges("3,1", 5, { keepOrder: true }).pages).toEqual([3, 1]);
    expect(parsePageRanges("5-3", 5, { keepOrder: true }).pages).toEqual([5, 4, 3]);
  });
  it("explains invalid input", () => {
    expect(parsePageRanges("12", 10).error).toMatch(/doesn't exist/);
    expect(parsePageRanges("a-b", 10).error).toMatch(/isn't a valid/);
    expect(parsePageRanges("0", 10).error).toBeTruthy();
  });
  it("formats page lists compactly", () => {
    expect(formatPageList([1, 2, 3, 5, 7, 8])).toBe("1–3, 5, 7–8");
  });
});

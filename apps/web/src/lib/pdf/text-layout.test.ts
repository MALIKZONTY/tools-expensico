import { describe, expect, it } from "vitest";
import { itemsToLines, linesToBlocks, reflow, type RawTextItem } from "./text-layout";

const item = (str: string, x: number, y: number, size = 10, width = str.length * size * 0.5): RawTextItem => ({ str, transform: [size, 0, 0, size, x, y], width, height: size });

describe("itemsToLines", () => {
  it("groups items on the same baseline and orders them left to right", () => {
    const lines = itemsToLines([item("world", 60, 700), item("Hello", 10, 700.5), item("Next line", 10, 686)]);
    expect(lines.map((l) => l.text)).toEqual(["Hello world", "Next line"]);
  });
  it("inserts spaces only for real gaps", () => {
    const lines = itemsToLines([item("Expen", 10, 500, 10, 25), item("sico", 35, 500, 10, 20)]);
    expect(lines[0].text).toBe("Expensico");
  });
});

describe("linesToBlocks", () => {
  it("separates paragraphs on large gaps and detects headings", () => {
    const lines = itemsToLines([
      item("Annual Report", 10, 760, 20),
      item("This is the first", 10, 720),
      item("paragraph of text.", 10, 708),
      item("A second paragraph.", 10, 670),
    ]);
    const blocks = linesToBlocks(lines);
    expect(blocks.map((b) => b.kind)).toEqual(["heading", "paragraph", "paragraph"]);
    expect(blocks[1].text).toBe("This is the first paragraph of text.");
  });
});

describe("reflow", () => {
  it("joins hyphenated words across lines", () => {
    expect(reflow(["infor-", "mation is here"])).toBe("information is here");
    expect(reflow(["state-of-the-art", "design"])).toBe("state-of-the-art design");
  });
});

import { describe, expect, it } from "vitest";
import { fleschReadingEase, graphemeCount, sentences, smsSegments, syllables, textStats, topKeywords, words } from "./stats";
import { cleanText, convertCase } from "./transform";
import { diffLines, diffSummary, diffWords } from "./diff";
import { entropyBits, generatePassword, poolSize, randomInt } from "./password";
import { addMonths, businessDays, daysBetween, diffYmd, parseYmd } from "./dates";

describe("stats", () => {
  it("counts words across scripts and punctuation", () => {
    expect(words("Hello, world! It's 2026.").length).toBe(4);
    expect(words("नमस्ते दुनिया").length).toBe(2);
    expect(words("").length).toBe(0);
  });
  it("counts graphemes, not code units", () => {
    expect(graphemeCount("👍🏽")).toBe(1);
    expect(graphemeCount("नमस्ते")).toBeLessThan("नमस्ते".length);
  });
  it("splits sentences", () => {
    expect(sentences("One. Two? Three!").length).toBe(3);
    const s = textStats("First para.\n\nSecond para line one.\nline two.");
    expect(s.paragraphs).toBe(2);
    expect(s.words).toBe(8);
  });
  it("estimates syllables and readability", () => {
    expect(syllables("the")).toBe(1);
    expect(syllables("calculator")).toBe(4);
    const easy = fleschReadingEase("The cat sat on the mat. The dog ran to the park. It was fun.");
    expect(easy).toBeGreaterThan(90);
  });
  it("finds keywords without stop words", () => {
    expect(topKeywords("PDF tools and PDF converters for the PDF format")[0]).toEqual({ word: "pdf", count: 3 });
  });
  it("counts SMS segments", () => {
    expect(smsSegments("a".repeat(160))).toMatchObject({ encoding: "GSM-7", segments: 1 });
    expect(smsSegments("a".repeat(161)).segments).toBe(2);
    expect(smsSegments("नमस्ते")).toMatchObject({ encoding: "Unicode", segments: 1 });
    expect(smsSegments("€".repeat(80)).segments).toBe(1);
    expect(smsSegments("€".repeat(81)).segments).toBe(2);
  });
});

describe("case conversion", () => {
  it("converts between styles", () => {
    // AP style: articles, conjunctions and prepositions of three letters or fewer stay lowercase.
    expect(convertCase("hello world FROM expensico", "title")).toBe("Hello World From Expensico");
    expect(convertCase("the art of war", "title")).toBe("The Art of War");
    expect(convertCase("HELLO. how ARE you? fine", "sentence")).toBe("Hello. How are you? Fine");
    expect(convertCase("user first name", "camel")).toBe("userFirstName");
    expect(convertCase("userFirstName", "snake")).toBe("user_first_name");
    expect(convertCase("XMLHttpRequest id", "kebab")).toBe("xml-http-request-id");
    expect(convertCase("max retry count", "constant")).toBe("MAX_RETRY_COUNT");
    expect(convertCase("Hello", "inverse")).toBe("hELLO");
  });
});

describe("clean text", () => {
  it("applies operations", () => {
    expect(cleanText("  a  \n\n b ", "trim-lines")).toBe("a\n\nb");
    expect(cleanText("a\n\nb\n", "remove-blank-lines")).toBe("a\nb");
    expect(cleanText("one\ntwo\n\nthree\nfour", "remove-line-breaks")).toBe("one two\n\nthree four");
    expect(cleanText("b\na\nb", "dedupe-lines")).toBe("b\na");
    expect(cleanText("item10\nitem2\nitem1", "sort-natural")).toBe("item1\nitem2\nitem10");
    expect(cleanText("“Hi” — it’s…", "smart-to-straight-quotes")).toBe('"Hi" - it\'s...');
    expect(cleanText("a\nb", "add-line-numbers")).toBe("1. a\n2. b");
    expect(cleanText("1. a\n2) b", "remove-line-numbers")).toBe("a\nb");
  });
});

describe("diff", () => {
  it("finds minimal line changes", () => {
    const ops = diffLines("a\nb\nc", "a\nx\nc");
    expect(ops).toEqual([
      { type: "equal", value: "a" },
      { type: "delete", value: "b" },
      { type: "insert", value: "x" },
      { type: "equal", value: "c" },
    ]);
    expect(diffSummary(ops)).toEqual({ added: 1, removed: 1, unchanged: 2 });
  });
  it("can ignore case and whitespace", () => {
    expect(diffSummary(diffLines("Hello  World", "hello world", { ignoreCase: true, ignoreWhitespace: true })).unchanged).toBe(1);
  });
  it("handles empty sides", () => {
    expect(diffLines("", "a\nb").filter((o) => o.type === "insert").length).toBe(2);
  });
  it("diffs words", () => {
    const ops = diffWords("the quick fox", "the slow fox");
    expect(ops.filter((o) => o.type !== "equal").map((o) => o.value)).toEqual(["quick", "slow"]);
  });
});

describe("password", () => {
  it("respects options and includes every chosen set", () => {
    for (let i = 0; i < 50; i++) {
      const p = generatePassword({ length: 12, lower: true, upper: true, digits: true, symbols: false, excludeAmbiguous: true });
      expect(p).toHaveLength(12);
      expect(p).toMatch(/[a-z]/);
      expect(p).toMatch(/[A-Z]/);
      expect(p).toMatch(/\d/);
      expect(p).not.toMatch(/[Il1O0o]/);
    }
    expect(() => generatePassword({ length: 8, lower: false, upper: false, digits: false, symbols: false, excludeAmbiguous: false })).toThrow();
  });
  it("computes entropy", () => {
    const pool = poolSize({ length: 16, lower: true, upper: true, digits: true, symbols: false, excludeAmbiguous: false });
    expect(pool).toBe(62);
    expect(entropyBits(16, pool)).toBeCloseTo(95.27, 1);
  });
  it("randomInt stays in range", () => {
    for (let i = 0; i < 200; i++) {
      const r = randomInt(7);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(7);
    }
  });
});

describe("dates", () => {
  const d = (s: string) => parseYmd(s)!;
  it("validates dates", () => {
    expect(parseYmd("2026-02-29")).toBeNull();
    expect(parseYmd("2028-02-29")).not.toBeNull();
  });
  it("counts days and working days", () => {
    expect(daysBetween(d("2026-01-01"), d("2026-12-31"))).toBe(364);
    // Mon 5 Jan 2026 to Fri 16 Jan 2026 inclusive = 10 working days
    expect(businessDays(d("2026-01-05"), d("2026-01-16"))).toBe(10);
    expect(businessDays(d("2026-01-05"), d("2026-01-16"), { holidays: ["2026-01-14"] })).toBe(9);
    expect(businessDays(d("2026-01-05"), d("2026-01-16"), { excludeSaturday: false })).toBe(11); // only Sat 10 Jan is in range
  });
  it("adds months with end-of-month clamping", () => {
    expect(addMonths(d("2026-01-31"), 1)).toEqual({ y: 2026, m: 2, d: 28 });
    expect(addMonths(d("2028-01-31"), 1)).toEqual({ y: 2028, m: 2, d: 29 });
    expect(addMonths(d("2026-03-15"), -3)).toEqual({ y: 2025, m: 12, d: 15 });
  });
  it("computes age-style differences", () => {
    expect(diffYmd(d("1990-08-15"), d("2026-10-03"))).toEqual({ years: 36, months: 1, days: 18 });
    expect(diffYmd(d("2026-01-31"), d("2026-03-01"))).toEqual({ years: 0, months: 1, days: 1 });
    expect(diffYmd(d("2024-02-29"), d("2025-02-28"))).toEqual({ years: 1, months: 0, days: 0 });
    expect(diffYmd(d("2026-05-10"), d("2026-05-10"))).toEqual({ years: 0, months: 0, days: 0 });
  });
});

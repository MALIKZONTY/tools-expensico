import { describe, expect, it } from "vitest";
import { displayWidth, flattenJson, inferScalar, keepAsText, parseCsvText, rowsToObjects, toCsv, toHtmlTable, toTextTable, uniqueHeaders } from "./table";

describe("parseCsvText", () => {
  it("handles quotes, embedded commas, escaped quotes and newlines", () => {
    const csv = 'name,city,note\n"Asha","Mumbai, India","She said ""hi""\nthen left"\n';
    const { rows, delimiter, problems } = parseCsvText(csv);
    expect(delimiter).toBe(",");
    expect(problems).toEqual([]);
    expect(rows).toEqual([
      ["name", "city", "note"],
      ["Asha", "Mumbai, India", 'She said "hi"\nthen left'],
    ]);
  });

  it("detects semicolon and tab delimiters", () => {
    expect(parseCsvText("a;b\n1;2").delimiter).toBe(";");
    expect(parseCsvText("a\tb\n1\t2").delimiter).toBe("\t");
  });

  it("strips a UTF-8 BOM", () => {
    expect(parseCsvText("﻿id,v\n1,2").rows[0][0]).toBe("id");
  });

  it("reports malformed quoting with a row number", () => {
    const { problems } = parseCsvText('a,b\n"unterminated,2\n3,4');
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.join(" ")).toMatch(/row/i);
  });

  it("preserves Unicode", () => {
    expect(parseCsvText("नाम,शहर\nराम,दिल्ली").rows[1]).toEqual(["राम", "दिल्ली"]);
  });
});

describe("inferScalar", () => {
  it("types plain numbers and booleans", () => {
    expect(inferScalar("42")).toBe(42);
    expect(inferScalar("-3.5")).toBe(-3.5);
    expect(inferScalar("1e3")).toBe(1000);
    expect(inferScalar("TRUE")).toBe(true);
    expect(inferScalar("")).toBeNull();
  });
  it("keeps values that would change meaning as strings", () => {
    expect(inferScalar("007")).toBe("007");
    expect(inferScalar("+919876543210")).toBe("+919876543210");
    expect(inferScalar("1,234")).toBe("1,234");
    expect(inferScalar("1234567890123456789")).toBe("1234567890123456789");
    expect(inferScalar(".5")).toBe(".5");
    expect(keepAsText("0400001")).toBe(true);
    expect(keepAsText("12.5")).toBe(false);
  });
});

describe("uniqueHeaders / rowsToObjects", () => {
  it("de-duplicates and fills blank headers", () => {
    expect(uniqueHeaders(["a", "a", "", "a"])).toEqual(["a", "a_2", "column_3", "a_3"]);
  });
  it("keeps extra cells instead of dropping them", () => {
    expect(rowsToObjects(["a"], [["1", "x"]], true)).toEqual([{ a: 1, column_2: "x" }]);
  });
});

describe("flattenJson", () => {
  it("flattens nested objects and unions keys", () => {
    const t = flattenJson([{ id: 1, user: { name: "A", tags: ["x", "y"] } }, { id: 2, extra: true }]);
    expect(t.columns).toEqual(["id", "user.name", "user.tags", "extra"]);
    expect(t.rows).toEqual([
      [1, "A", "x; y", null],
      [2, null, null, true],
    ]);
  });
  it("unwraps a single array property like {data: [...]}", () => {
    expect(flattenJson({ data: [{ a: 1 }, { a: 2 }], total: 2 }).rows).toEqual([[1], [2]]);
  });
  it("keeps arrays of objects as JSON text", () => {
    expect(flattenJson([{ items: [{ q: 1 }] }]).rows[0][0]).toBe('[{"q":1}]');
  });
});

describe("serialisers", () => {
  it("quotes CSV values only when needed", () => {
    expect(toCsv([["a", "b,c", 'd"e', " lead", 5, null]])).toBe('a,"b,c","d""e"," lead",5,');
    expect(toCsv([["a;b", "c"]], ";")).toBe('"a;b";c');
  });
  it("escapes HTML", () => {
    expect(toHtmlTable(["<h>"], [["a & b"]])).toContain("<th scope=\"col\">&lt;h&gt;</th>");
    expect(toHtmlTable(null, [["<script>"]])).toContain("&lt;script&gt;");
  });
  it("renders aligned text tables", () => {
    expect(toTextTable(["id", "name"], [["1", "Asha"]], "markdown")).toBe("| id  | name |\n| --- | ---- |\n| 1   | Asha |");
    expect(toTextTable(["a"], [["xy"]], "ascii")).toBe("+----+\n| a  |\n+----+\n| xy |\n+----+");
  });
  it("measures wide characters", () => {
    expect(displayWidth("日本")).toBe(4);
    expect(displayWidth("é")).toBe(1);
  });
});

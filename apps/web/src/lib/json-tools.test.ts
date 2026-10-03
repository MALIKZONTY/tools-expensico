import { describe, expect, it } from "vitest";
import { jsonPath, parseJson, stringify } from "./json-tools";

describe("parseJson", () => {
  it("parses valid JSON", () => {
    expect(parseJson('{"a":[1,2]}')).toEqual({ ok: true, value: { a: [1, 2] } });
  });
  it("explains trailing commas", () => {
    const r = parseJson('{\n  "a": 1,\n}');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.issue.line).toBe(3);
      expect(r.issue.explanation).toMatch(/trailing comma/);
    }
  });
  it("explains single quotes and unquoted keys", () => {
    const a = parseJson("{'a': 1}");
    const b = parseJson("{a: 1}");
    expect(!a.ok && a.issue.explanation).toMatch(/double quotes/);
    expect(!b.ok && b.issue.explanation).toMatch(/double quotes|wrapped/);
  });
  it("explains truncated JSON", () => {
    const r = parseJson('{"a": [1, 2');
    expect(!r.ok && r.issue.explanation).toMatch(/ends too early/);
  });
});

describe("stringify / jsonPath", () => {
  it("sorts keys deeply and supports tabs/minify", () => {
    expect(stringify({ b: 1, a: { d: 1, c: 2 } }, 0, true)).toBe('{"a":{"c":2,"d":1},"b":1}');
    expect(stringify({ a: 1 }, "tab")).toBe('{\n\t"a": 1\n}');
  });
  it("builds readable paths", () => {
    expect(jsonPath(["users", 0, "first name"])).toBe('$.users[0]["first name"]');
  });
});

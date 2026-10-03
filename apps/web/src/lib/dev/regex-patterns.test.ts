import { describe, expect, it } from "vitest";
import { PATTERNS } from "./regex-patterns";

describe("regex pattern library", () => {
  for (const p of PATTERNS) {
    it(`${p.name} behaves as documented`, () => {
      const make = () => new RegExp(p.pattern, p.flags.replace("g", ""));
      for (const s of p.matches) expect(make().test(s), `${p.id} should match ${s}`).toBe(true);
      for (const s of p.rejects) expect(make().test(s), `${p.id} should reject ${s}`).toBe(false);
    });
  }
  it("has unique ids", () => {
    expect(new Set(PATTERNS.map((p) => p.id)).size).toBe(PATTERNS.length);
  });
});

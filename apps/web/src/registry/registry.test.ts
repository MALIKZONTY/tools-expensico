import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CONVERSIONS } from "@/lib/convert/catalog";
import { FORMATS } from "@/lib/convert/formats";
import { CATEGORIES } from "./categories";
import { CONTENT_LOADERS } from "./content";
import { TOOLS, toolRedirects } from "./tools";
import { GUIDES } from "@/content/guides";
import { hasIcon } from "@/components/tool/tool-icon";

const componentsSource = readFileSync(join(__dirname, "components.tsx"), "utf8");

describe("tool registry integrity", () => {
  it("has unique slugs", () => {
    const slugs = TOOLS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every tool has UI and content", () => {
    for (const t of TOOLS) {
      if (t.kind === "converter") continue;
      expect(componentsSource, `component for ${t.slug}`).toContain(`"${t.slug}": dynamic(`);
      expect(CONTENT_LOADERS[t.slug], `content for ${t.slug}`).toBeTypeOf("function");
    }
  });

  it("related links and alsoIn categories resolve", () => {
    const slugs = new Set(TOOLS.map((t) => t.slug));
    const cats = new Set(CATEGORIES.map((c) => c.id));
    for (const t of TOOLS) {
      for (const r of t.related) expect(slugs.has(r) || CONVERSIONS.some((c) => c.slug === r), `${t.slug} → ${r}`).toBe(true);
      for (const c of t.alsoIn ?? []) expect(cats.has(c)).toBe(true);
      if (t.kind !== "converter") expect(hasIcon(t.slug), `no icon in scripts/icon-map.json for ${t.slug}`).toBe(true);
    }
  });

  it("descriptions are unique and a sensible length for search snippets", () => {
    const seen = new Set<string>();
    for (const t of TOOLS) {
      expect(seen.has(t.description), `duplicate description ${t.slug}`).toBe(false);
      seen.add(t.description);
      expect(t.description.length, `${t.slug} description length`).toBeGreaterThanOrEqual(70);
      expect(t.description.length, `${t.slug} description length`).toBeLessThanOrEqual(175);
    }
  });

  it("converters reference real formats and have hand-written content when they get a page", () => {
    for (const c of CONVERSIONS) {
      expect(FORMATS[c.from]).toBeDefined();
      expect(FORMATS[c.to]).toBeDefined();
      expect(c.accepts).toContain(c.from);
      if (c.landing) {
        expect(c.content, `content for ${c.slug}`).toBeDefined();
        expect(c.content!.faqs.length).toBeGreaterThan(0);
      }
    }
  });

  it("redirects never point to themselves or form chains", () => {
    const sources = new Set(toolRedirects().map((r) => r.source));
    for (const r of toolRedirects()) {
      expect(r.source).not.toBe(r.destination);
      expect(sources.has(r.destination), `chain via ${r.destination}`).toBe(false);
    }
  });

  it("guides link to existing tools", () => {
    const slugs = new Set(TOOLS.map((t) => t.slug));
    for (const g of GUIDES) for (const s of g.tools) expect(slugs.has(s), `${g.slug} → ${s}`).toBe(true);
  });
});

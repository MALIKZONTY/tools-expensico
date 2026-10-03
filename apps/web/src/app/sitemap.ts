import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { GUIDES } from "@/content/guides";
import { CATEGORIES } from "@/registry/categories";
import { TOOLS, toolPath } from "@/registry/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const launch = new Date("2026-10-03");
  const page = (path: string, priority: number, lastModified = launch): MetadataRoute.Sitemap[number] => ({ url: absoluteUrl(path), lastModified, changeFrequency: "monthly", priority });
  return [
    page("/", 1),
    page("/tools", 0.9),
    ...CATEGORIES.filter((c) => c.path !== "tools").map((c) => page(`/${c.path}`, 0.9)),
    page("/notes", 0.8),
    ...TOOLS.map((t) => page(toolPath(t), t.popular ? 0.8 : 0.7, new Date(t.addedAt))),
    page("/guides", 0.6),
    ...GUIDES.map((g) => page(`/guides/${g.slug}`, 0.6, new Date(g.updated ?? g.published))),
    page("/about", 0.4),
    page("/contact", 0.3),
    page("/privacy-policy", 0.2),
    page("/terms", 0.2),
    page("/disclaimer", 0.2),
    page("/cookie-policy", 0.2),
  ];
}

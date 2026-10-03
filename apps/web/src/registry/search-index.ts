import type { SearchEntry } from "@/lib/search";
import { CATEGORIES, getCategory } from "./categories";
import { TOOLS, toolPath } from "./tools";

/** Builds the compact search index served at /search-index.json. */
export function buildSearchIndex(): SearchEntry[] {
  const tools: SearchEntry[] = TOOLS.map((t) => ({
    href: toolPath(t),
    title: t.title,
    description: t.description,
    group: getCategory(t.category).shortName,
    category: t.category,
    keywords: t.keywords,
    popular: t.popular,
  }));

  const extras: SearchEntry[] = [
    {
      href: "/notes",
      title: "Online Notes",
      description: "Create, pin, search and organise multiple notes saved in your browser.",
      group: "Notes",
      category: "productivity",
      keywords: ["notes", "online notes", "note taking", "save notes", "notebook", "memo"],
      popular: true,
    },
    {
      href: "/convert",
      title: "Universal File Converter",
      description: "Drop any file to see every format Expensico can convert it to.",
      group: "Convert",
      category: "convert",
      keywords: ["converter", "convert file", "file converter", "change file format"],
      popular: true,
    },
    ...CATEGORIES.map((c) => ({
      href: `/${c.path}`,
      title: c.name,
      description: c.description,
      group: "Category",
      category: c.id,
      keywords: [c.shortName.toLowerCase(), c.name.toLowerCase()],
    })),
  ];
  return [...extras, ...tools];
}

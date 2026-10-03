import { CONVERSIONS } from "@/lib/convert/catalog";
import { FORMATS, type FormatId } from "@/lib/convert/formats";
import { CATEGORIES, type CategoryId } from "./categories";
import { TOOLS, toolPath, toolsInCategory, type ToolMeta } from "./tools";

export interface MenuLink {
  title: string;
  href: string;
  icon: string;
  category: CategoryId;
  /** First sentence of the description. */
  summary: string;
  /** Target format, for converters (shown as a format tile instead of an icon). */
  format?: FormatId;
  /** Source format, for converters. */
  from?: FormatId;
}

export interface MenuColumn {
  id: string;
  title: string;
  href?: string;
  category: CategoryId;
  links: MenuLink[];
  total?: number;
}

const link = (t: ToolMeta): MenuLink => ({ title: t.title.replace(/\s+—.*$/, "").replace(/\s*\(.*?\)/g, "").replace(/ Converter$/, "").trim(), href: toolPath(t),
  icon: t.slug,
  summary: (t.description.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? t.description).trim(),
  category: t.category,
  format: t.conversionSlug ? CONVERSIONS.find((c) => c.slug === t.conversionSlug)?.to : undefined,
  from: t.conversionSlug ? CONVERSIONS.find((c) => c.slug === t.conversionSlug)?.from : undefined,
});

/** "All tools" mega menu: one column per category, popular tools first. */
export function allToolsMenu(perColumn = 8): MenuColumn[] {
  const order: CategoryId[] = ["pdf", "convert", "files", "finance", "productivity", "developer"];
  return order.map((id) => {
    const c = CATEGORIES.find((x) => x.id === id)!;
    const tools = toolsInCategory(id).filter((t) => t.category === id);
    const sorted = [...tools.filter((t) => t.popular), ...tools.filter((t) => !t.popular)];
    return { id, title: c.name, href: `/${c.path}`, category: id, links: sorted.slice(0, perColumn).map(link), total: tools.length };
  });
}

/** "Convert" menu grouped like the conversion matrix. */
export function convertMenu(): MenuColumn[] {
  const convertTools = TOOLS.filter((t) => t.kind === "converter");
  const def = (t: ToolMeta) => CONVERSIONS.find((c) => c.slug === t.conversionSlug)!;
  const groups: { id: string; title: string; test: (t: ToolMeta) => boolean }[] = [
    { id: "from-pdf", title: "From PDF", test: (t) => def(t).from === "pdf" },
    { id: "to-pdf", title: "To PDF", test: (t) => def(t).to === "pdf" },
    { id: "images", title: "Images", test: (t) => FORMATS[def(t).from].family === "image" && def(t).to !== "pdf" },
    { id: "sheets", title: "Spreadsheets", test: (t) => ["csv", "tsv", "xlsx", "xls", "ods"].includes(def(t).from) },
    { id: "data", title: "JSON, XML & YAML", test: (t) => ["json", "xml", "yaml"].includes(def(t).from) },
    { id: "docs", title: "Documents & text", test: (t) => ["document", "text"].includes(FORMATS[def(t).from].family) && def(t).from !== "pdf" && def(t).to !== "pdf" },
  ];
  return groups
    .map((g) => ({ id: g.id, title: g.title, category: "convert" as CategoryId, links: convertTools.filter(g.test).map(link) }))
    .filter((g) => g.links.length);
}

export interface CategoryMenu {
  id: CategoryId;
  /** Short label for the header bar. */
  label: string;
  title: string;
  description: string;
  href: string;
  total: number;
  columns: MenuColumn[];
}

const NAV_LABEL: Record<CategoryId, string> = {
  pdf: "PDF Tools",
  convert: "Convert",
  files: "File Tools",
  finance: "Finance",
  productivity: "Productivity",
  developer: "Developer",
};

/** Header dropdowns: one per category, listing every tool in balanced columns. */
export function categoryMenus(): CategoryMenu[] {
  const order: CategoryId[] = ["pdf", "convert", "files", "finance", "productivity", "developer"];
  return order.map((id) => {
    const c = CATEGORIES.find((x) => x.id === id)!;
    const tools = toolsInCategory(id);
    const sorted = [...tools.filter((t) => t.popular), ...tools.filter((t) => !t.popular)];
    let columns: MenuColumn[];
    if (id === "convert") {
      columns = convertMenu();
    } else {
      const perColumn = Math.ceil(sorted.length / 3);
      columns = [];
      for (let i = 0; i < sorted.length; i += perColumn) {
        columns.push({ id: `${id}-${i}`, title: "", category: id, links: sorted.slice(i, i + perColumn).map(link) });
      }
    }
    return { id, label: NAV_LABEL[id], title: c.name, description: c.description, href: `/${c.path}`, total: tools.length, columns };
  });
}

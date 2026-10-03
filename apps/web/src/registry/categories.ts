export type CategoryId = "files" | "pdf" | "convert" | "finance" | "productivity" | "developer";

export interface Category {
  id: CategoryId;
  /** URL segment, e.g. /tools/pdf-viewer for "files". */
  path: string;
  name: string;
  shortName: string;
  /** Used in the H1 of the category page. */
  heading: string;
  description: string;
  /** Longer intro paragraph on the category page. */
  intro: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "files",
    path: "tools",
    name: "File Tools",
    shortName: "Files",
    heading: "File tools",
    description: "View, inspect, compress, resize and package files — CSV, Excel, Word, JSON, images, ZIP and more.",
    intro:
      "Open almost any common file without installing software, check what a file really is, and shrink or reshape images. File tools run in your browser, so your documents stay on your device.",
    icon: "folder",
  },
  {
    id: "pdf",
    path: "pdf",
    name: "PDF Tools",
    shortName: "PDF",
    heading: "PDF tools",
    description: "View, merge, split, rotate, compress and convert PDF files. Most PDF tools work entirely in your browser.",
    intro:
      "Everything you regularly need to do with PDFs: read them, combine them, pull pages out, fix sideways pages, shrink them for email and turn them into images or text. Unless a tool clearly says otherwise, your PDF never leaves your device.",
    icon: "file-text",
  },
  {
    id: "convert",
    path: "convert",
    name: "Convert",
    shortName: "Convert",
    heading: "File converter",
    description: "Convert between PDF, images, Excel, CSV, JSON, Word, Markdown and more — only conversions that work reliably.",
    intro:
      "Drop in a file and Expensico shows exactly which formats it can be converted to, with an honest note on how faithful each conversion is.",
    icon: "repeat",
  },
  {
    id: "finance",
    path: "finance",
    name: "Finance Calculators",
    shortName: "Finance",
    heading: "Finance calculators",
    description: "EMI, SIP, FD, RD, salary, PF, GST and other calculators with clear formulas, schedules and Indian number formatting.",
    intro:
      "Plan loans, investments and budgets with calculators that show their working: the formula, a year-by-year breakdown and the assumptions behind every number. Results are estimates for planning, not financial advice.",
    icon: "indian-rupee",
  },
  {
    id: "productivity",
    path: "productivity",
    name: "Productivity Tools",
    shortName: "Productivity",
    heading: "Productivity tools",
    description: "Notepad, word counter, text tools, QR codes, passwords, date calculators, timers and to-do lists.",
    intro:
      "Small, fast tools for everyday writing and planning. Anything you type is kept in your browser — nothing is sent to a server.",
    icon: "list-checks",
  },
  {
    id: "developer",
    path: "developer",
    name: "Developer Tools",
    shortName: "Developer",
    heading: "Developer tools",
    description: "Format and validate JSON, YAML, XML, SQL and code; decode JWTs and Base64; test regex, cron and hashes.",
    intro:
      "Formatters, decoders and generators that run entirely client-side, so it's safe to paste tokens, payloads and config files. No data is logged or uploaded.",
    icon: "code",
  },
];

export function getCategory(id: CategoryId): Category {
  const c = CATEGORIES.find((cat) => cat.id === id);
  if (!c) throw new Error(`Unknown category ${id}`);
  return c;
}

export function getCategoryByPath(path: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.path === path);
}

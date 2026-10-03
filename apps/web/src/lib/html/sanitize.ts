/**
 * HTML sanitising and text extraction for user-supplied content (browser only).
 */

export async function sanitizeHtml(html: string, opts: { allowImages?: boolean } = {}): Promise<string> {
  const { default: DOMPurify } = await import("dompurify");
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "form", "input", "button", "textarea", "select", ...(opts.allowImages === false ? ["img"] : [])],
    FORBID_ATTR: ["style"],
    ALLOW_DATA_ATTR: false,
  });
}

/** Rendered markdown → sanitised HTML (GitHub-flavoured). */
export async function markdownToSafeHtml(markdown: string): Promise<string> {
  const { marked } = await import("marked");
  const raw = await marked.parse(markdown, { gfm: true, breaks: false });
  return sanitizeHtml(raw);
}

const BLOCK = new Set(["P", "DIV", "SECTION", "ARTICLE", "HEADER", "FOOTER", "MAIN", "ASIDE", "NAV", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "TABLE", "TR", "BLOCKQUOTE", "PRE", "HR", "FIGURE", "FIGCAPTION", "DL", "DT", "DD", "ADDRESS", "FORM", "FIELDSET"]);
const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "SVG", "CANVAS", "IFRAME", "OBJECT", "HEAD"]);

/** Readable plain text from HTML. Parsing uses an inert document: nothing is executed or fetched. */
export function htmlToPlainText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const out: string[] = [];
  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      out.push((node.textContent ?? "").replace(/\s+/g, " "));
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    if (SKIP.has(el.tagName) || el.hasAttribute("hidden") || el.getAttribute("aria-hidden") === "true") return;
    if (el.tagName === "BR") {
      out.push("\n");
      return;
    }
    const block = BLOCK.has(el.tagName);
    if (block) out.push("\n");
    if (el.tagName === "LI") out.push("• ");
    if (el.tagName === "TD" || el.tagName === "TH") out.push("\t");
    el.childNodes.forEach(walk);
    if (block) out.push("\n");
  }
  walk(doc.body ?? doc.documentElement);
  return out
    .join("")
    .split("\n")
    .map((l) => l.replace(/^[ \t]+|[ \t]+$/g, "").replace(/ {2,}/g, " "))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

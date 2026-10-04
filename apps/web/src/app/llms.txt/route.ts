import { absoluteUrl, site } from "@/config/site";
import { GUIDES } from "@/content/guides";
import { CATEGORIES } from "@/registry/categories";
import { TOOLS, toolPath } from "@/registry/tools";

export const dynamic = "force-static";

/** /llms.txt (llmstxt.org): who we are in one paragraph, then the canonical page for each answer. */
export function GET() {
  const link = (name: string, path: string, desc: string) => `- [${name}](${absoluteUrl(path)}): ${desc}`;

  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `${site.name} (${site.domain}) is run by ${site.operator.name}. There is no signup. Tools that process files say on the page whether the file stays in your browser or is sent to a conversion server, and every converter states how faithful its output is.`,
    "",
    "## Tool categories",
    "",
    ...CATEGORIES.map((c) => link(c.name, `/${c.path}`, c.description)),
    "",
    ...CATEGORIES.flatMap((c) => [
      `## ${c.name}`,
      "",
      ...TOOLS.filter((t) => t.category === c.id).map((t) => link(t.title, toolPath(t), t.description)),
      "",
    ]),
    "## Guides",
    "",
    ...GUIDES.map((g) => link(g.title, `/guides/${g.slug}`, g.description)),
    "",
    "## About",
    "",
    link("About", "/about", "Who runs Expensico, how the tools are built and checked, and how files are kept private."),
    link("Contact", "/contact", `Questions, bug reports and feedback. Email: ${site.contactEmail}.`),
    link("Privacy policy", "/privacy-policy", "What data is and isn't collected."),
    "",
  ];

  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { ToolGrid, ToolLinkList } from "@/components/tool/ToolGrid";
import { ToolIcon } from "@/components/tool/tool-icon";
import { pageMetadata } from "@/lib/seo";
import { CATEGORIES } from "@/registry/categories";
import { TOOLS, toolsInCategory } from "@/registry/tools";

export const metadata = pageMetadata({
  title: "All Tools — File, PDF, Finance, Productivity and Developer Tools",
  description: `Browse all ${TOOLS.length}+ free Expensico tools: file viewers, PDF tools, converters, finance calculators, productivity and developer utilities.`,
  path: "/tools",
});

const FILE_GROUPS = [
  { heading: "Viewers", slugs: ["pdf-viewer", "csv-viewer", "excel-viewer", "docx-viewer", "json-viewer", "xml-viewer", "markdown-viewer", "text-viewer", "html-viewer", "image-viewer"] },
  { heading: "Images", slugs: ["image-compressor", "image-resizer", "image-cropper", "image-metadata"] },
  { heading: "File utilities", slugs: ["file-info", "file-size-converter", "zip-creator", "zip-extractor", "file-compare"] },
];

export default function Page() {
  const fileTools = toolsInCategory("files");
  const bySlug = new Map(fileTools.map((t) => [t.slug, t]));
  return (
    <Container className="pb-16 pt-5 sm:pt-6">
      <Breadcrumbs items={[{ name: "All tools", href: "/tools" }]} />
      <header className="mt-6 max-w-3xl">
        <h1 className="text-[2rem] font-semibold leading-tight tracking-tight text-fg sm:text-4xl">All tools</h1>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">
          Every Expensico tool in one place. Start with file tools below, or jump to a category. Most tools run entirely in your browser — your files never leave your device.
        </p>
      </header>

      <nav aria-label="Categories" className="mt-8">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <a href={`#${c.id}`} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-medium text-fg hover:border-border-strong">
                <ToolIcon name={`@category-${c.id}`} category={c.id} size="sm" />
                {c.shortName}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="files" aria-labelledby="files-h" className="mt-12 scroll-mt-24">
        <h2 id="files-h" className="text-2xl font-semibold tracking-tight">File tools</h2>
        <p className="mt-1 text-muted">Open, inspect and reshape files without installing anything.</p>
        {FILE_GROUPS.map((g) => (
          <div key={g.heading} className="mt-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{g.heading}</h3>
            <ToolGrid tools={g.slugs.map((s) => bySlug.get(s)!).filter(Boolean)} />
          </div>
        ))}
      </section>

      {CATEGORIES.filter((c) => c.id !== "files").map((c) => {
        const tools = toolsInCategory(c.id);
        return (
          <section key={c.id} id={c.id} aria-labelledby={`${c.id}-h`} className="mt-14 scroll-mt-24">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 id={`${c.id}-h`} className="text-2xl font-semibold tracking-tight">{c.name}</h2>
                <p className="mt-1 text-muted">{c.description}</p>
              </div>
              <Link href={`/${c.path}`} className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
                {c.name} overview <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </div>
            <div className="mt-4 rounded-xl border border-border bg-surface p-2 sm:p-3">
              <ToolLinkList tools={tools} />
            </div>
          </section>
        );
      })}
    </Container>
  );
}

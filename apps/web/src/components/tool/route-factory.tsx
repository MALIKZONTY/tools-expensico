import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { getCategory, type CategoryId } from "@/registry/categories";
import { ToolMount } from "@/registry/components";
import { loadToolContent } from "@/registry/content";
import { TOOLS, getTool, toolPath, toolRedirects } from "@/registry/tools";
import { ToolPage } from "./ToolPage";

type Params = { params: Promise<{ slug: string }> };

/** Builds the static route handlers for /<category>/<slug>. */
export function makeToolRoute(categoryId: CategoryId) {
  const category = getCategory(categoryId);

  function resolve(slug: string) {
    const tool = getTool(slug);
    return tool && tool.category === categoryId ? tool : undefined;
  }

  /** Alternative URLs under this category that 308-redirect to a tool's canonical URL. */
  const aliases = new Map(
    toolRedirects()
      .filter((r) => r.source.startsWith(`/${category.path}/`))
      .map((r) => [r.source.slice(category.path.length + 2), r.destination] as const),
  );

  return {
    generateStaticParams() {
      return [...TOOLS.filter((t) => t.category === categoryId).map((t) => ({ slug: t.slug })), ...[...aliases.keys()].map((slug) => ({ slug }))];
    },

    async generateMetadata({ params }: Params): Promise<Metadata> {
      const { slug } = await params;
      const tool = resolve(slug);
      if (!tool) return aliases.has(slug) ? { robots: { index: false } } : {};
      return pageMetadata({
        title: tool.metaTitle ?? `${tool.title} — Free Online ${category.shortName === "Convert" ? "Converter" : "Tool"}`,
        description: tool.description,
        path: toolPath(tool),
      });
    },

    async Page({ params }: Params) {
      const { slug } = await params;
      const tool = resolve(slug);
      if (!tool) {
        const target = aliases.get(slug);
        if (target) permanentRedirect(target);
        notFound();
      }
      const content = await loadToolContent(tool);
      return (
        <ToolPage tool={tool} content={content}>
          <ToolMount slug={tool.slug} conversionSlug={tool.conversionSlug} />
        </ToolPage>
      );
    },
  };
}

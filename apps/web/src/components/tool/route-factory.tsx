import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { getCategory, type CategoryId } from "@/registry/categories";
import { ToolMount } from "@/registry/components";
import { loadToolContent } from "@/registry/content";
import { TOOLS, getTool, toolPath } from "@/registry/tools";
import { ToolPage } from "./ToolPage";

type Params = { params: Promise<{ slug: string }> };

/**
 * Builds the static route handlers for /<category>/<slug>. Alternative URLs (a tool listed in
 * several categories, legacy aliases) are not pages: they become 301s in next.config.ts,
 * generated from the registry by toolRedirects().
 */
export function makeToolRoute(categoryId: CategoryId) {
  const category = getCategory(categoryId);

  function resolve(slug: string) {
    const tool = getTool(slug);
    return tool && tool.category === categoryId ? tool : undefined;
  }

  return {
    generateStaticParams() {
      return TOOLS.filter((t) => t.category === categoryId).map((t) => ({ slug: t.slug }));
    },

    async generateMetadata({ params }: Params): Promise<Metadata> {
      const { slug } = await params;
      const tool = resolve(slug);
      if (!tool) return {};
      return pageMetadata({
        title: tool.metaTitle ?? `${tool.title} — Free Online ${category.shortName === "Convert" ? "Converter" : "Tool"}`,
        description: tool.description,
        path: toolPath(tool),
      });
    },

    async Page({ params }: Params) {
      const { slug } = await params;
      const tool = resolve(slug);
      if (!tool) notFound();
      const content = await loadToolContent(tool);
      return (
        <ToolPage tool={tool} content={content}>
          <ToolMount slug={tool.slug} conversionSlug={tool.conversionSlug} />
        </ToolPage>
      );
    },
  };
}

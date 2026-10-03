import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { JsonLd, pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/config/site";
import { getCategory, type CategoryId } from "@/registry/categories";
import { toolPath, toolsInCategory, type ToolMeta } from "@/registry/tools";
import { ToolGrid } from "./ToolGrid";
import { ToolIcon } from "./tool-icon";

export interface CategoryGroup {
  heading: string;
  description?: string;
  slugs: string[];
}

export function categoryMetadata(id: CategoryId, title?: string): Metadata {
  const c = getCategory(id);
  return pageMetadata({ title: title ?? `${c.name} — Free Online ${c.shortName} Tools`, description: c.description, path: `/${c.path}` });
}

/**
 * Category landing page. Tools can be grouped; any tool in the category that isn't in a
 * group is listed under "More" so nothing is ever hidden.
 */
export function CategoryPage({ id, groups, intro, children }: { id: CategoryId; groups?: CategoryGroup[]; intro?: ReactNode; children?: ReactNode }) {
  const c = getCategory(id);
  const all = toolsInCategory(id);
  const bySlug = new Map(all.map((t) => [t.slug, t]));
  const used = new Set<string>();
  const resolved: { heading: string; description?: string; tools: ToolMeta[] }[] = (groups ?? []).map((g) => {
    const tools = g.slugs.map((s) => bySlug.get(s)).filter((t): t is ToolMeta => Boolean(t));
    tools.forEach((t) => used.add(t.slug));
    return { heading: g.heading, description: g.description, tools };
  });
  const rest = all.filter((t) => !used.has(t.slug));
  if (rest.length) resolved.push({ heading: groups?.length ? "More tools" : `All ${c.name.toLowerCase()}`, tools: rest });

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: c.name,
          description: c.description,
          url: absoluteUrl(`/${c.path}`),
          hasPart: all.map((t) => ({ "@type": "WebApplication", name: t.title, url: absoluteUrl(toolPath(t)) })),
        }}
      />
      <Container className="pb-16 pt-5 sm:pt-6">
        <Breadcrumbs items={[{ name: c.name, href: `/${c.path}` }]} />
        <header className="mt-6 flex max-w-3xl items-start gap-4">
          <ToolIcon name={`@category-${c.id}`} category={c.id} size="lg" className="hidden sm:inline-flex" />
          <div>
            <h1 className="text-[2rem] font-semibold leading-tight tracking-tight text-fg sm:text-4xl">{c.heading}</h1>
            <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">{intro ?? c.intro}</p>
          </div>
        </header>

        {children}

        <div className="mt-10 flex flex-col gap-12">
          {resolved
            .filter((g) => g.tools.length)
            .map((g) => (
              <section key={g.heading} aria-labelledby={`g-${g.heading}`}>
                <h2 id={`g-${g.heading}`} className="text-xl font-semibold tracking-tight text-fg">
                  {g.heading}
                </h2>
                {g.description && <p className="mt-1 text-muted">{g.description}</p>}
                <ToolGrid tools={g.tools} className="mt-4" />
              </section>
            ))}
        </div>
      </Container>
    </>
  );
}

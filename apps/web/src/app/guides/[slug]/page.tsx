import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { AdSlot } from "@/components/layout/AdSlot";
import { ToolLinkCard } from "@/components/tool/ToolGrid";
import { GUIDES, getGuide } from "@/content/guides";
import { GUIDE_BODIES } from "@/content/guides/bodies";
import { JsonLd, articleJsonLd, pageMetadata } from "@/lib/seo";
import { getTool, type ToolMeta } from "@/registry/tools";

type Params = { params: Promise<{ slug: string }> };


export const dynamicParams = false;
export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const g = getGuide((await params).slug);
  if (!g) return {};
  return pageMetadata({ title: g.title, description: g.description, path: `/guides/${g.slug}`, type: "article", publishedTime: g.published, modifiedTime: g.updated });
}

export default async function GuidePage({ params }: Params) {
  const g = getGuide((await params).slug);
  if (!g) notFound();
  const { default: Body } = await GUIDE_BODIES[g.slug]();
  const tools = g.tools.map(getTool).filter((t): t is ToolMeta => Boolean(t));
  const date = new Date((g.updated ?? g.published) + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <JsonLd data={articleJsonLd({ title: g.title, description: g.description, path: `/guides/${g.slug}`, published: g.published, modified: g.updated })} />
      <Container className="pb-16 pt-5 sm:pt-6">
        <Breadcrumbs items={[{ name: "Guides", href: "/guides" }, { name: g.title, href: `/guides/${g.slug}` }]} />
        <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <article className="prose-ex min-w-0">
            <h1 className="text-[1.875rem] font-semibold leading-tight tracking-tight text-fg sm:text-[2.25rem]">{g.title}</h1>
            <p className="!mt-3 text-sm">
              By <Link href="/about">{site.operator.name}</Link> · {g.updated ? "Updated" : "Published"} {date} · {g.readingMinutes} min read
            </p>
            <p className="text-lg">{g.description}</p>
            <Body />
            <AdSlot placement="in-content" />
          </article>
          <aside className="flex flex-col gap-3 lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Tools in this guide</h2>
            {tools.map((t) => <ToolLinkCard key={t.slug} tool={t} />)}
            <Link href="/guides" className="mt-2 text-sm font-medium text-brand hover:underline">All guides →</Link>
          </aside>
        </div>
      </Container>
    </>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, MessageSquareWarning } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { AdSlot } from "@/components/layout/AdSlot";
import { JsonLd, faqJsonLd, webAppJsonLd } from "@/lib/seo";
import { getCategory } from "@/registry/categories";
import type { ToolContent } from "@/registry/content-types";
import { relatedTools, toolPath, type ToolMeta } from "@/registry/tools";
import { PrivacyBadge } from "./PrivacyBadge";
import { ToolGlyph, iconKey } from "./ToolGrid";
import { ToolIcon } from "./tool-icon";

const APP_CATEGORY: Record<string, string> = {
  files: "UtilitiesApplication",
  pdf: "UtilitiesApplication",
  convert: "UtilitiesApplication",
  finance: "FinanceApplication",
  productivity: "ProductivityApplication",
  developer: "DeveloperApplication",
};

/** Privacy FAQ derived from the tool's real processing mode, so it can never drift from the implementation. */
function privacyFaq(tool: ToolMeta) {
  switch (tool.processing) {
    case "local-file":
      return { q: "Are my files uploaded?", a: "No. This tool reads and processes files directly in your web browser. Nothing is sent to Expensico's servers, and the data is discarded when you close or reload the page." };
    case "local":
      return { q: "Is what I enter stored or sent anywhere?", a: "No. Calculations and processing happen in your browser. Nothing you type is sent to our servers. Some tools remember your last input in this browser's local storage for convenience; you can clear it at any time." };
    case "server":
      return { q: "Are my files uploaded?", a: "Yes — this conversion needs a full office engine, so your file is sent over an encrypted HTTPS connection to our conversion service. It is processed in a temporary folder and deleted immediately after the result is returned. Files are never shared or used for anything else." };
    case "hybrid":
      return { q: "Are my files uploaded?", a: "Not by default. The standard mode runs entirely in your browser. If a stronger server-based option is offered, it's clearly labelled and only used if you choose it; files sent that way are deleted immediately after processing." };
  }
}

interface ToolPageProps {
  tool: ToolMeta;
  content: ToolContent;
  children: ReactNode;
}

export function ToolPage({ tool, content, children }: ToolPageProps) {
  const category = getCategory(tool.category);
  const path = toolPath(tool);
  const related = relatedTools(tool);
  const faqs = content.faqs.some((f) => /upload|stored|sent anywhere/i.test(f.q)) ? content.faqs : [...content.faqs, privacyFaq(tool)];

  return (
    <>
      <JsonLd data={webAppJsonLd({ name: tool.title, description: tool.description, path, category: APP_CATEGORY[tool.category] })} />
      {faqs.length > 0 && <JsonLd data={faqJsonLd(faqs)} />}

      <Container className="pt-5 sm:pt-6">
        <Breadcrumbs items={[{ name: category.name, href: `/${category.path}` }, { name: tool.title, href: path }]} />

        <header className="mx-auto mt-6 flex max-w-3xl flex-col items-center text-center sm:mt-10">
          <ToolGlyph tool={tool} />
          <h1 className="mt-4 text-[1.875rem] font-bold leading-tight tracking-tight text-fg sm:text-[2.5rem]">{tool.title}</h1>
          <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted sm:text-lg">{tool.description}</p>
          <div className="mt-4">
            <PrivacyBadge mode={tool.processing} />
          </div>
        </header>

        <div className="mx-auto mt-8 max-w-6xl sm:mt-10" id="tool">
          {children}
        </div>

        <AdSlot placement="after-tool" />

        <div className="mt-16 grid grid-cols-1 gap-12 border-t border-border pt-12 pb-16 lg:mt-24 lg:pt-16 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
          <article className="prose-ex min-w-0">
            {content.steps.length > 0 && (
              <>
                <h2 className="!mt-0">How to use the {tool.title.replace(/ \(.*\)$/, "")}</h2>
                <ol>
                  {content.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </>
            )}

            {content.sections.map((s) => (
              <section key={s.heading}>
                <h2>{s.heading}</h2>
                {s.body}
              </section>
            ))}

            {content.example && (
              <section>
                <h2>{content.example.heading ?? "Example"}</h2>
                {content.example.body}
              </section>
            )}

            {faqs.length > 0 && (
              <section>
                <h2>Frequently asked questions</h2>
                <div className="not-prose mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
                  {faqs.map((f) => (
                    <details key={f.q} className="group px-4 sm:px-5">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-fg [&::-webkit-details-marker]:hidden">
                        {f.q}
                        <span aria-hidden className="text-xl leading-none text-subtle transition-transform group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="pb-4 text-[0.9375rem] leading-relaxed text-muted">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </article>

          <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            {related.length > 0 && (
              <nav aria-labelledby="related-heading">
                <h2 id="related-heading" className="text-sm font-semibold uppercase tracking-wide text-muted">
                  Related tools
                </h2>
                <ul className="mt-3 flex flex-col gap-1">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link href={toolPath(r)} className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-2">
                        <ToolIcon name={iconKey(r)} category={r.category} size="sm" />
                        <span className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium text-fg">{r.title}</span>
                        <ArrowRight aria-hidden className="size-4 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={`/${category.path}`} className="mt-2 inline-flex items-center gap-1 px-2 text-sm font-medium text-brand hover:underline">
                  All {category.name.toLowerCase()} <ArrowRight aria-hidden className="size-3.5" />
                </Link>
              </nav>
            )}

            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="flex items-center gap-2 font-medium text-fg">
                <MessageSquareWarning aria-hidden className="size-4 text-muted" />
                Something not working?
              </p>
              <p className="mt-1 text-sm text-muted">Tell us what happened and we&apos;ll look into it. Please don&apos;t attach confidential files.</p>
              <Link
                href={`/contact?topic=bug&tool=${encodeURIComponent(tool.slug)}`}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
              >
                Report an issue <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}

import Link from "next/link";
import { ArrowRight, BadgeCheck, Laptop, LockKeyhole, UserX } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { HeroCards } from "@/components/layout/HeroCards";
import { HeroSearch } from "@/components/layout/HeroSearch";
import { ToolExplorer, type ExplorerFilter } from "@/components/tool/ToolExplorer";
import { ToolLinkCard } from "@/components/tool/ToolGrid";
import { GUIDES } from "@/content/guides";
import { processorConfig, site } from "@/config/site";
import { JsonLd, pageMetadata, websiteJsonLd } from "@/lib/seo";
import { CATEGORIES, type CategoryId } from "@/registry/categories";
import { TOOLS, getTool, toolsInCategory, type ToolMeta } from "@/registry/tools";

export const metadata = pageMetadata({
  title: `${site.name} — Free Online Tools for PDF, Files, Finance and Productivity`,
  absoluteTitle: true,
  description:
    "Every tool you need in one place: convert and merge PDFs, compress images, view CSV and Excel, calculate EMI and SIP, format JSON and take notes. Free, no signup — most tools run in your browser.",
  path: "/",
});

/** Hand-picked order for the "All" view: the most useful tools first. */
const FEATURED = [
  "pdf-merge", "pdf-compress", "pdf-to-jpg", "jpg-to-pdf", "pdf-split", "image-compressor", "pdf-to-docx", "docx-to-pdf",
  "csv-to-xlsx", "xlsx-to-csv", "pdf-viewer", "image-resizer", "png-to-jpg", "webp-to-jpg", "emi-calculator", "sip-calculator",
  "salary-calculator", "gst-calculator", "json-formatter", "qr-code-generator", "word-counter", "notepad",
];

const CATEGORY_ORDER: CategoryId[] = ["pdf", "convert", "files", "finance", "productivity", "developer"];

const FILTER_LABEL: Record<CategoryId, string> = {
  pdf: "PDF",
  convert: "Convert",
  files: "Files & images",
  finance: "Finance",
  productivity: "Productivity",
  developer: "Developer",
};

const BENEFITS = [
  { icon: UserX, title: "No signup", body: "Open a tool and use it — no account, no email." },
  { icon: Laptop, title: "Runs in your browser", body: "Most tools process files on your device; nothing is uploaded." },
  { icon: LockKeyhole, title: "No tracking cookies", body: "Private by default. We never sell or look at your files." },
  { icon: BadgeCheck, title: "Honest results", body: "Every conversion says how faithful it is. No fake buttons." },
];

function orderedTools(): ToolMeta[] {
  const featured = FEATURED.map((s) => getTool(s)).filter((t): t is ToolMeta => Boolean(t));
  const seen = new Set(featured.map((t) => t.slug));
  const rest = CATEGORY_ORDER.flatMap((c) => TOOLS.filter((t) => t.category === c && !seen.has(t.slug)));
  return [...featured, ...rest];
}

function categoriesOf(t: ToolMeta): string {
  return [t.category, ...(t.alsoIn ?? []), ...(t.popular ? ["popular"] : [])].join(" ");
}

export default function HomePage() {
  const tools = orderedTools();
  const filters: ExplorerFilter[] = [
    { id: "all", label: "All tools", count: TOOLS.length },
    { id: "popular", label: "Popular", count: TOOLS.filter((t) => t.popular).length },
    ...CATEGORY_ORDER.map((c) => ({ id: c, label: FILTER_LABEL[c], count: toolsInCategory(c).length })),
  ];

  return (
    <>
      <JsonLd data={websiteJsonLd()} />

      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_55%,transparent)] [background:radial-gradient(48rem_20rem_at_50%_-6rem,color-mix(in_srgb,var(--brand-accent)_16%,transparent),transparent_70%),radial-gradient(28rem_18rem_at_0%_70%,color-mix(in_srgb,var(--brand-accent)_10%,transparent),transparent_70%),radial-gradient(28rem_18rem_at_100%_65%,color-mix(in_srgb,var(--brand-accent)_10%,transparent),transparent_70%)]"
        />
        <Container size="wide" className="relative pb-8 pt-10 text-center sm:pt-14 xl:min-h-[27rem] xl:pt-16">
          <HeroCards />
          <h1 className="mx-auto max-w-[52rem] text-balance text-[2rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-fg sm:text-5xl xl:text-[3.25rem]">
            One place for PDFs, files, money, notes and code
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
            {TOOLS.length} free tools to convert and compress files, plan loans and savings, jot down notes and to-dos, and format code. No signup{processorConfig.enabled ? ", and most tools never upload your files." : ", and your files never leave your device."}
          </p>
          <HeroSearch className="mx-auto mt-8 max-w-xl" />
        </Container>
      </section>

      <Container size="wide" id="all-tools" className="scroll-mt-20 pb-16 pt-4">
        <ToolExplorer filters={filters}>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {tools.map((t) => (
              <li key={t.slug} data-cats={categoriesOf(t)} className="min-w-0">
                <ToolLinkCard tool={t} />
              </li>
            ))}
            <li data-cats="productivity" className="min-w-0">
              <Link href="/notes" className="group flex h-full flex-col rounded-2xl border border-dashed border-brand/50 bg-brand-soft p-4 transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md sm:p-6">
                <span className="text-[0.9375rem] font-semibold text-brand-soft-fg sm:text-lg">Online Notes</span>
                <span className="mt-1.5 hidden text-sm leading-relaxed text-brand-soft-fg/80 sm:block">Private notes that save automatically in your browser. Pin, search and export.</span>
                <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-medium text-brand-soft-fg">Open notes <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
              </Link>
            </li>
          </ul>
        </ToolExplorer>
      </Container>

      <section className="border-y border-border bg-surface">
        <Container size="wide" className="py-12">
          <h2 className="sr-only">Why Expensico</h2>
          <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <b.icon aria-hidden className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-fg">{b.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{b.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Container size="wide" className="py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-fg">Guides</h2>
            <p className="mt-1 text-muted">Clear explanations behind the tools.</p>
          </div>
          <Link href="/guides" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
            All guides <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </div>
        <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {GUIDES.slice(0, 4).map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}`} className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-md">
                <span className="text-xs font-medium uppercase tracking-wide text-subtle">{g.readingMinutes} min read</span>
                <span className="mt-2 font-semibold leading-snug text-fg group-hover:text-brand">{g.title}</span>
                <span className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{g.description}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-center text-sm text-muted">
          Looking for something specific? Browse <Link href="/tools" className="font-medium text-brand hover:underline">all tools by category</Link> —{" "}
          {CATEGORIES.map((c, i) => (
            <span key={c.id}>
              <Link href={`/${c.path}`} className="hover:text-fg hover:underline">{c.shortName}</Link>
              {i < CATEGORIES.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>
      </Container>
    </>
  );
}

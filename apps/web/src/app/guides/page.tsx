import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { GUIDES, type GuideMeta } from "@/content/guides";
import { pageMetadata } from "@/lib/seo";
import { getTool, toolPath } from "@/registry/tools";

export const metadata = pageMetadata({
  title: "Guides — EMI, Salary, SIP, PDFs, Image Formats and More, Explained",
  description:
    "Practical, plain-English guides behind Expensico's tools: how EMI is calculated, CTC vs in-hand salary, SIP returns, reducing PDF size, JPG vs PNG vs WebP, CSV vs Excel, JWTs and private browser-based file processing.",
  path: "/guides",
});

const GROUPS: { id: GuideMeta["category"][]; title: string; intro: string }[] = [
  {
    id: ["finance"],
    title: "Money and personal finance",
    intro: "How loans, salaries and investments really work — with the formulas, worked examples in rupees, and the assumptions banks and employers don't always spell out.",
  },
  {
    id: ["pdf", "files"],
    title: "Files, PDFs and images",
    intro: "Choosing the right format, making files smaller without ruining them, and understanding what happens to your documents when you use an online tool.",
  },
  {
    id: ["developer", "productivity"],
    title: "Developers and everyday work",
    intro: "Clear explanations of the formats and standards developers handle every day, written to be useful whether you're learning or debugging.",
  },
];

function GuideCard({ g }: { g: GuideMeta }) {
  const tools = g.tools.map((s) => getTool(s)).filter((t) => t !== undefined);
  return (
    <li>
      <article className="flex h-full flex-col rounded-xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
        <span className="text-xs font-medium uppercase tracking-wide text-subtle">{g.readingMinutes} min read</span>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-fg">
          <Link href={`/guides/${g.slug}`} className="hover:text-brand">
            {g.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{g.description}</p>
        {tools.length > 0 && (
          <p className="mt-4 text-xs text-subtle">
            Related tools:{" "}
            {tools.map((t, i) => (
              <span key={t.slug}>
                {i > 0 && ", "}
                <Link href={toolPath(t)} className="text-brand hover:underline">
                  {t.title.replace(/\s+—.*$/, "")}
                </Link>
              </span>
            ))}
          </p>
        )}
      </article>
    </li>
  );
}

export default function GuidesIndex() {
  return (
    <Container className="pb-16 pt-5 sm:pt-6">
      <Breadcrumbs items={[{ name: "Guides", href: "/guides" }]} />
      <header className="mt-6 max-w-3xl">
        <h1 className="text-[2rem] font-semibold tracking-tight sm:text-4xl">Guides</h1>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">
          Clear, accurate explanations of the ideas behind our tools — so you understand the result, not just get it. Each guide answers the questions people actually ask, shows the maths or the
          mechanics with a worked example, and links to the tool that does the job.
        </p>
      </header>

      {GROUPS.map((group) => {
        const guides = GUIDES.filter((g) => group.id.includes(g.category));
        if (!guides.length) return null;
        return (
          <section key={group.title} className="mt-12" aria-labelledby={`g-${group.id[0]}`}>
            <h2 id={`g-${group.id[0]}`} className="text-xl font-semibold tracking-tight text-fg">
              {group.title}
            </h2>
            <p className="mt-2 max-w-3xl text-[0.9375rem] leading-relaxed text-muted">{group.intro}</p>
            <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {guides.map((g) => (
                <GuideCard key={g.slug} g={g} />
              ))}
            </ul>
          </section>
        );
      })}

      <section className="prose-ex mt-16 max-w-3xl border-t border-border pt-10">
        <h2 className="!mt-0">How our guides are written</h2>
        <p>
          Every guide is written to explain, not to sell. None is sponsored, and none recommends a particular bank, fund or product. We follow the same standards for each one:
        </p>
        <ul>
          <li>
            <strong>Show the working.</strong> Formulas are written out and every worked example is calculated in full, so you can check the numbers yourself.
          </li>
          <li>
            <strong>Use primary sources.</strong> Tax rates, contribution rates and limits come from official publications for the year stated in the guide.
          </li>
          <li>
            <strong>Be clear about limits.</strong> Where real-world results can differ — rounding, fees, changing rates or market risk — the guide says so.
          </li>
          <li>
            <strong>Keep them current.</strong> Guides show when they were published and last updated, and are revised when the rules or the tools change.
          </li>
        </ul>
        <p>
          Spotted something out of date or unclear? <Link href="/contact?topic=bug">Let us know</Link> and we&apos;ll check it. Looking for a topic we haven&apos;t covered?{" "}
          <Link href="/contact?topic=feature">Suggest a guide</Link>.
        </p>
      </section>
    </Container>
  );
}

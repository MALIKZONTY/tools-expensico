import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { processorConfig, site } from "@/config/site";
import { GUIDES } from "@/content/guides";
import { CONVERSIONS, isConversionAvailable } from "@/lib/convert/catalog";
import { pageMetadata } from "@/lib/seo";
import { CATEGORIES } from "@/registry/categories";
import { TOOLS, toolsInCategory } from "@/registry/tools";

export const metadata = pageMetadata({
  title: "About Expensico — Who We Are and How Our Tools Work",
  description:
    "Expensico is a free collection of online tools for PDFs, files, finance, notes and code, built by Antuparthi Manoha Malik Paul. Learn how the tools are built, checked and kept private.",
  path: "/about",
});

export default function About() {
  const converters = CONVERSIONS.filter(isConversionAvailable).length;
  const stats = [
    { value: `${TOOLS.length}`, label: "free tools" },
    { value: `${converters}`, label: "file conversions" },
    { value: `${CATEGORIES.length}`, label: "tool categories" },
    { value: `${GUIDES.length}`, label: "in-depth guides" },
  ];

  return (
    <Container size="narrow" className="pb-16 pt-5 sm:pt-6">
      <Breadcrumbs items={[{ name: "About", href: "/about" }]} />
      <article className="prose-ex mt-6">
        <h1 className="text-[2rem] font-semibold leading-tight tracking-tight text-fg">About Expensico</h1>
        <p className="text-lg">
          {site.name} is a free collection of online tools for the everyday jobs that shouldn&apos;t need special software: opening a file someone sent you, turning a PDF into images, checking what a
          loan will really cost, working out your in-hand salary, formatting some JSON, or jotting down a note. Our slogan sums it up — <em>{site.slogan}</em>
        </p>

        <ul className="not-prose my-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <li key={s.label} className="rounded-xl border border-border bg-surface p-4 text-center">
              <span className="block text-2xl font-bold tracking-tight text-fg">{s.value}</span>
              <span className="mt-1 block text-sm text-muted">{s.label}</span>
            </li>
          ))}
        </ul>

        <h2>Why Expensico exists</h2>
        <p>
          Many free tool websites make simple tasks harder than they should be. You search for &ldquo;PDF to JPG&rdquo;, land on a page covered in pop-ups, are asked to sign up, wait in a queue, upload a
          private document to a server you know nothing about, and sometimes get back a broken file with no explanation. Finance calculators often have the opposite problem: they give you a single
          number with no formula, no assumptions and no way to check it.
        </p>
        <p>
          Expensico is our answer to that. Every tool opens instantly, works without an account, explains what it does, and tells you honestly when a result is simplified. The name comes from the
          project&apos;s origins as an expense-tracking idea, which is why money tools — EMI, SIP, salary, GST, PF and budgeting calculators — remain a core part of the site.
        </p>

        <h2>Our principles</h2>
        <ul>
          <li>
            <strong>Your files stay with you.</strong>{" "}
            {processorConfig.enabled
              ? "Wherever it's technically possible, tools run entirely in your web browser, on your own device. When a tool genuinely needs a server, the page says so before anything is uploaded, and the file is deleted straight after processing."
              : "Every tool runs entirely in your web browser, on your own device — your files are never uploaded to us. If we ever add a tool that genuinely needs a server, the page will say so before anything is uploaded."}
          </li>
          <li>
            <strong>Honest results.</strong> We only offer conversions we can do reliably. Each converter is labelled <em>exact</em>, <em>high fidelity</em> or <em>basic</em>, so you know what to expect
            before you start. Calculators show their formulas and assumptions.
          </li>
          <li>
            <strong>No unnecessary steps.</strong> No accounts, no email capture, no artificial waiting, no watermarks.
          </li>
          <li>
            <strong>Useful explanations.</strong> Every tool page explains how it works, gives a worked example, lists its limitations and answers common questions.
          </li>
          <li>
            <strong>Works everywhere.</strong> Tools are designed for phones as well as desktops, support light and dark mode, and are built to be usable with a keyboard and screen reader.
          </li>
        </ul>

        <h2>What you&apos;ll find here</h2>
        <ul>
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <Link href={`/${c.path}`}>{c.name}</Link> — {toolsInCategory(c.id).length} tools. {c.description}
            </li>
          ))}
          <li>
            <Link href="/notes">Notes</Link> — private notes saved in your browser, with search, pinning and export.
          </li>
          <li>
            <Link href="/guides">Guides</Link> — longer explanations behind the tools, such as how EMI is calculated or why your in-hand salary is lower than your CTC.
          </li>
        </ul>

        <h2>Who runs Expensico</h2>
        <p>
          Expensico is built and run by <strong>{site.operator.name}</strong>, {site.operator.bio.charAt(0).toLowerCase() + site.operator.bio.slice(1)}. The site is an independent project: it is not
          owned by a bank, broker, software vendor or any other company whose products it might be expected to promote, and no tool is designed to steer you towards a particular financial product.
        </p>
        <p>
          Questions, bug reports, corrections and tool ideas are welcome — write to <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> or use the{" "}
          <Link href="/contact">contact page</Link>.
        </p>

        <h2>How our tools are built and checked</h2>
        <p>Accuracy matters more than the number of tools, so every tool goes through the same process before it is published:</p>
        <ol>
          <li>
            <strong>Formulas from published references.</strong> Finance calculators use the standard formulas banks and fund houses use (for example the reducing-balance EMI formula and quarterly
            compounding for fixed deposits). Rates and limits that change — income tax slabs, the EPF interest rate, GST rates — are taken from official sources for the year stated on the calculator.
          </li>
          <li>
            <strong>Automated tests.</strong> The calculation code is covered by automated tests that compare results with worked examples, so a change that breaks a formula is caught before it reaches
            the site.
          </li>
          <li>
            <strong>Real files.</strong> Converters and viewers are tested with real-world files, including awkward ones: multi-sheet workbooks, CSV files with quoted commas and leading zeros, large PDFs and
            images with transparency.
          </li>
          <li>
            <strong>Honest labels.</strong> If a conversion can&apos;t preserve everything — for example, PDF to Word extracts text and paragraphs but not exact layout — the page says so before you start.
          </li>
          <li>
            <strong>Every screen size.</strong> Pages are checked on widths from small phones to large desktop monitors, in light and dark mode.
          </li>
        </ol>

        <h2>How your privacy is protected</h2>
        <p>
          Most Expensico tools use modern browser technology to read and process files directly on your device. When you convert a PDF to JPG, for example, the pages are rendered by code running in
          your browser tab and the images are created there too — nothing is sent to us. That is why these tools work quickly, why there are no upload limits beyond your device&apos;s memory, and why we
          could not see your files even if we wanted to.
        </p>
        <p>
          There are no user accounts. Notes, to-do lists and saved calculator inputs are stored in your own browser. We don&apos;t set tracking cookies. The full details are in our{" "}
          <Link href="/privacy-policy">privacy policy</Link> and <Link href="/cookie-policy">cookie policy</Link>, and our guide on{" "}
          <Link href="/guides/browser-file-processing">how browser-based file processing works</Link> explains the technology in plain language.
        </p>

        <h2>What Expensico is not</h2>
        <ul>
          <li>
            <strong>Not financial advice.</strong> Calculators give estimates to help you understand and plan. Expensico is not a bank, adviser or tax professional — see the{" "}
            <Link href="/disclaimer">disclaimer</Link>.
          </li>
          <li>
            <strong>Not cloud storage.</strong> We don&apos;t keep copies of your files or notes. Export anything important.
          </li>
          <li>
            <strong>Not a replacement for specialist software</strong> when you need pixel-perfect document layouts or professional-grade editing. We&apos;ll tell you when a task is beyond what a browser tool
            can do well.
          </li>
        </ul>

        <h2>How Expensico is funded</h2>
        <p>
          Expensico is free to use. It may be supported by advertising. Ads are clearly labelled, are never placed inside tool controls or results, and never affect what a calculator tells you. Before
          any advertising is enabled, our privacy and cookie policies describe exactly what it involves.
        </p>

        <h2>Corrections and feedback</h2>
        <p>
          If you find a wrong result, an outdated rate or an unclear explanation, please <Link href="/contact?topic=bug">tell us</Link>. We investigate every report, fix confirmed errors, and update the
          affected tool or guide. Many of the tools on this site exist because someone asked for them — if there&apos;s something you need that isn&apos;t here, <Link href="/contact?topic=feature">suggest it</Link>.
        </p>
      </article>
    </Container>
  );
}

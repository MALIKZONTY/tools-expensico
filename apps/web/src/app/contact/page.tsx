import Link from "next/link";
import { Bug, Lightbulb, Mail, ShieldCheck, Briefcase } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { Alert } from "@/components/ui/alert";
import { JsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/config/site";
import { ContactForm } from "./ContactForm";

export const metadata = pageMetadata({
  title: "Contact Expensico — Report a Bug, Suggest a Tool or Ask About Privacy",
  description:
    "Contact Expensico to report a problem with a tool, suggest a new tool, correct an error, or ask about privacy. Learn what to include so we can help quickly.",
  path: "/contact",
});

const REASONS = [
  { icon: Bug, title: "Report a problem", body: "A tool gives a wrong result, a file won't open, or something looks broken on your device.", topic: "bug" },
  { icon: Lightbulb, title: "Suggest a tool or feature", body: "Tell us about a task you do often that Expensico could make easier.", topic: "feature" },
  { icon: ShieldCheck, title: "Privacy or data question", body: "Ask how your data is handled or make a request about personal data you've sent us.", topic: "privacy" },
  { icon: Briefcase, title: "Business enquiries", body: "Partnerships, advertising or other business questions about the website.", topic: "business" },
];

const FAQS = [
  {
    q: "Can you recover a file I converted or a note I wrote?",
    a: "No. Most tools process files in your browser, so your files never reach us, and notes are stored only in your own browser. If your browser data is cleared, we have no copy to restore. Export important notes regularly.",
  },
  {
    q: "Should I attach the file that didn't convert?",
    a: "Please don't send confidential files. Describe the file instead: its type, roughly how large it is, how it was created (for example 'exported from Excel' or 'scanned on a phone') and what went wrong. If the problem only happens with one file and it contains nothing sensitive, mention that and we may ask for a sample.",
  },
  {
    q: "Can you help with my loan, tax or investment decision?",
    a: "We can explain how a calculator works or fix a calculation error, but we can't give personal financial, tax, legal or investment advice. For decisions, please consult your bank, a registered adviser or a qualified tax professional.",
  },
  {
    q: "Do you accept guest posts or paid links?",
    a: "No. Guides on Expensico are written to explain the tools and are not sponsored. We don't sell links or publish paid articles.",
  },
  {
    q: "How quickly will I get a reply?",
    a: "We read every message and usually reply within a few working days. Reports of incorrect results are prioritised.",
  },
];

export default function ContactPage() {
  const formEnabled = site.contactFormEnabled;
  return (
    <Container size="narrow" className="pb-16 pt-5 sm:pt-6">
      <JsonLd data={faqJsonLd(FAQS)} />
      <Breadcrumbs items={[{ name: "Contact", href: "/contact" }]} />
      <h1 className="mt-6 text-[2rem] font-semibold tracking-tight">Contact us</h1>
      <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">
        Found a bug, need a tool we don&apos;t have, spotted an outdated rate, or have a question about how your data is handled? Send us a message — every message is read by the person who builds
        Expensico, {site.operator.name}. We usually reply within a few working days.
      </p>
      <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-surface p-3 pr-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- static export; the image is already sized */}
        <img src={site.operator.photo} alt="" width={48} height={48} className="size-12 shrink-0 rounded-full object-cover" />
        <p className="text-sm text-muted">
          <span className="font-semibold text-fg">{site.operator.name}</span> · reads and replies to every message personally.
        </p>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {REASONS.map((r) => (
          <li key={r.topic} className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-fg">
              <r.icon aria-hidden className="size-[18px]" />
            </span>
            <span>
              <span className="block font-semibold text-fg">{r.title}</span>
              <span className="mt-0.5 block text-sm leading-relaxed text-muted">{r.body}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        {formEnabled ? (
          <ContactForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
        ) : (
          <Alert tone="info" title="Email us">
            Write to{" "}
            <a className="font-medium underline" href={`mailto:${site.contactEmail}`}>
              {site.contactEmail}
            </a>
            . Please include the tool name and what you were trying to do.
          </Alert>
        )}
      </div>
      {formEnabled && (
        <p className="mt-6 flex items-center gap-2 text-sm text-muted">
          <Mail aria-hidden className="size-4" /> Prefer email? Write to{" "}
          <a className="font-medium text-brand underline" href={`mailto:${site.contactEmail}`}>
            {site.contactEmail}
          </a>
          .
        </p>
      )}

      <section className="prose-ex mt-12">
        <h2 className="!mt-0">How to write a helpful bug report</h2>
        <p>The more specific a report is, the faster we can reproduce and fix the problem. A good report includes:</p>
        <ol>
          <li>
            <strong>The tool and page</strong> — for example &ldquo;PDF to JPG&rdquo; or the page address.
          </li>
          <li>
            <strong>What you did</strong> — the steps, settings and options you chose.
          </li>
          <li>
            <strong>What you expected and what happened instead</strong> — including any error message, copied exactly.
          </li>
          <li>
            <strong>Your device and browser</strong> — for example &ldquo;Chrome on Windows 11&rdquo; or &ldquo;Safari on iPhone&rdquo;.
          </li>
          <li>
            <strong>For calculators, the inputs you used</strong> — the amount, rate and tenure, and the figure you were comparing against (for example your bank&apos;s EMI).
          </li>
        </ol>

        <h2>Corrections to rates and content</h2>
        <p>
          Tax slabs, interest rates and contribution limits change. If a calculator or guide uses a figure that has changed, tell us which tool, the figure shown, and where the current figure is
          published (for example an official notification). We check the source and update the tool.
        </p>

        <h2>Privacy requests</h2>
        <p>
          Because our tools don&apos;t send your files or saved data to us, the only personal data we usually hold is what you send in a message. You can ask us to access, correct or delete it. Choose
          &ldquo;Privacy or data question&rdquo; or email us, and see our <Link href="/privacy-policy">privacy policy</Link> for details.
        </p>

        <h2>Before you write</h2>
        <ul>
          <li>Each tool page has a &ldquo;Frequently asked questions&rdquo; section that may already answer your question.</li>
          <li>Calculator pages explain their formula and assumptions, which often explain small differences from a bank&apos;s figure.</li>
          <li>
            Our <Link href="/guides">guides</Link> cover common topics in depth, such as how EMI is calculated and why in-hand salary differs from CTC.
          </li>
        </ul>

        <h2>Frequently asked questions</h2>
        <div className="not-prose mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
          {FAQS.map((f) => (
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
    </Container>
  );
}

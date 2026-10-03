import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { JsonLd, pageMetadata, webAppJsonLd } from "@/lib/seo";
import { NotesMount } from "./NotesMount";

export const metadata = pageMetadata({
  title: "Online Notes — Free Notes That Save in Your Browser",
  description: "Write, pin, search and organise notes without an account. Notes save automatically in your browser, support Markdown and can be exported any time.",
  path: "/notes",
});

const FAQS = [
  { q: "Where are my notes stored?", a: "In your browser's IndexedDB storage on this device. They are never uploaded to Expensico's servers." },
  { q: "Will my notes sync to my phone?", a: "No. Notes stay in the browser where you wrote them. Use Export backup to save a file and Import backup to load it elsewhere." },
  { q: "Can I lose my notes?", a: "Clearing this site's data, uninstalling the browser or browsing privately removes them. Export a backup regularly if your notes are important." },
  { q: "Is Markdown supported?", a: "Yes. Use Preview to see headings, lists, links and tables rendered." },
];

export default function NotesPage() {
  return (
    <>
      <JsonLd data={webAppJsonLd({ name: "Expensico Notes", description: "Private online notes stored in your browser.", path: "/notes", category: "ProductivityApplication" })} />
      <Container className="pb-16 pt-5 sm:pt-6">
        <Breadcrumbs items={[{ name: "Notes", href: "/notes" }]} />
        <header className="mb-5 mt-5">
          <h1 className="text-[1.75rem] font-semibold tracking-tight sm:text-[2rem]">Notes</h1>
          <p className="mt-1 max-w-2xl text-muted">Quick, private notes. No signup — everything saves automatically in this browser.</p>
        </header>
        <NotesMount />
        <section className="prose-ex mt-14">
          <h2 className="!mt-0">How Expensico Notes works</h2>
          <p>
            Notes are saved to your browser&apos;s built-in database (IndexedDB) a moment after you stop typing, and they&apos;re there when you come back in the same browser. Pin important notes to keep them at the
            top, search across titles and text, and sort by last edited, date created or title. Deleted notes go to Trash first, so an accidental delete can be undone.
          </p>
          <p>
            Because notes never leave your device, they&apos;re private by default — but that also means there&apos;s no automatic cloud backup. Use <strong>Export backup</strong> to download all notes as a
            JSON file you can import later. For a single quick scratch page, try the <Link href="/productivity/notepad">online notepad</Link>.
          </p>
          <h2>Frequently asked questions</h2>
          {FAQS.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>
      </Container>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
    </>
  );
}

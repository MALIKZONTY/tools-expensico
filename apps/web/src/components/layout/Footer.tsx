import Link from "next/link";
import { site } from "@/config/site";
import { Logo } from "./Logo";

const COLUMNS = [
  {
    heading: "Tools",
    links: [
      { href: "/tools", label: "All tools" },
      { href: "/convert", label: "Convert" },
      { href: "/pdf", label: "PDF" },
      { href: "/finance", label: "Finance" },
      { href: "/productivity", label: "Productivity" },
      { href: "/developer", label: "Developer" },
    ],
  },
  {
    heading: "Popular",
    links: [
      { href: "/convert/pdf-to-jpg", label: "PDF to JPG" },
      { href: "/tools/image-compressor", label: "Image Compressor" },
      { href: "/finance/emi-calculator", label: "EMI Calculator" },
      { href: "/developer/json-formatter", label: "JSON Formatter" },
      { href: "/pdf/pdf-merge", label: "Merge PDF" },
      { href: "/notes", label: "Online Notes" },
    ],
  },
  {
    heading: "Expensico",
    links: [
      { href: "/about", label: "About" },
      { href: "/guides", label: "Guides" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms" },
      { href: "/disclaimer", label: "Disclaimer" },
      { href: "/cookie-policy", label: "Cookie Policy" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Link href="/" className="inline-flex rounded-md" aria-label="Expensico home">
              <Logo id="ft" slogan />
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted">{site.tagline}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">Most tools run in your browser, so your files stay on your device.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-4">
            {COLUMNS.map((col) => (
              <nav key={col.heading} aria-label={col.heading}>
                <h2 className="text-sm font-semibold text-fg">{col.heading}</h2>
                <ul className="mt-3 space-y-1">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="inline-block py-1 text-sm text-muted transition-colors hover:text-fg">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6">
          <p className="text-sm text-muted">
            © {year} {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ToolGrid } from "@/components/tool/ToolGrid";
import { popularTools } from "@/registry/tools";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <Container className="py-16 sm:py-24">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">We couldn&apos;t find that page</h1>
      <p className="mt-3 max-w-xl text-muted">The link may be broken or the page may have moved. Try searching for the tool you need, or start from one of these.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/" className="inline-flex h-11 items-center rounded-md bg-brand px-5 font-medium text-brand-fg hover:bg-brand-hover">Go to the homepage</Link>
        <Link href="/tools" className="inline-flex h-11 items-center rounded-md border border-border-strong px-5 font-medium hover:bg-surface-2">Browse all tools</Link>
      </div>
      <h2 className="mt-14 text-xl font-semibold">Popular tools</h2>
      <ToolGrid tools={popularTools().slice(0, 6)} className="mt-4" />
    </Container>
  );
}

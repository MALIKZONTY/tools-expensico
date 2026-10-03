import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo";

export interface Crumb {
  name: string;
  href: string;
}

/** Visible breadcrumb trail plus matching BreadcrumbList structured data. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ name: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
          {all.map((c, i) => {
            const last = i === all.length - 1;
            return (
              <li key={c.href} className="flex min-w-0 items-center gap-1">
                {last ? (
                  <span aria-current="page" className="truncate text-fg">
                    {c.name}
                  </span>
                ) : (
                  <>
                    <Link href={c.href} className="truncate rounded hover:text-fg hover:underline">
                      {c.name}
                    </Link>
                    <ChevronRight aria-hidden className="size-3.5 shrink-0 text-subtle" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(all)} />
    </>
  );
}

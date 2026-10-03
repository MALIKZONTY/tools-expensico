import type { ReactNode } from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { Container } from "./Container";
import { site } from "@/config/site";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

export function LegalPage({ title, path, intro, sections }: { title: string; path: string; intro: ReactNode; sections: LegalSection[] }) {
  const date = new Date(site.legalEffectiveDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return (
    <Container className="pb-16 pt-5 sm:pt-6">
      <Breadcrumbs items={[{ name: title, href: path }]} />
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-24">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">On this page</p>
            <ol className="mt-3 space-y-1.5 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-muted hover:text-fg">{s.title}</a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
        <article className="prose-ex">
          <h1 className="text-[2rem] font-semibold leading-tight tracking-tight text-fg">{title}</h1>
          <p className="!mt-2 text-sm">Effective {date}</p>
          {intro}
          {sections.map((s) => (
            <section key={s.id} id={s.id}>
              <h2>{s.title}</h2>
              {s.body}
            </section>
          ))}
        </article>
      </div>
    </Container>
  );
}

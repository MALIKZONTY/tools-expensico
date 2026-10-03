import type { Metadata } from "next";
import { absoluteUrl, site } from "@/config/site";

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  /** Use the title as-is without the " | Expensico" suffix. */
  absoluteTitle?: boolean;
  type?: "website" | "article";
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
}

/** Consistent metadata: unique title/description, canonical URL, Open Graph and Twitter card. */
export function pageMetadata({ title, description, path, absoluteTitle, type = "website", noIndex, publishedTime, modifiedTime }: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = absoluteTitle ? title : `${title} | ${site.name}`;
  // Page-level openGraph replaces the root's file-based image, so attach it explicitly.
  const image = { url: absoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: `${site.name} — ${site.slogan}` };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      title: fullTitle,
      description,
      siteName: site.name,
      locale: site.locale,
      images: [image],
      ...(type === "article" ? { publishedTime, modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image.url],
      ...(site.twitterHandle ? { site: site.twitterHandle } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

/**
 * Renders JSON-LD safely. `<` is escaped so data can never close the script tag.
 * See node_modules/next/dist/docs/01-app/02-guides/json-ld.md.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function webAppJsonLd(input: { name: string; description: string; path: string; category: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    applicationCategory: input.category,
    operatingSystem: "Any (runs in a web browser)",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
  };
}

export function articleJsonLd(input: { title: string; description: string; path: string; published: string; modified?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    datePublished: input.published,
    dateModified: input.modified ?? input.published,
    author: { "@type": "Person", name: site.operator.name, url: absoluteUrl("/about"), image: absoluteUrl(site.operator.photo) },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    mainEntityOfPage: absoluteUrl(input.path),
  };
}

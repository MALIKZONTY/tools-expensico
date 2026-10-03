/**
 * Site-wide configuration.
 *
 * Values marked OWNER-SUPPLIED must be provided by the site owner (via environment
 * variables) before launch. Until then they render as clearly bracketed placeholders so
 * nothing is invented. `scripts/check-launch-config.mjs` lists anything still missing.
 */

function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

export const site = {
  name: "Expensico",
  domain: "expensico.com",
  url: (env("NEXT_PUBLIC_SITE_URL") ?? "https://expensico.com").replace(/\/$/, ""),
  /** Brand slogan, shown with the logo. */
  slogan: "Everyday tools, made simple.",
  tagline: "Free online tools for files, finance, productivity and everyday work.",
  description:
    "Expensico is a free collection of online tools: convert and view files, work with PDFs, calculate EMIs and returns, format JSON, take notes and more. Most tools run entirely in your browser.",
  locale: "en_IN",
  twitterHandle: env("NEXT_PUBLIC_TWITTER_HANDLE"),

  /** The person who operates the website (env vars override these defaults). */
  operator: {
    name: env("NEXT_PUBLIC_OPERATOR_NAME") ?? "Antuparthi Manoha Malik Paul",
    bio: "A B.Tech graduate and software professional",
    country: env("NEXT_PUBLIC_OPERATOR_COUNTRY") ?? "[Country of operation]",
    jurisdiction: env("NEXT_PUBLIC_LEGAL_JURISDICTION") ?? "[Governing law / jurisdiction]",
  },

  /** Public contact address shown on the contact and legal pages; also receives contact-form messages. */
  contactEmail: env("NEXT_PUBLIC_CONTACT_EMAIL") ?? "malikantuparthi@gmail.com",
  hasContactEmail: true,

  /** Date the current legal documents took effect (ISO). Update when you change them. */
  legalEffectiveDate: env("NEXT_PUBLIC_LEGAL_EFFECTIVE_DATE") ?? "2026-10-03",
} as const;

export const processorConfig = {
  /** Base URL of the processor service (services/processor). Unset = server conversions disabled. */
  url: env("NEXT_PUBLIC_PROCESSOR_URL")?.replace(/\/$/, ""),
  get enabled() {
    return Boolean(this.url);
  },
};

export const analyticsConfig = {
  provider: env("NEXT_PUBLIC_ANALYTICS_PROVIDER") as "plausible" | "umami" | undefined,
  /** Plausible: the site domain. Umami: the website ID. */
  siteId: env("NEXT_PUBLIC_ANALYTICS_SITE_ID"),
  /** Script URL (self-hosted Plausible/Umami or their cloud). */
  scriptUrl: env("NEXT_PUBLIC_ANALYTICS_SCRIPT_URL"),
};

export const adsConfig = {
  /** AdSense publisher ID, e.g. ca-pub-XXXXXXXXXXXXXXXX. Unset = no ads anywhere. */
  client: env("NEXT_PUBLIC_ADSENSE_CLIENT"),
  get enabled() {
    return Boolean(this.client);
  },
};

export function absoluteUrl(path = "/"): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

// Security headers and fixed redirects, served by next.config.ts. Plain .mjs with no imports.

function origin(url) {
  try {
    return url ? new URL(url).origin : null;
  } catch {
    return null;
  }
}

// Cloudflare Web Analytics beacon (AnalyticsScript.tsx), loaded when NEXT_PUBLIC_CF_ANALYTICS_TOKEN is set.
const CF_INSIGHTS_SCRIPT = "https://static.cloudflareinsights.com";
const CF_INSIGHTS_REPORT = "https://cloudflareinsights.com";

const ADS = [
  "https://pagead2.googlesyndication.com",
  "https://*.googlesyndication.com",
  "https://*.doubleclick.net",
  "https://*.google.com",
  "https://*.gstatic.com",
  "https://adservice.google.com",
  "https://*.adtrafficquality.google",
  "https://*.googleadservices.com",
  "https://*.googletagservices.com",
];

/**
 * Content Security Policy. Pages are static files, so per-request nonces aren't available;
 * 'unsafe-inline' scripts are allowed for Next's inline bootstrap and the theme script (see
 * node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md). Everything else is
 * locked down. 'wasm-unsafe-eval' is required by pdf.js image decoders.
 */
export function securityHeaders({ dev = false, env = process.env } = {}) {
  const processorOrigin = origin(env.NEXT_PUBLIC_PROCESSOR_URL);
  const analyticsOrigin = origin(env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL) ?? (env.NEXT_PUBLIC_ANALYTICS_PROVIDER === "plausible" ? "https://plausible.io" : null);
  const ads = env.NEXT_PUBLIC_ADSENSE_CLIENT ? ADS : [];
  const cfInsights = env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN?.trim() ? [CF_INSIGHTS_SCRIPT, CF_INSIGHTS_REPORT] : [];
  const turnstile = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? "https://challenges.cloudflare.com" : null;

  const csp = [
    "default-src 'self'",
    ["script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'", dev && "'unsafe-eval'", analyticsOrigin, cfInsights[0], turnstile, ...ads].filter(Boolean).join(" "),
    // https: allows remote images/styles inside the user-controlled HTML preview (off by default there).
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    ["connect-src 'self'", processorOrigin, analyticsOrigin, cfInsights[1], ...ads, dev && "ws:"].filter(Boolean).join(" "),
    "worker-src 'self' blob:",
    ["frame-src 'self'", turnstile, ...ads].filter(Boolean).join(" "),
    "media-src 'self' data: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // No upgrade-insecure-requests: every resource is same-origin and HSTS already forces HTTPS.
  ]
    .filter(Boolean)
    .join("; ");

  return [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()" },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ];
}

/** Fixed redirects; tool alias redirects come from the registry (toolRedirects in src/registry/tools.ts). */
export const STATIC_REDIRECTS = [
  { source: "/privacy", destination: "/privacy-policy" },
  { source: "/terms-of-service", destination: "/terms" },
  // URLs from the previous app on this domain that Google had indexed (Search Console, Oct 2026).
  { source: "/terms-and-conditions", destination: "/terms" },
  { source: "/blog", destination: "/guides" },
  { source: "/blog/*", destination: "/guides" },
  { source: "/faq", destination: "/contact" },
];

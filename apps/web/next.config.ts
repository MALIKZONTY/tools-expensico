import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

function origin(url?: string): string | null {
  try {
    return url ? new URL(url).origin : null;
  } catch {
    return null;
  }
}

const processorOrigin = origin(process.env.NEXT_PUBLIC_PROCESSOR_URL);
const analyticsOrigin = origin(process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL) ?? (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER === "plausible" ? "https://plausible.io" : null);
const adsEnabled = Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT);
const turnstile = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? "https://challenges.cloudflare.com" : null;
const ADS = ["https://pagead2.googlesyndication.com", "https://*.googlesyndication.com", "https://*.doubleclick.net", "https://*.google.com", "https://*.gstatic.com", "https://adservice.google.com", "https://*.adtrafficquality.google"];

/**
 * Content Security Policy. Pages are statically generated, so per-request nonces aren't
 * available; 'unsafe-inline' scripts are allowed for Next's inline bootstrap and the theme
 * script (see node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md).
 * Everything else is locked down. 'wasm-unsafe-eval' is required by pdf.js image decoders.
 */
const csp = [
  "default-src 'self'",
  ["script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'", isDev && "'unsafe-eval'", analyticsOrigin, turnstile, ...(adsEnabled ? ADS : [])].filter(Boolean).join(" "),
  // https: allows remote images/styles inside the user-controlled HTML preview (off by default there).
  "style-src 'self' 'unsafe-inline' https:",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  ["connect-src 'self'", processorOrigin, analyticsOrigin, ...(adsEnabled ? ADS : []), isDev && "ws:"].filter(Boolean).join(" "),
  "worker-src 'self' blob:",
  ["frame-src 'self'", turnstile, ...(adsEnabled ? ADS : [])].filter(Boolean).join(" "),
  "media-src 'self' data: blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  !isDev && "upgrade-insecure-requests",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@expensico/processing-contract"],
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/pdfjs/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
    ];
  },
  async redirects() {
    // Alternative tool URLs (alsoIn categories and aliases) are redirected by the tool
    // routes themselves (see components/tool/route-factory.tsx), driven by the registry.
    return [
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
      { source: "/terms-of-service", destination: "/terms", permanent: true },
    ];
  },
};

export default nextConfig;

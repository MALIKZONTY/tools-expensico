import type { NextConfig } from "next";
import { toolRedirects } from "./src/registry/tools";
import { STATIC_REDIRECTS, securityHeaders } from "./security-headers.mjs";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Hosted on Vercel. Every page is prerendered at build time; only /api/* runs per request.
 * Security headers and 301s (fixed ones plus tool aliases from the registry) are served by Next.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@expensico/processing-contract"],
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders({ dev: isDev }) },
      { source: "/pdfjs/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
      { source: "/icons/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
    ];
  },
  async redirects() {
    // STATIC_REDIRECTS use `_redirects` syntax; Next.js spells a trailing wildcard `:path*`.
    return [...STATIC_REDIRECTS, ...toolRedirects()].map((r) => ({ ...r, source: r.source.replace(/\/\*$/, "/:path*"), statusCode: 301 as const }));
  },
};

export default nextConfig;

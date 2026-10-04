import type { NextConfig } from "next";
import { STATIC_REDIRECTS, securityHeaders } from "./security-headers.mjs";

const isDev = process.env.NODE_ENV !== "production";

/**
 * The site is a static export served from Cloudflare Workers static assets (`out/`). Static
 * export can't send headers or redirects, so for production they're written to Cloudflare's
 * `_headers` / `_redirects` files by scripts/cloudflare-files.mjs; here they apply only to
 * `next dev`, so development behaves like production.
 */
const nextConfig: NextConfig = {
  output: "export",
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@expensico/processing-contract"],
  ...(isDev && {
    async headers() {
      return [{ source: "/:path*", headers: securityHeaders({ dev: true }) }];
    },
    async redirects() {
      // Sources use Cloudflare's `_redirects` syntax; Next.js spells a trailing wildcard `:path*`.
      return STATIC_REDIRECTS.map((r) => ({ ...r, source: r.source.replace(/\/\*$/, "/:path*"), permanent: true }));
    },
  }),
};

export default nextConfig;

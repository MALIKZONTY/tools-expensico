# Expensico web app

Next.js 16 (App Router) site, exported as static files and served from Cloudflare Workers.

```bash
pnpm dev          # development server on http://localhost:3000
pnpm build        # static export to out/ (+ _headers, _redirects, ads.txt)
pnpm preview      # serve out/ with Cloudflare's runtime (wrangler dev) on http://localhost:8787
pnpm test         # unit tests (Vitest)
pnpm test:e2e     # browser tests against out/ via wrangler (run `pnpm build` first)
pnpm deploy       # wrangler deploy (normally done by Cloudflare Workers Builds from GitHub)
```

See [`docs/DEPLOYMENT.md`](../../docs/DEPLOYMENT.md) and [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md).

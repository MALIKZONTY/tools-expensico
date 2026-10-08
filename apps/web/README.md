# Expensico web app

Next.js 16 (App Router) site on Vercel. Every page is prerendered; only `/api/*` runs per request.

```bash
pnpm dev          # development server on http://localhost:3000
pnpm build        # production build (+ public/ads.txt when AdSense is configured)
pnpm start        # serve the production build on http://localhost:3000
pnpm test         # unit tests (Vitest)
pnpm test:e2e     # browser tests against the production build on :3100 (run `pnpm build` first)
```

Deploys happen on push via Vercel's GitHub integration.

See [`docs/DEPLOYMENT.md`](../../docs/DEPLOYMENT.md) and [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md).

# Expensico

Free online tools for files, finance, productivity and everyday work — **expensico.com**.

- **112 tools**: file viewers and utilities, PDF tools, 34 converters, 17 India-first finance calculators,
  developer tools and productivity tools, plus private browser-based **Notes** and 8 guides.
- **Private by default**: files are processed in the browser. The only server-side conversions
  (Office → PDF, Ghostscript compression) are clearly labelled, opt-in, and disabled until a
  processor service is configured.
- **Honest**: a capability matrix drives every conversion; each is labelled exact, high fidelity or basic.

| Path | What it is |
| --- | --- |
| `apps/web` | Next.js 16 site (Vercel) |
| `services/processor` | Fastify + LibreOffice + Ghostscript worker (Docker, Render) |
| `packages/processing-contract` | Shared types, limits and HMAC job tokens |
| `docs/` | [Architecture](docs/ARCHITECTURE.md) · [Deployment](docs/DEPLOYMENT.md) |

## Getting started

Requires Node 22.18+ and pnpm.

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local   # optional for local dev
pnpm dev                                        # http://localhost:3000
```

## Quality checks

```bash
pnpm --filter web typecheck
pnpm --filter web lint
pnpm test                       # unit tests: web (Vitest), contract + processor (node:test)
pnpm --filter web build
pnpm test:e2e                   # Playwright: workflows + no-overflow checks at 320–1440px
pnpm check:launch               # lists owner details still missing before launch
```

## Adding a tool

1. Add metadata to `apps/web/src/registry/tools.ts` (slug, category, title, unique description,
   keywords, icon, processing mode, related tools).
2. Create `apps/web/src/tools/<slug>/Tool.tsx` (client UI) and `content.tsx` (how-to, explanation, FAQs).
   Put logic in `src/lib/…` with unit tests.
3. Register the UI in `src/registry/components.tsx` and the content in `src/registry/content.ts`.

`src/registry/registry.test.ts` fails if any tool lacks UI or content, has a duplicate slug,
broken related links or an over-long description. Routes, metadata, JSON-LD, the sitemap and
search pick the tool up automatically.

**Adding a converter** only needs a `ConversionDef` in `src/lib/convert/catalog.ts` (with
hand-written content) and, if it's a new kind of conversion, a browser implementation in
`src/lib/convert/impl/` registered in `src/lib/processing/browser-engine.ts`.

## Owner-supplied details

Nothing about the operator is invented. Legal pages show bracketed placeholders such as
`[Operator legal name]` until you set the `NEXT_PUBLIC_OPERATOR_*`, `NEXT_PUBLIC_CONTACT_EMAIL` and
`NEXT_PUBLIC_LEGAL_*` variables. Run `pnpm check:launch` to see what's left. Have the legal pages
reviewed by a professional before launch.

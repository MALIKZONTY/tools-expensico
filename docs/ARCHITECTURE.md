# Expensico — Architecture

This document records the technical decisions behind expensico.com and the reasons for them.
It is the reference for anyone adding a tool, a converter or an infrastructure component.

## 1. Confirmed product decisions

| Decision | Choice |
| --- | --- |
| Frontend hosting | Cloudflare Workers: Next.js static export (`out/`) on static assets; a small Worker for `/api/*` only |
| File processing | Hybrid: browser first; heavy conversions on a separate Docker service (Render-ready) |
| Finance locale | India-first (₹, lakh/crore grouping, EPF, GST, Indian income tax) |
| Analytics | Cookieless (Plausible or Umami), behind a provider-neutral `track()` |
| Accounts | None. Notes, to-dos and preferences live in the browser |

## 2. Repository layout

```text
expensico/
├── apps/web/                      Next.js 16 app (App Router, TypeScript, Tailwind v4)
├── services/processor/            Fastify + LibreOffice/Ghostscript worker (Docker, Render)
├── packages/processing-contract/  Shared types, limits and HMAC job tokens (no runtime deps)
└── docs/                          Architecture, deployment and content guidelines
```

`apps/web/src`:

```text
app/                 Routes only. Each tool category has a thin [slug] route built by a factory.
components/ui/       Design-system primitives (Button, Input, Card, Tabs, Dialog, Toast, ...)
components/layout/   Header, footer, navigation, search palette, breadcrumbs, theme toggle
components/tool/     Tool framework: ToolPage template, FileDropzone, ResultPanel, DownloadBar ...
config/site.ts       Brand, URLs and owner-supplied business details (placeholders until set)
registry/            Tool + category metadata (light, safe to import anywhere)
                     components.ts → client map slug → lazy UI
                     content.ts    → server map slug → long-form content
tools/<slug>/        One folder per tool: UI, logic, tests, content
lib/convert/         Format detection, capability matrix and converter implementations
lib/processing/      ProcessingEngine interface: browser engine + remote (processor) engine
lib/finance/         Pure, tested financial formulas
lib/notes/           NotesRepository interface + IndexedDB (Dexie) implementation
lib/analytics/       track() with pluggable cookieless provider
content/guides/      Long-form guides
```

## 3. Tool framework

```text
registry/tools.ts (metadata) ─┬─► routes (generateStaticParams, metadata, JSON-LD, breadcrumbs)
                              ├─► search index (command palette, homepage search)
                              ├─► sitemap.xml, category pages, related-tool links
                              ├─► registry/components.ts → lazy client UI chunk per tool
                              └─► registry/content.ts    → server-rendered explanatory content
```

Adding a tool:
1. Add metadata to `registry/tools.ts` (slug, category, title, description, keywords, processing mode, related).
2. Create `tools/<slug>/Tool.tsx` (UI) plus logic and tests.
3. Create `tools/<slug>/content.tsx` (how it works, example, FAQ).
4. Register the lazy UI in `registry/components.ts` and content in `registry/content.ts`.

`registry.test.ts` fails the build if a live tool has no UI, no content, a duplicate slug or a
broken related link, so step 4 can't be forgotten.

Adding a **converter** is lighter: add a `ConverterDefinition` to `lib/convert/converters.ts`
(from, to, engine, quality, hand-written notes and FAQ, lazy `run`). The landing page
`/convert/<from>-to-<to>`, the universal converter's target list and the sitemap entry are
derived from it automatically.

## 4. File processing

```text
Tool UI ──► runConversion(converter, files, options)
              │
              ├─ engine: "browser" ─► lazy-imported implementation (pdf.js, pdf-lib, SheetJS,
              │                        mammoth, canvas). Files never leave the device.
              │
              └─ engine: "server"  ─► RemoteProcessingEngine
                                       1. POST /api/processing-token (Worker, src/worker.ts) → short-lived HMAC token
                                       2. POST {PROCESSOR_URL}/v1/process (multipart, direct to Render)
                                       3. processor validates, converts in a per-job temp dir, deletes it
```

Rules:
- **Capability matrix is the source of truth.** The UI only offers conversions that exist in
  `converters.ts`. Server conversions are shown as "Coming soon" unless `NEXT_PUBLIC_PROCESSOR_URL`
  is configured at build time; no landing page is generated for unavailable conversions.
- Every result carries a `quality` label: `exact` (lossless/structural), `high`, or `basic`
  (for example PDF → DOCX extracts text only). The label is shown to users.
- Each tool states honestly whether files are uploaded. The badge is derived from the converter's
  engine, not hand-written.
- Heavy libraries are only imported inside the handler that needs them, so a percentage
  calculator never downloads pdf.js.
- Uploads go **directly** from the browser to the processor (serverless request bodies are capped
  at ~4.5 MB). The token route keeps the processor from being an open conversion API.

## 5. Processor service (services/processor)

- Fastify, `@fastify/multipart`, `@fastify/rate-limit`, CORS allowlist.
- Validation: size limit, extension allowlist, magic-byte check, filename sanitising, HMAC token.
- Each job gets its own `mkdtemp` directory, and LibreOffice gets a separate user profile. The
  binaries are run with `execFile` (no shell) under a timeout. The directory is removed in `finally`,
  and a sweeper deletes anything older than 15 minutes.
- Uploaded files are never executed, and macros are disabled.
- Docker image: Debian slim + LibreOffice (writer, calc, impress) + Ghostscript + fonts. A `render.yaml` is provided.

## 6. Storage

| Data | Where | Why |
| --- | --- | --- |
| Notes | IndexedDB (Dexie) via `NotesRepository` | Large text, survives reloads, sync-ready schema (`updatedAt`, `deletedAt`, `rev`) |
| To-dos, checklists, notepad, Markdown draft | IndexedDB key/value store (`useKv`) | Same durability guarantees |
| Calculator inputs, theme | localStorage (`useStoredState`, `ex:` prefix; `ex-theme`) | Tiny, synced across tabs |
| Cookies | None set by Expensico | Cookieless analytics; AdSense would change this (see legal pages) |

Cloud sync later: add a `RemoteNotesRepository` and a sync engine that reconciles on `rev` +
`updatedAt`; soft deletes (`deletedAt`) already exist so deletions can propagate.

## 7. SEO

- Static generation for every tool, converter, category, guide and legal page.
- `generateMetadata` per route: unique title/description, canonical, Open Graph, Twitter card.
- JSON-LD: `WebApplication` for tools, `FAQPage` where FAQs exist, `BreadcrumbList` everywhere,
  `Article` for guides, `Organization`/`WebSite` + `SearchAction` on the homepage.
- `sitemap.xml` and `robots.txt` generated from the registry.
- One canonical URL per tool. A tool listed in several categories (e.g. JSON Formatter) appears
  on each category page but always links to its canonical URL. Alternative URLs (other categories,
  legacy aliases) are statically generated by the tool route and answer with a 308 redirect
  (`components/tool/route-factory.tsx`). They are not in `next.config.ts` because Next 16's
  config loader mis-resolves path aliases in nested imports.

## 8. Security

- Strict security headers via `next.config.ts` (CSP, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`, `frame-ancestors`).
- User content rendered as HTML (Markdown preview, HTML viewer, DOCX preview) is sanitised with
  DOMPurify, and HTML previews render in a sandboxed `iframe` without scripts.
- Contact form: zod validation, honeypot, minimum fill time, per-IP rate limit, optional
  Cloudflare Turnstile. Delivery via Resend when configured.

## 9. Analytics and ads

- `track(event, props)` is a no-op unless a provider is configured (`NEXT_PUBLIC_ANALYTICS_PROVIDER`).
  Events: `tool_opened`, `conversion_started`, `conversion_completed`, `tool_error`, `search`.
  No file names, file contents, note text or personal data are sent.
- `<AdSlot>` renders nothing until `NEXT_PUBLIC_ADSENSE_CLIENT` is set. Slots are placed only
  outside tool interfaces (after results / within long-form content / sidebar on wide screens),
  labelled "Advertisement", and reserve their height to avoid layout shift. Enabling AdSense requires
  a Google-certified consent platform for EEA/UK visitors and updating the privacy & cookie policies.

## 10. Testing

- Vitest: finance formulas (against worked examples from published references), parsers,
  format detection, converters (Node-compatible ones), registry integrity, processor validation.
- Playwright: smoke tests for key workflows and responsive checks at 320 / 375 / 390 / 430 / 768 /
  1024 / 1440 px (no horizontal overflow, header usable, tool usable).

## 11. Hosting (Cloudflare Workers)

- `next build` produces a static export in `out/` (`output: "export"`). Every page, the sitemap,
  robots.txt, the search index and the Open Graph image are files; no server rendering happens
  at request time, so the Workers Free plan's 10 ms CPU limit never applies to pages.
- `scripts/cloudflare-files.mjs` (postbuild) writes `out/_headers` (security headers from
  `security-headers.mjs`), `out/_redirects` (301s for tool aliases from the registry) and
  `out/ads.txt` (only when `NEXT_PUBLIC_ADSENSE_CLIENT` is set).
- `src/worker.ts` runs only for `/api/*` (`run_worker_first`): the contact form and processor
  tokens (`src/server/api/*`). Everything else is served straight from static assets.
- OpenNext was evaluated and rejected: with @opennextjs/cloudflare 1.20.7 and Next 16.3 every
  page missed the incremental cache and was server-rendered per request (over the free CPU limit).

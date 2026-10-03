# Deployment

## 1. Web app → Vercel

1. Import the repository in Vercel and set **Root Directory** to `apps/web` (framework: Next.js).
   The install command runs at the monorepo root automatically (pnpm workspace).
2. Add environment variables from `apps/web/.env.example`. At minimum:
   `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_OPERATOR_COUNTRY`, `NEXT_PUBLIC_LEGAL_JURISDICTION` and
   `NEXT_PUBLIC_LEGAL_EFFECTIVE_DATE`. The operator name and contact email are built into
   `src/config/site.ts`; set `NEXT_PUBLIC_OPERATOR_NAME` / `NEXT_PUBLIC_CONTACT_EMAIL` only to override them.
   The repo pins pnpm 12 via `packageManager`; if the install step uses a different pnpm, add the
   environment variable `ENABLE_EXPERIMENTAL_COREPACK=1` so Vercel uses the pinned version.
3. Add `expensico.com` and `www.expensico.com` as domains; redirect `www` to the apex (or vice versa)
   so there is one canonical host matching `NEXT_PUBLIC_SITE_URL`.
4. Deploy. `NEXT_PUBLIC_*` values are compiled in, so redeploy after changing them.

`prebuild` copies pdf.js assets into `public/pdfjs`; they're served from your own domain.

### Contact form
Create a [Resend](https://resend.com) account, verify `expensico.com` as a sending domain, then set
`RESEND_API_KEY` and `CONTACT_FROM_EMAIL`. Messages go to the site contact email
(`malikantuparthi@gmail.com`, set in `src/config/site.ts`) unless `CONTACT_TO_EMAIL` overrides it.
Until both are set the form is hidden and the page shows the contact email instead. Optionally add Cloudflare Turnstile keys.
The built-in rate limiter is per server instance; add a shared store (e.g. Upstash) if you see abuse.

### Analytics (cookieless)
Set `NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible` and `NEXT_PUBLIC_ANALYTICS_SITE_ID=expensico.com`
(or `umami` with a website ID and script URL). The CSP and privacy/cookie policies update
automatically. Events: `tool_opened`, `conversion_started`, `conversion_completed`, `tool_error`,
`search`, `search_selected` — no file names, contents or personal data.

## 2. Processor → Render (optional)

Enables Word/Excel/PowerPoint → PDF and server-side PDF compression.

1. Generate a secret: `openssl rand -base64 48`.
2. In Render, create a Blueprint from `render.yaml` (Docker, built from the repo root). Use a plan
   with at least 1 GB RAM — LibreOffice won't run on the free tier. Set `PROCESSOR_SHARED_SECRET`
   and `ALLOWED_ORIGINS`.
3. On Vercel set `NEXT_PUBLIC_PROCESSOR_URL` (the Render URL) and the same `PROCESSOR_SHARED_SECRET`,
   then redeploy. The server conversions and their landing pages (`/convert/docx-to-pdf`, …)
   appear only now, and the privacy policy switches to describing them.

Security model: the browser gets a 5-minute HMAC token for one operation from
`/api/processing-token` (rate-limited, same-origin only) and uploads directly to the processor.
The processor checks CORS, the token, extension allowlist and magic bytes; runs LibreOffice with
macros disabled and a fresh profile, or Ghostscript with `-dSAFER`, via `execFile` (no shell) with
a timeout; deletes the job folder in `finally`; and sweeps anything older than 15 minutes.

Test the image locally once Docker is available:

```bash
docker build -f services/processor/Dockerfile -t expensico-processor .
docker run --rm -p 8080:8080 -e PROCESSOR_SHARED_SECRET=$(openssl rand -base64 48) \
  -e ALLOWED_ORIGINS=http://localhost:3000 expensico-processor
```

## 3. Advertising (later)

`<AdSlot>` components render nothing until `NEXT_PUBLIC_ADSENSE_CLIENT` is set; slot IDs must be
passed where slots are placed (after the tool, inside guides). Before enabling AdSense:

- Integrate a Google-certified consent management platform (required for EEA/UK/Switzerland).
- Review the privacy and cookie policies (they switch automatically to describe AdSense, but
  confirm the wording with your adviser).
- Only legitimate human traffic: no incentivised clicks, bots or traffic exchanges.

## 4. Before launch checklist

- [ ] `pnpm check:launch` reports no required items.
- [ ] Legal pages reviewed by a professional for your jurisdiction.
- [ ] Search Console: verify the domain and submit `https://expensico.com/sitemap.xml`.
- [ ] Spot-check finance calculators against your bank's figures for the current year's rates.
- [ ] Update `src/lib/finance/india-tax-rules.ts` after each Union Budget and EPF rate announcement.

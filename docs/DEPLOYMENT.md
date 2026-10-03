# Deployment

## 1. Web app → Cloudflare Workers (free plan, ads allowed)

The site is a static export (`apps/web/out`) served by Workers static assets, plus a tiny Worker
for `/api/*`. See ARCHITECTURE.md §11.

### One-time: put the domain on Cloudflare
1. dash.cloudflare.com → **Add a domain** → `expensico.com` → **Free** plan.
2. At your registrar, replace the nameservers with the two Cloudflare gives you. Wait until the
   domain shows **Active** (minutes to a few hours).

### Create the Worker from GitHub (Workers Builds)
1. **Workers & Pages** → **Create** → **Import a repository** → choose `tools-expensico`.
2. **Project name:** `expensico` (must match `name` in `apps/web/wrangler.jsonc`).
3. **Build settings:**
   - Root directory: `apps/web`
   - Build command: `pnpm build`
   - Deploy command: `npx wrangler deploy`
4. **Build variables** (used at build time, compiled into the pages):

   | Variable | Value |
   | --- | --- |
   | `PNPM_VERSION` | `12.3.4` (the build image defaults to pnpm 10) |
   | `NEXT_PUBLIC_SITE_URL` | `https://expensico.com` |
   | `NEXT_PUBLIC_OPERATOR_COUNTRY` | e.g. `India` |
   | `NEXT_PUBLIC_LEGAL_JURISDICTION` | e.g. `India, with courts in <city>` |
   | `NEXT_PUBLIC_LEGAL_EFFECTIVE_DATE` | launch date, `YYYY-MM-DD` |
   | `NEXT_PUBLIC_ADSENSE_CLIENT` | `ca-pub-…` once AdSense approves the site (also generates `ads.txt`) |

   The operator name and contact email default to `src/config/site.ts`. Changing a build variable
   needs a new deployment (Deployments → Retry, or push a commit).
5. **Deploy.** The site appears at `expensico.<account>.workers.dev`.

### Connect the domain
1. Worker **expensico** → **Settings → Domains & Routes → Add → Custom domain**: `expensico.com`,
   then again for `www.expensico.com`.
2. **Rules → Redirect Rules → Create from template → "Redirect from WWW to root"** (301), so
   `NEXT_PUBLIC_SITE_URL` is the one canonical host.
3. Leave **Bot Fight Mode** off and never use "I'm Under Attack" mode for normal traffic; Googlebot
   and the AdSense crawler must be able to fetch every page.

### Local check before deploying
`pnpm build && pnpm preview` serves `out/` with Cloudflare's runtime on http://localhost:8787,
including `_headers`, `_redirects` and the `/api` Worker. `pnpm test:e2e` runs the browser tests
against the same setup.

### Contact form
Create a [Resend](https://resend.com) account and verify `expensico.com` as a sending domain. Add
`RESEND_API_KEY` and `CONTACT_FROM_EMAIL` as **Worker secrets** (Worker → Settings → Variables &
Secrets), then set the build variable `NEXT_PUBLIC_CONTACT_FORM=true` and redeploy. Messages go to the site contact email
(`malikantuparthi@gmail.com`, set in `src/config/site.ts`) unless `CONTACT_TO_EMAIL` overrides it.
Until then the form is hidden and the page shows the contact email instead. Optionally add Cloudflare Turnstile keys.
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
3. In Cloudflare set the build variable `NEXT_PUBLIC_PROCESSOR_URL` (the processor URL) and the
   Worker secret `PROCESSOR_SHARED_SECRET` (same value), then redeploy. The server conversions and their landing pages (`/convert/docx-to-pdf`, …)
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

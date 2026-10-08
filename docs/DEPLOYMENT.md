# Deployment

## 1. Web app → Vercel

Every page is prerendered at build time; only `/api/*` (contact form, processor tokens) runs as
functions. See ARCHITECTURE.md §11.

### Create the project
1. vercel.com → **Add New → Project** → import `tools-expensico` from GitHub.
2. **Root Directory:** `apps/web`. Framework preset: **Next.js** (detected). Leave the build
   command and output directory at their defaults; Vercel reads pnpm's version from `packageManager`.
3. **Environment Variables** (Production and Preview). `NEXT_PUBLIC_*` values are compiled into the
   pages, so changing one needs a redeploy:

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | `https://expensico.com` |
   | `NEXT_PUBLIC_OPERATOR_COUNTRY` | e.g. `India` |
   | `NEXT_PUBLIC_LEGAL_JURISDICTION` | e.g. `India, with courts in <city>` |
   | `NEXT_PUBLIC_LEGAL_EFFECTIVE_DATE` | launch date, `YYYY-MM-DD` |
   | `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` | Cloudflare Web Analytics token, if you keep using it (below) |
   | `NEXT_PUBLIC_ADSENSE_CLIENT` | `ca-pub-…` once AdSense approves the site (also generates `ads.txt`) |

   Copy any other variables and secrets you had on the Cloudflare Worker (contact form, processor,
   Turnstile, analytics provider).
4. **Region:** Project → Settings → Functions → **Mumbai (bom1)**, so the API functions run close to
   visitors. Pages are served from Vercel's edge regardless.
5. **Deploy.** The site appears at `<project>.vercel.app`.

### Check before moving the domain
On the networks your visitors use (Jio, Airtel), open the `*.vercel.app` URL and confirm it's fast.
Spot-check a few pages, a redirect (`/privacy` → 301 → `/privacy-policy`) and a tool alias.

### Move the domain
1. Vercel project → **Settings → Domains** → add `expensico.com` and `www.expensico.com` (set
   `www` to redirect to the apex, 301).
2. If DNS stays on Cloudflare: in Cloudflare DNS, remove the Worker's custom domains, then add the
   records Vercel shows (A `@` → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com`) with the proxy
   **off (DNS only, grey cloud)**. Proxying through Cloudflare would bring back the slow routing.
   If you move the nameservers to Vercel instead, first copy every record you need, including the
   `google-site-verification` TXT record (Search Console) and any email records.
3. Once Vercel shows the domain as valid, disconnect the Cloudflare Worker's GitHub builds (or
   delete the Worker) so pushes don't fail there.

Search Console needs no changes: the domain property is verified by the DNS TXT record, and URLs,
the sitemap and redirects are unchanged.

### Cloudflare Web Analytics (optional)
Cloudflare used to inject the beacon at the edge. With DNS-only records it no longer can, so set it
up manually: Cloudflare dashboard → **Web Analytics** → the site → **Manage site** → copy the token
from the JS snippet into `NEXT_PUBLIC_CF_ANALYTICS_TOKEN`. The CSP and privacy/cookie policies
include Cloudflare Web Analytics only while the token is set.

### Local check before deploying
`pnpm build && pnpm start` serves the production build, with the same headers, redirects and
`/api` routes as Vercel. `pnpm test:e2e` runs the browser tests against it.

### Contact form
Create a [Resend](https://resend.com) account and verify `expensico.com` as a sending domain. Add
`RESEND_API_KEY` and `CONTACT_FROM_EMAIL` as Vercel environment variables, then set the build variable `NEXT_PUBLIC_CONTACT_FORM=true` and redeploy. Messages go to the site contact email
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
3. In Vercel set `NEXT_PUBLIC_PROCESSOR_URL` (the processor URL) and `PROCESSOR_SHARED_SECRET`
   (same value), then redeploy. The server conversions and their landing pages (`/convert/docx-to-pdf`, …)
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

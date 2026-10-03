// Runs after `next build` (static export to out/). Writes the files Cloudflare Workers static
// assets reads at the edge: _headers (security headers + caching), _redirects (301s) and,
// when AdSense is configured, ads.txt.
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { STATIC_REDIRECTS, securityHeaders } from "../security-headers.mjs";

const out = join(dirname(fileURLToPath(import.meta.url)), "../out");
if (!existsSync(out)) throw new Error("out/ not found — run `next build` first");

// _headers: security headers on every response; long-lived caching for fingerprinted assets.
const block = (path, headers) => `${path}\n${headers.map((h) => `  ${h.key}: ${h.value}`).join("\n")}\n`;
writeFileSync(
  join(out, "_headers"),
  [
    block("/*", securityHeaders()),
    // Extensionless in the export; without this it would be served as application/octet-stream.
    block("/opengraph-image", [{ key: "Content-Type", value: "image/png" }, { key: "Cache-Control", value: "public, max-age=86400" }]),
    block("/_next/static/*", [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]),
    block("/pdfjs/*", [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }]),
    block("/icons/*", [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }]),
  ].join("\n"),
);

// _redirects: fixed redirects + tool aliases exported by app/redirects.txt/route.ts.
// On a re-run redirects.txt is already gone, so keep the alias lines from the previous _redirects.
const generated = join(out, "redirects.txt");
const previous = join(out, "_redirects");
const fixed = new Set(STATIC_REDIRECTS.map((r) => `${r.source} ${r.destination} 301`));
const aliases = existsSync(generated)
  ? readFileSync(generated, "utf8").trim().split("\n").filter(Boolean)
  : existsSync(previous)
    ? readFileSync(previous, "utf8").trim().split("\n").filter((l) => l && !fixed.has(l))
    : [];
rmSync(generated, { force: true });
writeFileSync(join(out, "_redirects"), [...STATIC_REDIRECTS.map((r) => `${r.source} ${r.destination} 301`), ...aliases].join("\n") + "\n");

// ads.txt: authorises Google to sell ads on this domain (AdSense warns without it).
const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();
const adsTxt = join(out, "ads.txt");
if (client) {
  const pub = client.replace(/^ca-/, "");
  if (!/^pub-\d{10,}$/.test(pub)) throw new Error(`NEXT_PUBLIC_ADSENSE_CLIENT looks wrong: ${client} (expected ca-pub-0000000000000000)`);
  writeFileSync(adsTxt, `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`);
} else {
  rmSync(adsTxt, { force: true });
}

console.log(`Cloudflare files: _headers, _redirects (${STATIC_REDIRECTS.length + aliases.length} rules)${client ? ", ads.txt" : ""}`);

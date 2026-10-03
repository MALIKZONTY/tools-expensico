import { toolRedirects } from "@/registry/tools";

export const dynamic = "force-static";

/**
 * Tool alias redirects in Cloudflare `_redirects` syntax. scripts/cloudflare-files.mjs moves
 * this file to out/_redirects after the static export; it is never served itself.
 */
export function GET() {
  const lines = toolRedirects().map((r) => `${r.source} ${r.destination} 301`);
  return new Response(lines.join("\n") + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

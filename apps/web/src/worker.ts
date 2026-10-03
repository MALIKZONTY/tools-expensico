/**
 * Cloudflare Worker entry. Every page is a static file served straight from Workers static
 * assets (see wrangler.jsonc); this script only runs for /api/* (`run_worker_first`).
 */
import { handle as contact } from "./server/api/contact";
import { handle as processingToken } from "./server/api/processing-token";

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const ROUTES: Record<string, (req: Request) => Promise<Response>> = {
  "/api/contact": contact,
  "/api/processing-token": processingToken,
};

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(req.url);
    const route = ROUTES[pathname];
    if (!route) return env.ASSETS.fetch(req);
    if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: { Allow: "POST" } });
    return route(req);
  },
};

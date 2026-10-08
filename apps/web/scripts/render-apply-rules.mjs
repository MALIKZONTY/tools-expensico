// Applies the headers and redirects from render.yaml to a Render static site created in the
// dashboard (a dashboard-created site doesn't read render.yaml). Replaces all existing rules.
//
//   RENDER_API_KEY=rnd_… RENDER_SERVICE_ID=srv-… pnpm render:apply
//
// API key: Render → Account Settings → API Keys. Service ID: the srv-… part of the site's URL.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "js-yaml";

const { RENDER_API_KEY: key, RENDER_SERVICE_ID: serviceId } = process.env;
if (!key || !serviceId?.startsWith("srv-")) throw new Error("Set RENDER_API_KEY and RENDER_SERVICE_ID (srv-…).");

const blueprint = load(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../render.yaml"), "utf8"));
const site = blueprint.services.find((s) => s.runtime === "static");

async function put(path, body) {
  const res = await fetch(`https://api.render.com/v1/services/${serviceId}/${path}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status} ${await res.text()}`);
  const saved = await res.json();
  console.log(`${path}: ${Array.isArray(saved) ? saved.length : "?"} rules saved`);
}

await put("headers", site.headers);
await put("routes", site.routes);

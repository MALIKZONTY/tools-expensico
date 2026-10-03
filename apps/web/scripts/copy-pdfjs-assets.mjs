// Copies pdf.js runtime assets (worker, CMaps, standard fonts, WASM decoders, ICC profiles)
// into public/pdfjs so they are served from our own origin with the matching version.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = dirname(require.resolve("pdfjs-dist/package.json"));
const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "pdfjs");
const stamp = join(out, ".version");

if (existsSync(stamp) && readFileSync(stamp, "utf8") === version) {
  process.exit(0);
}
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(root, "build", "pdf.worker.min.mjs"), join(out, "pdf.worker.min.mjs"));
for (const dir of ["cmaps", "standard_fonts", "wasm", "iccs"]) {
  cpSync(join(root, dir), join(out, dir), { recursive: true });
}
writeFileSync(stamp, version);
console.log(`pdf.js ${version} assets copied to public/pdfjs`);

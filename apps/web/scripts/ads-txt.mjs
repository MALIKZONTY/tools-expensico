// Runs before `next build`. Writes public/ads.txt, which authorises Google to sell ads on this
// domain (AdSense warns without it), only when NEXT_PUBLIC_ADSENSE_CLIENT is set.
import { rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const adsTxt = join(dirname(fileURLToPath(import.meta.url)), "../public/ads.txt");
const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();
if (client) {
  const pub = client.replace(/^ca-/, "");
  if (!/^pub-\d{10,}$/.test(pub)) throw new Error(`NEXT_PUBLIC_ADSENSE_CLIENT looks wrong: ${client} (expected ca-pub-0000000000000000)`);
  writeFileSync(adsTxt, `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`);
} else {
  rmSync(adsTxt, { force: true });
}

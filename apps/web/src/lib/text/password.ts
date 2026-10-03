export interface PasswordOptions {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/~",
};
const AMBIGUOUS = /[Il1O0o|`'"]/g;

/** Unbiased random integer in [0, max) using rejection sampling. */
export function randomInt(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % max;
  }
}

export function generatePassword(o: PasswordOptions): string {
  const groups = (Object.keys(SETS) as (keyof typeof SETS)[]).filter((k) => o[k]).map((k) => (o.excludeAmbiguous ? SETS[k].replace(AMBIGUOUS, "") : SETS[k]));
  if (!groups.length) throw new Error("Choose at least one character type.");
  const all = groups.join("");
  const len = Math.max(groups.length, Math.min(256, o.length));
  // Guarantee at least one character from each chosen group, then shuffle.
  const chars = groups.map((g) => g[randomInt(g.length)]);
  while (chars.length < len) chars.push(all[randomInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

export function poolSize(o: PasswordOptions): number {
  return (Object.keys(SETS) as (keyof typeof SETS)[]).filter((k) => o[k]).reduce((n, k) => n + (o.excludeAmbiguous ? SETS[k].replace(AMBIGUOUS, "") : SETS[k]).length, 0);
}

export function entropyBits(length: number, pool: number): number {
  return pool > 1 ? length * Math.log2(pool) : 0;
}

export function strengthLabel(bits: number): { label: string; tone: "danger" | "warning" | "info" | "success" } {
  if (bits < 40) return { label: "Weak", tone: "danger" };
  if (bits < 60) return { label: "Fair", tone: "warning" };
  if (bits < 80) return { label: "Strong", tone: "info" };
  return { label: "Very strong", tone: "success" };
}

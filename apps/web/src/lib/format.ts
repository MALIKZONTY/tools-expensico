/** Formatting helpers shared by tools. Pure and locale-aware. */

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

/** Human readable size using 1024-based units (what operating systems show). */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTE_UNITS.length - 1);
  const value = bytes / 1024 ** exp;
  return `${value.toFixed(value >= 100 ? 0 : decimals)} ${BYTE_UNITS[exp]}`;
}

export function formatNumber(value: number, options: Intl.NumberFormatOptions = {}, locale = "en-IN"): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(locale, options).format(value);
}

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "AED" | "SGD" | "AUD" | "CAD" | "JPY";

export const CURRENCIES: { code: CurrencyCode; label: string; locale: string }[] = [
  { code: "INR", label: "₹ Indian Rupee", locale: "en-IN" },
  { code: "USD", label: "$ US Dollar", locale: "en-US" },
  { code: "EUR", label: "€ Euro", locale: "de-DE" },
  { code: "GBP", label: "£ British Pound", locale: "en-GB" },
  { code: "AED", label: "AED UAE Dirham", locale: "en-AE" },
  { code: "SGD", label: "S$ Singapore Dollar", locale: "en-SG" },
  { code: "AUD", label: "A$ Australian Dollar", locale: "en-AU" },
  { code: "CAD", label: "C$ Canadian Dollar", locale: "en-CA" },
  { code: "JPY", label: "¥ Japanese Yen", locale: "ja-JP" },
];

export function formatCurrency(value: number, currency: CurrencyCode = "INR", fractionDigits?: number): string {
  if (!Number.isFinite(value)) return "—";
  const locale = CURRENCIES.find((c) => c.code === currency)?.locale ?? "en-IN";
  const digits = fractionDigits ?? (currency === "JPY" ? 0 : Math.abs(value) >= 1000 ? 0 : 2);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** "₹12.5 L", "₹3.2 Cr" — compact Indian notation used in chart labels and summaries. */
export function formatIndianCompact(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e7) return `${sign}₹${trimZeros((abs / 1e7).toFixed(2))} Cr`;
  if (abs >= 1e5) return `${sign}₹${trimZeros((abs / 1e5).toFixed(2))} L`;
  return `${sign}₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(abs)}`;
}

function trimZeros(s: string): string {
  return s.replace(/\.?0+$/, "");
}

export function formatPercent(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return `${trimZeros(value.toFixed(digits))}%`;
}

/** Strip path components and characters that are unsafe in filenames on any OS. */
export function sanitizeFilename(name: string, fallback = "file"): string {
  const base = name.split(/[\\/]/).pop() ?? "";
  const cleaned = base
    .replace(/[\u0000-\u001f\u007f<>:"|?*]/g, "")
    .replace(/^\.+/, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
  return cleaned || fallback;
}

/** "report.final.pdf" → "report.final" */
export function stripExtension(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx > 0 ? name.slice(0, idx) : name;
}

export function getExtension(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx > 0 ? name.slice(idx + 1).toLowerCase() : "";
}

export function replaceExtension(name: string, ext: string): string {
  return `${stripExtension(sanitizeFilename(name))}.${ext}`;
}

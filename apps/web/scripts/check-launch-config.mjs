// Lists owner-supplied settings that are still missing before going live.
// Usage: node scripts/check-launch-config.mjs   (reads the current environment)
const required = [
  ["NEXT_PUBLIC_LEGAL_JURISDICTION", "Governing law / courts for the terms of use"],
  ["NEXT_PUBLIC_LEGAL_EFFECTIVE_DATE", "Effective date of your legal documents (YYYY-MM-DD)"],
];
const recommended = [
  ["RESEND_API_KEY", "Enables the contact form (with CONTACT_FROM_EMAIL); messages go to the site contact email"],
  ["CONTACT_FROM_EMAIL", "Verified sender address for contact-form emails"],
  ["NEXT_PUBLIC_ANALYTICS_PROVIDER", "Cookieless analytics (plausible or umami)"],
];
const optional = [
  ["NEXT_PUBLIC_PROCESSOR_URL", "Enables server conversions (Word/Excel/PowerPoint → PDF, Ghostscript compression)"],
  ["PROCESSOR_SHARED_SECRET", "Required together with NEXT_PUBLIC_PROCESSOR_URL"],
  ["NEXT_PUBLIC_TURNSTILE_SITE_KEY", "Cloudflare Turnstile on the contact form"],
];
const missing = (list) => list.filter(([k]) => !process.env[k]?.trim());
const report = (title, list) => {
  const m = missing(list);
  console.log(`\n${title}: ${m.length ? `${m.length} missing` : "all set"}`);
  for (const [k, why] of m) console.log(`  • ${k} — ${why}`);
  return m.length;
};
const blocking = report("Required", required);
report("Recommended", recommended);
report("Optional", optional);
if (process.env.NEXT_PUBLIC_PROCESSOR_URL && (process.env.PROCESSOR_SHARED_SECRET ?? "").length < 32) {
  console.log("\n✖ PROCESSOR_SHARED_SECRET must be at least 32 characters when the processor is enabled.");
  process.exitCode = 1;
}
if (blocking) {
  console.log("\nLegal pages will show bracketed placeholders until the required values are set.");
  process.exitCode = 1;
}

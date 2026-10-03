import { contactSchema, CONTACT_TOPICS } from "@/lib/contact-schema";
import { site } from "@/config/site";
import { clientIp, rateLimit, sameOrigin } from "@/lib/server/rate-limit";

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured: rely on honeypot, timing and rate limits
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const data = (await res.json()) as { success?: boolean };
  return Boolean(data.success);
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || site.contactEmail;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) return Response.json({ error: "The contact form isn't configured yet." }, { status: 503 });
  if (!sameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });

  const ip = clientIp(req);
  const rl = rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.ok) return Response.json({ error: "You've sent several messages recently. Please try again later." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return Response.json({ error: "Please check the form.", fieldErrors }, { status: 400 });
  }
  const d = parsed.data;
  // Spam signals: honeypot filled, or submitted faster than a human could type.
  if (d.website || Date.now() - d.startedAt < 3000) return Response.json({ ok: true });
  if (!(await verifyTurnstile(d.turnstileToken, ip))) return Response.json({ error: "Spam check failed. Please try again." }, { status: 400 });

  const topic = CONTACT_TOPICS.find((t) => t.value === d.topic)?.label ?? d.topic;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: d.email,
      subject: `[Expensico] ${topic}${d.tool ? ` — ${d.tool}` : ""}`,
      text: `From: ${d.name} <${d.email}>\nTopic: ${topic}\nTool: ${d.tool || "-"}\n\n${d.message}`,
      html: `<p><strong>From:</strong> ${escape(d.name)} &lt;${escape(d.email)}&gt;<br><strong>Topic:</strong> ${escape(topic)}<br><strong>Tool:</strong> ${escape(d.tool || "-")}</p><p style="white-space:pre-wrap">${escape(d.message)}</p>`,
    }),
  });
  if (!res.ok) return Response.json({ error: "We couldn't send your message right now. Please try again later." }, { status: 502 });
  return Response.json({ ok: true });
}

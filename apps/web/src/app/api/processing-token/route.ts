import { PROCESSOR_LIMITS, randomNonce, signToken, type ProcessorOperation } from "@expensico/processing-contract";
import { clientIp, rateLimit, sameOrigin } from "@/lib/server/rate-limit";

const OPS: ProcessorOperation["kind"][] = ["office-to-pdf", "pdf-compress"];

/** Issues short-lived HMAC tokens that authorise one kind of processor job. */
export async function POST(req: Request) {
  const secret = process.env.PROCESSOR_SHARED_SECRET;
  if (!secret || !process.env.NEXT_PUBLIC_PROCESSOR_URL) return Response.json({ error: "Processing service not configured" }, { status: 503 });
  if (!sameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const rl = rateLimit(`token:${clientIp(req)}`, 20, 10 * 60 * 1000);
  if (!rl.ok) return Response.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });

  let op: unknown;
  try {
    op = ((await req.json()) as { op?: unknown }).op;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  if (typeof op !== "string" || !OPS.includes(op as ProcessorOperation["kind"])) return Response.json({ error: "Unknown operation" }, { status: 400 });

  const exp = Math.floor(Date.now() / 1000) + PROCESSOR_LIMITS.tokenTtlSeconds;
  const token = await signToken({ exp, n: randomNonce(), op: op as ProcessorOperation["kind"] }, secret);
  return Response.json({ token, expiresAt: exp }, { headers: { "Cache-Control": "no-store" } });
}

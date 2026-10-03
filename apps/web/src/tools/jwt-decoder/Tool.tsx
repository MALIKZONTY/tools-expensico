"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, XCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { CodeArea, InputActions } from "@/components/tool/Workbench";
import { CopyButton } from "@/components/ui/copy-button";
import { useMounted } from "@/hooks/use-mounted";
import { decodeJwt, timeStatus, verifyHmac } from "@/lib/dev/jwt";

const EXAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const CLAIMS: Record<string, string> = {
  iss: "Issuer", sub: "Subject", aud: "Audience", exp: "Expires", nbf: "Not before", iat: "Issued at", jti: "Token ID", scope: "Scopes", azp: "Authorised party",
};

function JsonBlock({ title, value }: { title: string; value: object }) {
  const text = JSON.stringify(value, null, 2);
  return (
    <section className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <CopyButton value={text} variant="ghost" size="sm" />
      </div>
      <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-surface-2 p-3 font-mono text-[13px] leading-relaxed">{text}</pre>
    </section>
  );
}

export default function JwtDecoder() {
  const [token, setToken] = useState(EXAMPLE);
  const [secret, setSecret] = useState("");
  const [verifyResult, setVerifyResult] = useState<{ key: string; value: boolean | string } | null>(null);
  const verify = verifyResult?.key === `${token}\u0000${secret}` ? verifyResult.value : null;
  const setVerify = (value: boolean | string) => setVerifyResult({ key: `${token}\u0000${secret}`, value });
  const decoded = useMemo(() => {
    if (!token.trim()) return null;
    try {
      return { ok: true as const, value: decodeJwt(token) };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [token]);
  // Times depend on the clock and the visitor's time zone, so they render after hydration
  // (the server and the browser would otherwise format them differently).
  const mounted = useMounted();
  const status = mounted && decoded?.ok ? timeStatus(decoded.value.payload) : null;
  const formatTime = (seconds: number) => (mounted ? new Date(seconds * 1000).toLocaleString() : `${new Date(seconds * 1000).toISOString().replace("T", " ").slice(0, 19)} UTC`);
  const alg = decoded?.ok ? String(decoded.value.header.alg ?? "") : "";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="jwt-in" className="text-sm font-semibold">Token</label>
        <InputActions onText={setToken} onClear={() => setToken("")} accept=".txt,.jwt,text/plain" />
      </div>
      <CodeArea id="jwt-in" label="JWT" value={token} onChange={setToken} minRows={4} className="whitespace-pre-wrap break-all" invalid={decoded?.ok === false} />
      {decoded && !decoded.ok && <Alert tone="danger" role="alert" title="Can't decode this token">{decoded.error}</Alert>}
      {decoded?.ok && (
        <>
          <div className="flex flex-wrap gap-2">
            <Badge tone="neutral">alg: {alg || "none"}</Badge>
            {status?.kind === "valid" && <Badge tone="success" icon={<CheckCircle2 aria-hidden />}>Not expired</Badge>}
            {status?.kind === "expired" && <Badge tone="danger" icon={<XCircle aria-hidden />}>Expired</Badge>}
            {status?.kind === "not-yet-valid" && <Badge tone="warning" icon={<AlertTriangle aria-hidden />}>Not valid yet</Badge>}
            {status?.kind === "no-expiry" && <Badge tone="warning" icon={<AlertTriangle aria-hidden />}>No expiry (exp) claim</Badge>}
          </div>
          {alg.toLowerCase() === "none" && (
            <Alert tone="warning" title="Unsigned token">This token uses alg “none” — it has no signature and must never be trusted by a server.</Alert>
          )}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <JsonBlock title="Header" value={decoded.value.header} />
            <JsonBlock title="Payload" value={decoded.value.payload} />
          </div>
          <section aria-labelledby="claims-h">
            <h3 id="claims-h" className="text-sm font-semibold">Claims</h3>
            <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-[10rem_1fr]">
              {Object.entries(decoded.value.payload).map(([k, v]) => {
                const isTime = ["exp", "nbf", "iat", "auth_time"].includes(k) && typeof v === "number";
                return (
                  <div key={k} className="contents">
                    <dt className="text-muted">
                      <code>{k}</code>
                      {CLAIMS[k] ? ` · ${CLAIMS[k]}` : ""}
                    </dt>
                    <dd className="break-all">
                      {isTime ? `${formatTime(v as number)} (${v})` : typeof v === "object" ? JSON.stringify(v) : String(v)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
          <section className="flex flex-col gap-2 rounded-lg border border-border bg-surface-2 p-4" aria-labelledby="verify-h">
            <h3 id="verify-h" className="flex items-center gap-2 text-sm font-semibold">
              <ShieldAlert aria-hidden className="size-4" /> Verify signature (HS256/384/512)
            </h3>
            <p className="text-sm text-muted">Decoding doesn&apos;t prove a token is genuine. Enter the shared secret to check the signature — it stays in your browser. RS/ES tokens need the issuer&apos;s public key and aren&apos;t verified here.</p>
            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setVerify(await verifyHmac(decoded.value, secret));
                } catch (err) {
                  setVerify((err as Error).message);
                }
              }}
            >
              <Input type="password" aria-label="Secret" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Secret" autoComplete="off" />
              <Button type="submit" variant="secondary" disabled={!secret}>Verify</Button>
            </form>
            {verify === true && <Alert tone="success">Signature verified with this secret.</Alert>}
            {verify === false && <Alert tone="danger">Signature does not match this secret.</Alert>}
            {typeof verify === "string" && <Alert tone="warning">{verify}</Alert>}
          </section>
        </>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { useClientValue } from "@/hooks/use-mounted";
import Script from "next/script";
import { CheckCircle2, Send } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { CONTACT_TOPICS } from "@/lib/contact-schema";

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, o: { sitekey: string; callback: (t: string) => void; "expired-callback"?: () => void; theme?: string }) => string };
  }
}

export function ContactForm({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const search = useClientValue(() => window.location.search, "");
  const params = new URLSearchParams(search);
  const urlTopic = params.get("topic");
  const urlTool = params.get("tool");
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "", website: "" });
  const topic = form.topic || (CONTACT_TOPICS.some((t) => t.value === urlTopic) ? urlTopic! : "other");
  const tool = urlTool && /^[a-z0-9-]{1,80}$/.test(urlTool) ? urlTool : "";
  // Time of first interaction: submissions faster than a person could type are treated as spam.
  const [startedAt, setStartedAt] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | undefined>();
  const tsRef = useRef<HTMLDivElement>(null);

  function renderTurnstile() {
    if (turnstileSiteKey && tsRef.current && window.turnstile && !tsRef.current.childElementCount) {
      window.turnstile.render(tsRef.current, { sitekey: turnstileSiteKey, callback: setToken, "expired-callback": () => setToken(undefined) });
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, topic, tool, startedAt: startedAt || Date.now(), turnstileToken: token }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; fieldErrors?: Record<string, string> };
      if (res.ok) {
        setStatus("sent");
        return;
      }
      setErrors(data.fieldErrors ?? {});
      setMessage(data.error ?? "Something went wrong. Please try again.");
      setStatus("error");
    } catch {
      setMessage("We couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <Alert tone="success" title="Thanks — your message has been sent">
        <span className="flex items-center gap-2"><CheckCircle2 aria-hidden className="size-4" /> We&apos;ll reply to {form.email} if a response is needed.</span>
      </Alert>
    );
  }

  return (
    <form onSubmit={submit} onFocusCapture={() => startedAt || setStartedAt(Date.now())} noValidate className="flex flex-col gap-4">
      {turnstileSiteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={renderTurnstile} />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Your name" error={errors.name}>{(p) => <Input {...p} autoComplete="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} />}</Field>
        <Field label="Email address" error={errors.email}>{(p) => <Input {...p} type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={200} />}</Field>
      </div>
      <Field label="What's it about?" error={errors.topic}>{(p) => (
        <Select {...p} value={topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
          {CONTACT_TOPICS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
      )}</Field>
      {tool && <p className="text-sm text-muted">About the tool: <code className="rounded bg-surface-2 px-1">{tool}</code></p>}
      <Field label="Message" error={errors.message} hint={topic === "bug" ? "What did you do, what did you expect, and what happened instead? Mention your browser and device. Please don't attach or paste confidential content." : undefined}>
        {(p) => <Textarea {...p} required rows={7} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={5000} />}
      </Field>
      {/* Honeypot: hidden from people, tempting for bots. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></label>
      </div>
      {turnstileSiteKey && <div ref={tsRef} />}
      {status === "error" && <Alert tone="danger" role="alert">{message}</Alert>}
      <Button type="submit" size="lg" loading={status === "sending"} className="self-start">
        <Send aria-hidden /> Send message
      </Button>
      <p className="text-xs text-muted">We use your name and email only to reply. See our privacy policy for details.</p>
    </form>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { STATUS_CODES } from "./data";

const CLASSES = [
  { from: 100, label: "1xx Informational", tone: "text-info" },
  { from: 200, label: "2xx Success", tone: "text-success" },
  { from: 300, label: "3xx Redirection", tone: "text-[var(--cat-convert)]" },
  { from: 400, label: "4xx Client error", tone: "text-warning" },
  { from: 500, label: "5xx Server error", tone: "text-danger" },
];

export default function HttpStatusCodes() {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return STATUS_CODES;
    if (/^\d{1,3}$/.test(s)) return STATUS_CODES.filter((c) => String(c.code).startsWith(s));
    return STATUS_CODES.filter((c) => `${c.code} ${c.name} ${c.summary} ${c.detail ?? ""}`.toLowerCase().includes(s));
  }, [q]);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative max-w-xl">
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
        <Input aria-label="Search status codes" placeholder="Search by code or meaning, e.g. 429 or timeout" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>
      {CLASSES.map((cls) => {
        const items = list.filter((c) => c.code >= cls.from && c.code < cls.from + 100);
        if (!items.length) return null;
        return (
          <section key={cls.from} aria-labelledby={`c${cls.from}`}>
            <h2 id={`c${cls.from}`} className={cn("text-lg font-semibold", cls.tone)}>{cls.label}</h2>
            <dl className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {items.map((c) => (
                <div key={c.code} id={`code-${c.code}`} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                  <dt className="flex flex-wrap items-baseline gap-2">
                    <span className={cn("font-mono text-xl font-semibold", cls.tone)}>{c.code}</span>
                    <span className="font-semibold text-fg">{c.name}</span>
                    <span className="ml-auto text-xs text-subtle">{c.source}</span>
                  </dt>
                  <dd className="mt-1.5 text-sm text-fg">{c.summary}</dd>
                  {c.detail && <dd className="mt-1 text-sm text-muted">{c.detail}</dd>}
                </div>
              ))}
            </dl>
          </section>
        );
      })}
      {!list.length && <p className="text-muted">No status codes match “{q}”.</p>}
    </div>
  );
}

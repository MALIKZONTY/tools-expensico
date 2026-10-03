"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Search, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { PATTERNS, type RegexPattern } from "@/lib/dev/regex-patterns";
import { cn } from "@/lib/cn";

const CATS = ["All", "Web", "India", "Dates & numbers", "Text"] as const;

function snippet(p: RegexPattern, lang: "js" | "python" | "java") {
  if (lang === "js") return `/${p.pattern.replace(/\//g, "\\/")}/${p.flags}`;
  if (lang === "python") return `re.compile(r"${p.pattern.replace(/\\\//g, "/").replace(/"/g, '\\"')}"${p.flags.includes("i") ? ", re.IGNORECASE" : ""})`;
  return `Pattern.compile("${p.pattern.replace(/\\\//g, "/").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"${p.flags.includes("i") ? ", Pattern.CASE_INSENSITIVE" : ""})`;
}

export default function RegexLibrary() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(PATTERNS[0].id);
  const [lang, setLang] = useState<"js" | "python" | "java">("js");
  const [test, setTest] = useState("");

  const list = useMemo(
    () => PATTERNS.filter((p) => (cat === "All" || p.category === cat) && (!q.trim() || `${p.name} ${p.explanation}`.toLowerCase().includes(q.trim().toLowerCase()))),
    [cat, q],
  );
  const p = PATTERNS.find((x) => x.id === selected) ?? PATTERNS[0];
  const testResult = test ? new RegExp(p.pattern, p.flags.replace("g", "")).test(test) : null;
  const code = snippet(p, lang);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <Input aria-label="Filter patterns" placeholder="Filter patterns" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATS.map((c) => (
            <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={cn("h-8 rounded-full border px-3 text-sm", cat === c ? "border-brand bg-brand-soft text-brand-soft-fg" : "border-border bg-surface text-muted hover:text-fg")}>
              {c}
            </button>
          ))}
        </div>
        <ul className="flex max-h-[28rem] flex-col gap-0.5 overflow-y-auto rounded-xl border border-border bg-surface p-1.5">
          {list.map((x) => (
            <li key={x.id}>
              <button
                type="button"
                aria-current={x.id === p.id}
                onClick={() => { setSelected(x.id); setTest(""); }}
                className={cn("flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm", x.id === p.id ? "bg-brand-soft font-medium text-brand-soft-fg" : "hover:bg-surface-2")}
              >
                {x.name}
                <span className="shrink-0 text-xs text-subtle">{x.category}</span>
              </button>
            </li>
          ))}
          {!list.length && <li className="px-3 py-4 text-sm text-muted">No patterns match.</li>}
        </ul>
      </div>

      <section className="flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6" aria-labelledby="pattern-h">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="pattern-h" className="text-xl font-semibold">{p.name}</h2>
          <Badge>{p.category}</Badge>
        </div>
        <p className="text-muted">{p.explanation}</p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Segmented label="Language" size="sm" value={lang} onChange={setLang} options={[{ value: "js", label: "JavaScript" }, { value: "python", label: "Python" }, { value: "java", label: "Java" }]} />
          <CopyButton value={code} />
        </div>
        <pre className="overflow-x-auto rounded-lg border border-border bg-surface-2 p-3 font-mono text-[13px]">{code}</pre>
        {p.caveat && <p className="rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning-soft-fg">{p.caveat}</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold">Matches</h3>
            <ul className="mt-2 space-y-1 font-mono text-sm">{p.matches.map((m) => <li key={m} className="flex items-center gap-2"><CheckCircle2 aria-label="matches" className="size-4 shrink-0 text-success" />{m}</li>)}</ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Doesn&apos;t match</h3>
            <ul className="mt-2 space-y-1 font-mono text-sm">{p.rejects.map((m) => <li key={m} className="flex items-center gap-2"><XCircle aria-label="doesn't match" className="size-4 shrink-0 text-danger" />{m}</li>)}</ul>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 border-t border-border pt-4">
          <label htmlFor="try" className="text-sm font-semibold">Try it</label>
          <Input id="try" value={test} onChange={(e) => setTest(e.target.value)} placeholder="Type a value to test" className="font-mono" />
          {testResult !== null && (
            <p className={cn("flex items-center gap-2 text-sm font-medium", testResult ? "text-success" : "text-danger")} aria-live="polite">
              {testResult ? <CheckCircle2 aria-hidden className="size-4" /> : <XCircle aria-hidden className="size-4" />}
              {testResult ? "Matches" : "Doesn't match"}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

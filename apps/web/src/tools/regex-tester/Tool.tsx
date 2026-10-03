"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { Checkbox, Input } from "@/components/ui/field";
import { CodeArea } from "@/components/tool/Workbench";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/cn";

interface Match {
  index: number;
  text: string;
  groups: (string | undefined)[];
  named: Record<string, string | undefined> | null;
}

type Result = { ok: true; matches: Match[]; truncated: boolean; replaced: string | null } | { ok: false; error: string } | { ok: false; timeout: true };

const FLAGS = [
  { f: "g", label: "Global", hint: "find all matches" },
  { f: "i", label: "Ignore case", hint: "" },
  { f: "m", label: "Multiline", hint: "^ and $ match at line breaks" },
  { f: "s", label: "Dot all", hint: ". matches newlines" },
  { f: "u", label: "Unicode", hint: "" },
];

const TIMEOUT_MS = 1500;

function Highlighted({ text, matches }: { text: string; matches: Match[] }) {
  const parts: ReactNode[] = [];
  let last = 0;
  matches.slice(0, 2000).forEach((m, i) => {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <mark key={i} className={cn("rounded-sm px-px text-fg", i % 2 ? "bg-[color-mix(in_srgb,var(--series-2)_30%,transparent)]" : "bg-[color-mix(in_srgb,var(--series-1)_30%,transparent)]")}>
        {m.text || "​"}
      </mark>,
    );
    last = m.index + m.text.length;
  });
  parts.push(text.slice(last));
  return <div className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-surface-2 p-3 font-mono text-[13px] leading-relaxed">{parts}</div>;
}

export default function RegexTester() {
  const [pattern, setPattern] = useState("(?<user>[\\w.+-]+)@(?<domain>[\\w-]+\\.[\\w.]+)");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("Contact asha.rao@example.com or support@expensico.in for help.\nInvalid: @nouser.com");
  const [replace, setReplace] = useState("");
  const [useReplace, setUseReplace] = useState(false);
  const [lastResult, setResult] = useState<Result | null>(null);
  const result = pattern ? lastResult : null;
  const worker = useRef<Worker | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    if (!pattern) return;
    const id = ++seq.current;
    if (!worker.current) worker.current = new Worker(new URL("../../lib/dev/regex.worker.ts", import.meta.url), { type: "module" });
    const w = worker.current;
    const timer = window.setTimeout(() => {
      // Pattern is taking too long (catastrophic backtracking): kill the worker.
      if (seq.current === id) {
        w.terminate();
        worker.current = null;
        setResult({ ok: false, timeout: true });
      }
    }, TIMEOUT_MS);
    w.onmessage = (e: MessageEvent<Result & { id: number }>) => {
      if (e.data.id !== seq.current) return;
      window.clearTimeout(timer);
      setResult(e.data);
    };
    w.postMessage({ id, pattern, flags, text, replacement: useReplace ? replace : null });
    return () => window.clearTimeout(timer);
  }, [pattern, flags, text, replace, useReplace]);

  // Clear the ref as well as terminating, so a remount (or Strict Mode's mount/unmount/mount)
  // creates a fresh worker instead of posting to a dead one.
  useEffect(
    () => () => {
      worker.current?.terminate();
      worker.current = null;
    },
    [],
  );

  const toggle = (f: string) => setFlags((cur) => (cur.includes(f) ? cur.replace(f, "") : cur + f));

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="re-pattern" className="text-sm font-semibold">Regular expression</label>
        <div className="flex items-center rounded-md border border-border-strong bg-surface font-mono focus-within:outline-2 focus-within:outline-ring">
          <span className="pl-3 text-muted">/</span>
          <input id="re-pattern" value={pattern} onChange={(e) => setPattern(e.target.value)} spellCheck={false} autoComplete="off" className="h-11 min-w-0 flex-1 bg-transparent px-1 text-[0.9375rem] outline-none" />
          <span className="pr-3 text-muted">/{flags}</span>
        </div>
      </div>
      <fieldset className="flex flex-wrap gap-x-5 gap-y-2">
        <legend className="sr-only">Flags</legend>
        {FLAGS.map(({ f, label, hint }) => (
          <Checkbox key={f} label={`${label} (${f})`} description={hint || undefined} checked={flags.includes(f)} onChange={() => toggle(f)} />
        ))}
      </fieldset>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="re-text" className="text-sm font-semibold">Test text</label>
        <CodeArea id="re-text" label="Test text" value={text} onChange={setText} minRows={6} className="whitespace-pre-wrap" />
      </div>

      <div aria-live="polite" className="flex flex-col gap-3">
        {result && !result.ok && "timeout" in result && (
          <Alert tone="danger" role="alert" title="The pattern took too long">
            It ran for more than {TIMEOUT_MS / 1000} seconds and was stopped. This usually means catastrophic backtracking — nested quantifiers like <code>(a+)+</code> or <code>(.*)*</code>. Make the pattern more specific.
          </Alert>
        )}
        {result && !result.ok && "error" in result && <Alert tone="danger" role="alert" title="Invalid regular expression">{result.error}</Alert>}
        {result?.ok && (
          <>
            <p className="text-sm font-medium">
              {result.matches.length === 0 ? "No matches" : `${result.matches.length}${result.truncated ? "+" : ""} match${result.matches.length === 1 ? "" : "es"}`}
            </p>
            <Highlighted text={text} matches={result.matches} />
            {result.matches.length > 0 && (
              <div className="table-scroll max-h-72 overflow-y-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <caption className="sr-only">Matches and capture groups</caption>
                  <thead className="sticky top-0 bg-surface-2 text-left text-muted">
                    <tr>
                      <th scope="col" className="px-3 py-2 font-medium">#</th>
                      <th scope="col" className="px-3 py-2 font-medium">Index</th>
                      <th scope="col" className="px-3 py-2 font-medium">Match</th>
                      <th scope="col" className="px-3 py-2 font-medium">Groups</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {result.matches.slice(0, 500).map((m, i) => (
                      <tr key={i} className="border-t border-border align-top">
                        <td className="px-3 py-1.5 text-muted">{i + 1}</td>
                        <td className="px-3 py-1.5 text-muted">{m.index}</td>
                        <td className="break-all px-3 py-1.5">{m.text}</td>
                        <td className="break-all px-3 py-1.5 text-muted">
                          {m.named
                            ? Object.entries(m.named).map(([k, v]) => `${k}: ${v ?? "—"}`).join(" · ")
                            : m.groups.map((g, j) => `$${j + 1}: ${g ?? "—"}`).join(" · ") || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <Checkbox label="Replace" description="Use $1, $2 or $<name> to insert captured groups." checked={useReplace} onChange={(e) => setUseReplace(e.target.checked)} />
        {useReplace && (
          <>
            <Input aria-label="Replacement" value={replace} onChange={(e) => setReplace(e.target.value)} className="font-mono" placeholder="e.g. [$<user> at $<domain>]" />
            {result?.ok && result.replaced !== null && (
              <div className="flex flex-col gap-1">
                <div className="flex justify-end"><CopyButton value={result.replaced} variant="ghost" /></div>
                <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-surface-2 p-3 font-mono text-[13px]">{result.replaced}</pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

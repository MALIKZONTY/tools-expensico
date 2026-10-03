"use client";

import { memo, useState } from "react";
import { ChevronRight, Copy } from "lucide-react";
import { copyText } from "@/components/ui/copy-button";
import { useToast } from "@/components/ui/toast";
import { jsonPath } from "@/lib/json-tools";
import { cn } from "@/lib/cn";

const PAGE = 100;

function typeOf(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

function Primitive({ value, highlight }: { value: unknown; highlight?: string }) {
  const t = typeOf(value);
  const text = t === "string" ? JSON.stringify(value) : String(value);
  const cls =
    t === "string" ? "text-[#a14400] dark:text-[#f0a868]" : t === "number" ? "text-[#1f5fbf] dark:text-[#7fb2ff]" : t === "boolean" ? "text-[#8a2fb0] dark:text-[#d39cf0]" : "text-subtle";
  return <span className={cn("break-all", cls, highlight && text.toLowerCase().includes(highlight) && "rounded bg-warning-soft")}>{text}</span>;
}

interface NodeProps {
  name: string | number | null;
  value: unknown;
  path: (string | number)[];
  depth: number;
  defaultDepth: number;
  search: string;
  /** Force-expand nodes whose subtree matches the search. */
  matches: (path: string) => boolean;
}

const Node = memo(function Node({ name, value, path, depth, defaultDepth, search, matches }: NodeProps) {
  const t = typeOf(value);
  const container = t === "object" || t === "array";
  const pathStr = jsonPath(path);
  const forced = search !== "" && matches(pathStr);
  const [open, setOpen] = useState(depth < defaultDepth);
  const [limit, setLimit] = useState(PAGE);
  const { toast } = useToast();
  const expanded = open || forced;
  const entries = container ? (t === "array" ? (value as unknown[]).map((v, i) => [i, v] as const) : Object.entries(value as object)) : [];
  const keyHit = search && name !== null && String(name).toLowerCase().includes(search);

  const label =
    name === null ? null : (
      <span className={cn("text-fg", keyHit && "rounded bg-warning-soft")}>{typeof name === "number" ? name : JSON.stringify(name)}</span>
    );

  return (
    <li className="group/node">
      <div className="flex items-start gap-1 rounded py-0.5 pr-2 hover:bg-surface-2" style={{ paddingLeft: depth * 16 }}>
        {container ? (
          <button
            type="button"
            onClick={() => setOpen(!expanded)}
            aria-expanded={expanded}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${name ?? "root"}`}
            className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded text-muted hover:text-fg"
          >
            <ChevronRight aria-hidden className={cn("size-3.5 transition-transform", expanded && "rotate-90")} />
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <span className="min-w-0 flex-1">
          {label}
          {label && <span className="text-subtle">: </span>}
          {container ? (
            <span className="text-subtle">
              {t === "array" ? `[${entries.length}]` : `{${entries.length}}`}
              {!expanded && entries.length > 0 && <span className="ml-1 text-xs">…</span>}
            </span>
          ) : (
            <Primitive value={value} highlight={search || undefined} />
          )}
        </span>
        <button
          type="button"
          onClick={async () => {
            const ok = await copyText(pathStr);
            toast(ok ? `Copied path ${pathStr}` : "Couldn't copy", ok ? "success" : "error");
          }}
          className="invisible inline-flex size-6 shrink-0 items-center justify-center rounded text-muted hover:bg-surface-3 hover:text-fg group-hover/node:visible focus-visible:visible"
          aria-label={`Copy path ${pathStr}`}
          title="Copy JSONPath"
        >
          <Copy aria-hidden className="size-3.5" />
        </button>
      </div>
      {container && expanded && entries.length > 0 && (
        <ul>
          {entries.slice(0, limit).map(([k, v]) => (
            <Node key={k} name={k} value={v} path={[...path, k]} depth={depth + 1} defaultDepth={defaultDepth} search={search} matches={matches} />
          ))}
          {entries.length > limit && (
            <li style={{ paddingLeft: (depth + 1) * 16 + 20 }} className="py-1">
              <button type="button" onClick={() => setLimit((l) => l + PAGE * 5)} className="text-sm font-medium text-brand hover:underline">
                Show {Math.min(PAGE * 5, entries.length - limit)} more of {entries.length - limit} remaining
              </button>
            </li>
          )}
        </ul>
      )}
    </li>
  );
});

/** Collect paths of nodes whose key or primitive value matches, plus their ancestors. */
function matchingPaths(value: unknown, search: string, limit = 5000): Set<string> {
  const out = new Set<string>();
  let count = 0;
  function walk(v: unknown, path: (string | number)[]): boolean {
    if (count++ > 200_000 || out.size > limit) return false;
    const t = typeOf(v);
    let hit = false;
    if (t === "object" || t === "array") {
      const entries = t === "array" ? (v as unknown[]).map((x, i) => [i, x] as const) : Object.entries(v as object);
      for (const [k, child] of entries) {
        const keyHit = String(k).toLowerCase().includes(search);
        if (walk(child, [...path, k]) || keyHit) hit = true;
      }
    } else {
      hit = (t === "string" ? JSON.stringify(v) : String(v)).toLowerCase().includes(search);
    }
    if (hit) out.add(jsonPath(path));
    return hit;
  }
  walk(value, []);
  return out;
}

export function JsonTree({ value, defaultDepth = 2, search = "" }: { value: unknown; defaultDepth?: number; search?: string }) {
  const q = search.trim().toLowerCase();
  const [cache] = useState(() => new Map<string, Set<string>>());
  let set: Set<string> | undefined;
  if (q) {
    set = cache.get(q);
    if (!set) {
      set = matchingPaths(value, q);
      cache.clear();
      cache.set(q, set);
    }
  }
  const matches = (p: string) => Boolean(set?.has(p));
  return (
    <div className="overflow-auto rounded-lg border border-border bg-surface p-2 font-mono text-[13px] leading-relaxed">
      {q && set && set.size === 0 && <p className="px-2 py-1 font-sans text-sm text-muted">No keys or values match “{search.trim()}”.</p>}
      <ul aria-label="JSON tree">
        <Node key={q} name={null} value={value} path={[]} depth={0} defaultDepth={defaultDepth} search={q} matches={matches} />
      </ul>
    </div>
  );
}

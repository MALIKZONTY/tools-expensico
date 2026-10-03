"use client";

import { Fragment } from "react";
import { diffWords, type DiffOp } from "@/lib/text/diff";
import { cn } from "@/lib/cn";

interface Row {
  left?: { n: number; text: string; type: "equal" | "delete" };
  right?: { n: number; text: string; type: "equal" | "insert" };
}

/** Pair deletions with following insertions so changed lines sit side by side. */
function toRows(ops: DiffOp[]): Row[] {
  const rows: Row[] = [];
  let ln = 0;
  let rn = 0;
  for (let i = 0; i < ops.length; ) {
    if (ops[i].type === "equal") {
      rows.push({ left: { n: ++ln, text: ops[i].value, type: "equal" }, right: { n: ++rn, text: ops[i].value, type: "equal" } });
      i++;
      continue;
    }
    const dels: string[] = [];
    const ins: string[] = [];
    while (i < ops.length && ops[i].type === "delete") dels.push(ops[i++].value);
    while (i < ops.length && ops[i].type === "insert") ins.push(ops[i++].value);
    for (let k = 0; k < Math.max(dels.length, ins.length); k++) {
      rows.push({
        left: k < dels.length ? { n: ++ln, text: dels[k], type: "delete" } : undefined,
        right: k < ins.length ? { n: ++rn, text: ins[k], type: "insert" } : undefined,
      });
    }
  }
  return rows;
}

function Words({ a, b, side }: { a: string; b: string; side: "left" | "right" }) {
  if (a.length + b.length > 4000) return <>{side === "left" ? a : b}</>;
  const ops = diffWords(a, b);
  return (
    <>
      {ops.map((o, i) =>
        o.type === "equal" ? (
          <Fragment key={i}>{o.value}</Fragment>
        ) : (side === "left" && o.type === "delete") || (side === "right" && o.type === "insert") ? (
          <mark key={i} className={cn("rounded-sm px-px text-fg", side === "left" ? "bg-[color-mix(in_srgb,var(--danger)_28%,transparent)]" : "bg-[color-mix(in_srgb,var(--success)_28%,transparent)]")}>{o.value}</mark>
        ) : null,
      )}
    </>
  );
}

const MAX_ROWS = 5000;

export function DiffView({ ops, mode }: { ops: DiffOp[]; mode: "split" | "unified" }) {
  const rows = toRows(ops);
  if (!ops.some((o) => o.type !== "equal")) {
    return <p className="rounded-lg bg-success-soft px-4 py-3 text-sm font-medium text-success-soft-fg">The texts are identical{ops.length ? "" : " (both empty)"}.</p>;
  }
  const cell = "whitespace-pre-wrap break-words px-3 py-0.5 align-top";
  const num = "w-10 select-none px-2 py-0.5 text-right align-top text-xs text-subtle";
  return (
    <div className="table-scroll max-h-[36rem] overflow-y-auto rounded-lg border border-border font-mono text-[13px] leading-relaxed">
      <table className="w-full border-collapse">
        <caption className="sr-only">Differences. Removed lines are marked with a minus sign, added lines with a plus sign.</caption>
        <tbody>
          {mode === "split"
            ? rows.slice(0, MAX_ROWS).map((r, i) => (
                <tr key={i}>
                  <td className={cn(num, r.left?.type === "delete" && "bg-danger-soft")}>{r.left?.n}</td>
                  <td className={cn(cell, "w-1/2 border-r border-border", r.left?.type === "delete" && "bg-danger-soft")}>
                    {r.left && (r.left.type === "delete" ? <><span className="sr-only">Removed: </span>{r.right ? <Words a={r.left.text} b={r.right.text} side="left" /> : r.left.text}</> : r.left.text)}
                  </td>
                  <td className={cn(num, r.right?.type === "insert" && "bg-success-soft")}>{r.right?.n}</td>
                  <td className={cn(cell, "w-1/2", r.right?.type === "insert" && "bg-success-soft")}>
                    {r.right && (r.right.type === "insert" ? <><span className="sr-only">Added: </span>{r.left ? <Words a={r.left.text} b={r.right.text} side="right" /> : r.right.text}</> : r.right.text)}
                  </td>
                </tr>
              ))
            : ops.slice(0, MAX_ROWS).map((o, i) => (
                <tr key={i} className={o.type === "delete" ? "bg-danger-soft" : o.type === "insert" ? "bg-success-soft" : undefined}>
                  <td className={cn(num, "w-6")}>{o.type === "delete" ? "−" : o.type === "insert" ? "+" : ""}</td>
                  <td className={cell}>
                    <span className="sr-only">{o.type === "delete" ? "Removed: " : o.type === "insert" ? "Added: " : ""}</span>
                    {o.value || " "}
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
      {rows.length > MAX_ROWS && <p className="px-3 py-2 font-sans text-xs text-muted">Showing the first {MAX_ROWS.toLocaleString()} lines.</p>}
    </div>
  );
}

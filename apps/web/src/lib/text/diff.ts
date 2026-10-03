/**
 * Myers O(ND) diff over arbitrary token arrays, plus line and word helpers.
 */

export type DiffOp = { type: "equal" | "insert" | "delete"; value: string };

export function diffTokens(a: string[], b: string[], maxEdits = 20000): DiffOp[] {
  const n = a.length;
  const m = b.length;
  const max = n + m;
  const v = new Map<number, number>([[1, 0]]);
  const trace: Map<number, number>[] = [];
  let found = false;
  for (let d = 0; d <= Math.min(max, maxEdits); d++) {
    trace.push(new Map(v));
    for (let k = -d; k <= d; k += 2) {
      let x = k === -d || (k !== d && (v.get(k - 1) ?? -1) < (v.get(k + 1) ?? -1)) ? (v.get(k + 1) ?? 0) : (v.get(k - 1) ?? 0) + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x++;
        y++;
      }
      v.set(k, x);
      if (x >= n && y >= m) {
        found = true;
        break;
      }
    }
    if (found) break;
  }
  if (!found) {
    // Too different to diff precisely: report as full replacement.
    return [...a.map((value) => ({ type: "delete" as const, value })), ...b.map((value) => ({ type: "insert" as const, value }))];
  }
  // Backtrack
  const ops: DiffOp[] = [];
  let x = n;
  let y = m;
  for (let d = trace.length - 1; d >= 0; d--) {
    const vd = trace[d];
    const k = x - y;
    const prevK = k === -d || (k !== d && (vd.get(k - 1) ?? -1) < (vd.get(k + 1) ?? -1)) ? k + 1 : k - 1;
    const prevX = vd.get(prevK) ?? 0;
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) {
      ops.push({ type: "equal", value: a[x - 1] });
      x--;
      y--;
    }
    if (d > 0) {
      if (x === prevX) ops.push({ type: "insert", value: b[y - 1] });
      else ops.push({ type: "delete", value: a[x - 1] });
    }
    x = prevX;
    y = prevY;
  }
  return ops.reverse();
}

export interface DiffOptions {
  ignoreCase?: boolean;
  ignoreWhitespace?: boolean;
}

function normalise(s: string, o: DiffOptions) {
  let t = s;
  if (o.ignoreWhitespace) t = t.replace(/\s+/g, " ").trim();
  if (o.ignoreCase) t = t.toLowerCase();
  return t;
}

/** Line diff that compares normalised lines but returns original text. */
export function diffLines(a: string, b: string, o: DiffOptions = {}): DiffOp[] {
  const la = a.split(/\r?\n/);
  const lb = b.split(/\r?\n/);
  const ka = la.map((l) => normalise(l, o));
  const kb = lb.map((l) => normalise(l, o));
  const ops = diffTokens(ka, kb);
  let i = 0;
  let j = 0;
  return ops.map((op) => {
    if (op.type === "equal") {
      j++;
      return { type: "equal", value: la[i++] };
    }
    if (op.type === "delete") return { type: "delete", value: la[i++] };
    return { type: "insert", value: lb[j++] };
  });
}

export function diffWords(a: string, b: string): DiffOp[] {
  const tok = (s: string) => s.match(/\s+|[\p{L}\p{M}\p{N}_]+|[^\s\p{L}\p{M}\p{N}_]/gu) ?? [];
  return diffTokens(tok(a), tok(b));
}

export function diffSummary(ops: DiffOp[]) {
  return {
    added: ops.filter((o) => o.type === "insert").length,
    removed: ops.filter((o) => o.type === "delete").length,
    unchanged: ops.filter((o) => o.type === "equal").length,
  };
}

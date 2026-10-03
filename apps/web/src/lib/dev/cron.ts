/**
 * Standard 5-field cron (minute hour day-of-month month day-of-week) parser and scheduler.
 * Matches Vixie cron semantics: when both day-of-month and day-of-week are restricted,
 * a time matches if EITHER matches.
 */

export interface CronField {
  values: Set<number>;
  wildcard: boolean;
}

export interface ParsedCron {
  minute: CronField;
  hour: CronField;
  dom: CronField;
  month: CronField;
  dow: CronField;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const MACROS: Record<string, string> = {
  "@yearly": "0 0 1 1 *",
  "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *",
  "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *",
};

function parseField(src: string, min: number, max: number, names: string[] | null, label: string): CronField {
  const values = new Set<number>();
  const wildcard = src === "*" || src === "?";
  const name = (s: string) => {
    if (names) {
      const i = names.indexOf(s.toLowerCase());
      if (i >= 0) return i + (label === "month" ? 1 : 0);
    }
    if (!/^\d+$/.test(s)) throw new Error(`“${s}” isn't a valid value for ${label}.`);
    return Number(s);
  };
  for (const part of src.split(",")) {
    const [range, stepStr] = part.split("/");
    const step = stepStr === undefined ? 1 : Number(stepStr);
    if (!Number.isInteger(step) || step < 1) throw new Error(`Invalid step “${stepStr}” in ${label}.`);
    let lo: number, hi: number;
    if (range === "*" || range === "?") {
      lo = min;
      hi = max;
    } else if (range.includes("-")) {
      const [a, b] = range.split("-");
      lo = name(a);
      hi = name(b);
    } else {
      lo = name(range);
      hi = stepStr !== undefined ? max : lo;
    }
    if (lo < min || hi > max || lo > hi) throw new Error(`${label} must be between ${min} and ${max}${label === "day of week" ? " (0 or 7 = Sunday)" : ""}.`);
    for (let v = lo; v <= hi; v += step) values.add(v);
  }
  // Both 0 and 7 mean Sunday in the day-of-week field.
  if (label === "day of week" && values.has(7)) {
    values.delete(7);
    values.add(0);
  }
  return { values, wildcard };
}

export function parseCron(expr: string): ParsedCron {
  const e = MACROS[expr.trim().toLowerCase()] ?? expr.trim();
  const f = e.split(/\s+/);
  if (f.length !== 5) throw new Error(`A cron expression needs 5 fields (minute hour day month weekday); this has ${f.length}.`);
  return {
    minute: parseField(f[0], 0, 59, null, "minute"),
    hour: parseField(f[1], 0, 23, null, "hour"),
    dom: parseField(f[2], 1, 31, null, "day of month"),
    month: parseField(f[3], 1, 12, MONTHS, "month"),
    dow: parseField(f[4], 0, 7, DAYS, "day of week"),
  };
}

function dayMatches(c: ParsedCron, d: Date): boolean {
  const domOk = c.dom.values.has(d.getDate());
  const dowOk = c.dow.values.has(d.getDay());
  if (c.dom.wildcard && c.dow.wildcard) return true;
  if (c.dom.wildcard) return dowOk;
  if (c.dow.wildcard) return domOk;
  return domOk || dowOk;
}

/** Next `count` run times after `from`, in the runtime's local time zone. */
export function nextRuns(expr: string, count = 5, from = new Date()): Date[] {
  const c = parseCron(expr);
  const out: Date[] = [];
  const d = new Date(from.getTime());
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1);
  const limit = new Date(from.getTime() + 5 * 366 * 24 * 3600 * 1000);
  while (out.length < count && d < limit) {
    if (!c.month.values.has(d.getMonth() + 1)) {
      d.setMonth(d.getMonth() + 1, 1);
      d.setHours(0, 0, 0, 0);
      continue;
    }
    if (!dayMatches(c, d)) {
      d.setDate(d.getDate() + 1);
      d.setHours(0, 0, 0, 0);
      continue;
    }
    if (!c.hour.values.has(d.getHours())) {
      d.setHours(d.getHours() + 1, 0, 0, 0);
      continue;
    }
    if (!c.minute.values.has(d.getMinutes())) {
      d.setMinutes(d.getMinutes() + 1, 0, 0);
      continue;
    }
    out.push(new Date(d.getTime()));
    d.setMinutes(d.getMinutes() + 1, 0, 0);
  }
  return out;
}

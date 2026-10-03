/** Calendar-date maths on plain Y-M-D values (no time zones involved). */

export interface Ymd {
  y: number;
  m: number; // 1-12
  d: number;
}

export function parseYmd(s: string): Ymd | null {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const v = { y: +m[1], m: +m[2], d: +m[3] };
  return v.m >= 1 && v.m <= 12 && v.d >= 1 && v.d <= daysInMonth(v.y, v.m) ? v : null;
}

export function toYmdString({ y, m, d }: Ymd): string {
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

const toUtc = ({ y, m, d }: Ymd) => Date.UTC(y, m - 1, d);
const fromUtc = (t: number): Ymd => {
  const dt = new Date(t);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
};

export function daysBetween(a: Ymd, b: Ymd): number {
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}

export function weekday(a: Ymd): number {
  return new Date(toUtc(a)).getUTCDay();
}

/** Working days from a to b, counting both ends if inclusive; excludes Sat/Sun and given holidays. */
export function businessDays(a: Ymd, b: Ymd, { includeEnd = true, excludeSaturday = true, holidays = [] as string[] } = {}): number {
  let start = toUtc(a);
  let end = toUtc(b);
  if (start > end) [start, end] = [end, start];
  if (!includeEnd) end -= 86_400_000;
  const hol = new Set(holidays);
  let n = 0;
  for (let t = start; t <= end; t += 86_400_000) {
    const day = new Date(t).getUTCDay();
    if (day === 0 || (excludeSaturday && day === 6)) continue;
    if (hol.has(toYmdString(fromUtc(t)))) continue;
    n++;
  }
  return n;
}

export function addDays(a: Ymd, n: number): Ymd {
  return fromUtc(toUtc(a) + n * 86_400_000);
}

/** Add months, clamping to the end of the month (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(a: Ymd, n: number): Ymd {
  const total = a.y * 12 + (a.m - 1) + n;
  const y = Math.floor(total / 12);
  const m = (total % 12) + 1;
  return { y, m, d: Math.min(a.d, daysInMonth(y, m)) };
}

/**
 * Exact difference in whole years, months and remaining days (like age). Requires a <= b.
 * Counts the largest number of whole months whose clamped anniversary is not after b,
 * so 31 Jan → 1 Mar is 1 month (to 28 Feb) and 1 day.
 */
export function diffYmd(a: Ymd, b: Ymd): { years: number; months: number; days: number } {
  let total = (b.y - a.y) * 12 + (b.m - a.m);
  while (total > 0 && toUtc(addMonths(a, total)) > toUtc(b)) total--;
  const days = daysBetween(addMonths(a, total), b);
  return { years: Math.floor(total / 12), months: total % 12, days };
}

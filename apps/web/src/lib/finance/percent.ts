export const percentOf = (pct: number, of: number) => (pct / 100) * of;
export const whatPercent = (part: number, whole: number) => (whole === 0 ? NaN : (part / whole) * 100);
export const percentChange = (from: number, to: number) => (from === 0 ? NaN : ((to - from) / Math.abs(from)) * 100);
export const increaseBy = (value: number, pct: number) => value * (1 + pct / 100);
export const decreaseBy = (value: number, pct: number) => value * (1 - pct / 100);
/** Original value before a percentage change produced `result`. */
export const reversePercent = (result: number, pct: number) => (pct === -100 ? NaN : result / (1 + pct / 100));

/** Apply discounts one after another (e.g. 50% then 20%). */
export function stackedDiscount(price: number, discountsPct: number[]): { final: number; saved: number; effectivePct: number } {
  const final = discountsPct.reduce((p, d) => p * (1 - d / 100), price);
  return { final, saved: price - final, effectivePct: price === 0 ? 0 : ((price - final) / price) * 100 };
}

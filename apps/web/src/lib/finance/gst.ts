/** GST rates in force since 22 Sep 2025 (GST 2.0). Special rates apply to a few items (e.g. 3% gold, 0.25% rough diamonds). */
export const GST_RATES = [0, 0.25, 3, 5, 18, 40] as const;
export const COMMON_GST_RATES = [5, 18, 40] as const;

export interface GstBreakdown {
  base: number;
  gst: number;
  total: number;
  /** Half of GST each for intra-state supplies. */
  cgst: number;
  sgst: number;
  /** Full GST for inter-state supplies. */
  igst: number;
}

/** amount excludes GST → add it. */
export function addGst(amount: number, ratePct: number): GstBreakdown {
  const gst = (amount * ratePct) / 100;
  return { base: amount, gst, total: amount + gst, cgst: gst / 2, sgst: gst / 2, igst: gst };
}

/** amount includes GST → extract it. base = amount × 100 / (100 + rate). */
export function removeGst(amount: number, ratePct: number): GstBreakdown {
  const base = (amount * 100) / (100 + ratePct);
  const gst = amount - base;
  return { base, gst, total: amount, cgst: gst / 2, sgst: gst / 2, igst: gst };
}

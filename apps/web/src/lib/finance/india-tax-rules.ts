/**
 * Indian income-tax parameters for individuals (salary income).
 *
 * Source year: FY 2026-27 / tax year 2026-27. Union Budget 2026 left FY 2025-26 rates,
 * the standard deduction, the s.87A rebate, surcharge and cess unchanged.
 * Update this file — and only this file — when rules change.
 */

export interface Slab {
  /** Upper limit of the slab (inclusive); Infinity for the top slab. */
  upTo: number;
  ratePct: number;
}

export const TAX_YEAR_LABEL = "FY 2026-27";

export const NEW_REGIME = {
  slabs: [
    { upTo: 400_000, ratePct: 0 },
    { upTo: 800_000, ratePct: 5 },
    { upTo: 1_200_000, ratePct: 10 },
    { upTo: 1_600_000, ratePct: 15 },
    { upTo: 2_000_000, ratePct: 20 },
    { upTo: 2_400_000, ratePct: 25 },
    { upTo: Infinity, ratePct: 30 },
  ] as Slab[],
  standardDeduction: 75_000,
  rebateIncomeLimit: 1_200_000,
  rebateMax: 60_000,
  /** Surcharge thresholds; new regime caps surcharge at 25%. */
  surcharge: [
    { above: 5_000_000, ratePct: 10 },
    { above: 10_000_000, ratePct: 15 },
    { above: 20_000_000, ratePct: 25 },
  ],
};

export type AgeGroup = "below60" | "60to80" | "above80";

export const OLD_REGIME = {
  slabs: {
    below60: [
      { upTo: 250_000, ratePct: 0 },
      { upTo: 500_000, ratePct: 5 },
      { upTo: 1_000_000, ratePct: 20 },
      { upTo: Infinity, ratePct: 30 },
    ],
    "60to80": [
      { upTo: 300_000, ratePct: 0 },
      { upTo: 500_000, ratePct: 5 },
      { upTo: 1_000_000, ratePct: 20 },
      { upTo: Infinity, ratePct: 30 },
    ],
    above80: [
      { upTo: 500_000, ratePct: 0 },
      { upTo: 1_000_000, ratePct: 20 },
      { upTo: Infinity, ratePct: 30 },
    ],
  } as Record<AgeGroup, Slab[]>,
  standardDeduction: 50_000,
  rebateIncomeLimit: 500_000,
  rebateMax: 12_500,
  section80CLimit: 150_000,
  surcharge: [
    { above: 5_000_000, ratePct: 10 },
    { above: 10_000_000, ratePct: 15 },
    { above: 20_000_000, ratePct: 25 },
    { above: 50_000_000, ratePct: 37 },
  ],
};

export const CESS_PCT = 4;

/** EPF parameters. */
export const EPF = {
  /** Interest rate declared for FY 2025-26 (ratified July 2026). */
  interestRatePct: 8.25,
  interestRateYear: "FY 2025-26",
  employeeRatePct: 12,
  employerRatePct: 12,
  epsRatePct: 8.33,
  /** Statutory wage ceiling for EPS and mandatory PF. */
  wageCeiling: 15_000,
};

/** Gratuity is commonly budgeted in CTC at 15/26 days per year ÷ 12 months of basic ≈ 4.81%. */
export const GRATUITY_PCT_OF_BASIC = (15 / 26 / 12) * 100;

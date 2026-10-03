import type { ReactNode } from "react";
import type { Faq } from "@/lib/convert/catalog";

export type { Faq };

/** Long-form, server-rendered content shown under a tool. */
export interface ToolContent {
  /** "How to use" — short imperative steps. */
  steps: string[];
  /** Explanatory sections with H2 headings (what it is, how it works, formula, tips…). */
  sections: { heading: string; body: ReactNode }[];
  /** Worked example. */
  example?: { heading?: string; body: ReactNode };
  faqs: Faq[];
}

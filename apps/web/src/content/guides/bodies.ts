import "server-only";
import type { ComponentType } from "react";

export const GUIDE_BODIES: Record<string, () => Promise<{ default: ComponentType }>> = {
  "how-emi-is-calculated": () => import("./how-emi-is-calculated"),
  "ctc-vs-in-hand-salary": () => import("./ctc-vs-in-hand-salary"),
  "sip-returns-explained": () => import("./sip-returns-explained"),
  "jpg-vs-png-vs-webp": () => import("./jpg-vs-png-vs-webp"),
  "reduce-pdf-file-size": () => import("./reduce-pdf-file-size"),
  "csv-vs-excel": () => import("./csv-vs-excel"),
  "what-is-a-jwt": () => import("./what-is-a-jwt"),
  "browser-file-processing": () => import("./browser-file-processing"),
};

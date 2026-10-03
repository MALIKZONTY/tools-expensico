import type { ConversionDef } from "@/lib/convert/catalog";

export type OptionValues = Record<string, string | number | boolean>;

export interface ProgressUpdate {
  /** 0–1, or undefined for indeterminate work. */
  value?: number;
  label: string;
}

export interface ConversionInput {
  files: File[];
  options: OptionValues;
  signal: AbortSignal;
  onProgress: (p: ProgressUpdate) => void;
}

export type PreviewKind = "image" | "text" | "html" | "pdf" | "table" | "none";

export interface OutputFile {
  name: string;
  blob: Blob;
  preview: PreviewKind;
  /** Short description, e.g. "Page 3 · 1240 × 1754 px". */
  meta?: string;
  /** Size of the input this output came from (for "saved X%" comparisons). */
  sourceSize?: number;
}

export interface ConversionResult {
  files: OutputFile[];
  /** Non-fatal notes shown to the user (e.g. "Page 4 contained no text"). */
  warnings: string[];
}

/** A browser-side implementation of one ImplId. */
export type BrowserImplementation = (def: ConversionDef, input: ConversionInput) => Promise<ConversionResult>;

/**
 * The processing engine abstraction. The UI only talks to this interface; whether work
 * happens in the browser or on the processor service is decided by the conversion definition.
 */
export interface ProcessingEngine {
  readonly kind: "browser" | "remote";
  convert(def: ConversionDef, input: ConversionInput): Promise<ConversionResult>;
}

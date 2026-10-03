import { PROCESSOR_LIMITS } from "@expensico/processing-contract";
import type { ConversionDef } from "@/lib/convert/catalog";
import { FORMATS } from "@/lib/convert/formats";

const MB = 1024 * 1024;

/** Per-file size limits for browser processing, chosen to stay within typical device memory. */
export function maxBytesFor(def: ConversionDef): number {
  if (def.engine === "server") return PROCESSOR_LIMITS.maxFileBytes;
  switch (FORMATS[def.from].family) {
    case "document":
      return def.from === "pdf" ? 300 * MB : 50 * MB;
    case "image":
      return 60 * MB;
    case "spreadsheet":
    case "data":
      return 100 * MB;
    default:
      return 50 * MB;
  }
}

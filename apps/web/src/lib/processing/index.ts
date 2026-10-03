import type { ConversionDef } from "@/lib/convert/catalog";
import { isConversionAvailable } from "@/lib/convert/catalog";
import { ToolError } from "@/lib/files/errors";
import { browserEngine } from "./browser-engine";
import { remoteEngine } from "./remote-engine";
import type { ConversionInput, ConversionResult, ProcessingEngine } from "./types";

export * from "./types";

export function engineFor(def: ConversionDef): ProcessingEngine {
  return def.engine === "server" ? remoteEngine : browserEngine;
}

/** Single entry point the UI uses for every conversion. */
export async function runConversion(def: ConversionDef, input: ConversionInput): Promise<ConversionResult> {
  if (!isConversionAvailable(def)) throw new ToolError("server-unavailable", "This conversion isn't available yet.");
  if (input.signal.aborted) throw new ToolError("cancelled");
  return engineFor(def).convert(def, input);
}

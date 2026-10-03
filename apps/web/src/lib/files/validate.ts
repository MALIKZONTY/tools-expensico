import { FORMATS, type FormatId, formatLabelList } from "@/lib/convert/formats";
import { formatBytes } from "@/lib/format";
import { detectFile, type Detection } from "./detect";
import { ToolError } from "./errors";

export interface ValidateOptions {
  accept: FormatId[];
  maxBytes: number;
  allowEmpty?: boolean;
}

export interface ValidatedFile {
  file: File;
  format: FormatId;
  detection: Detection;
}

/**
 * Validates a file by content (magic bytes), not by name. Throws a ToolError with a
 * user-friendly explanation when the file can't be used.
 */
export async function validateFile(file: File, { accept, maxBytes, allowEmpty }: ValidateOptions): Promise<ValidatedFile> {
  if (file.size > maxBytes) {
    throw new ToolError("too-large", `“${file.name}” is ${formatBytes(file.size)}. The limit for this tool is ${formatBytes(maxBytes)}.`);
  }
  if (file.size === 0 && !allowEmpty) throw new ToolError("empty", `“${file.name}” is 0 bytes.`);

  const detection = await detectFile(file);
  const format = detection.format;

  if (!format) {
    throw new ToolError("unsupported", `We couldn't recognise “${file.name}” (${detection.description}). Supported: ${formatLabelList(accept)}.`);
  }
  if (!accept.includes(format)) {
    const claimed = detection.extensionFormat;
    if (claimed && accept.includes(claimed) && detection.mismatch) {
      throw new ToolError(
        "invalid-format",
        `“${file.name}” is named like a ${FORMATS[claimed].label} file, but its contents are ${FORMATS[format].label}. Rename it or use a tool for ${FORMATS[format].label} files.`,
        { title: "The file's contents don't match its name" },
      );
    }
    throw new ToolError("unsupported", `“${file.name}” is a ${FORMATS[format].label} file. This tool accepts: ${formatLabelList(accept)}.`);
  }
  return { file, format, detection };
}

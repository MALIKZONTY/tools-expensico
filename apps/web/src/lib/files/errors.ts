/**
 * User-facing error model shared by every tool. Raw exceptions are never shown; they are
 * mapped to one of these codes with a plain-language message and a recovery hint.
 */

export type ToolErrorCode =
  | "unsupported"
  | "too-large"
  | "empty"
  | "corrupted"
  | "invalid-format"
  | "encrypted"
  | "conversion-failed"
  | "browser-unsupported"
  | "network"
  | "server-unavailable"
  | "rate-limited"
  | "too-many-files"
  | "cancelled"
  | "unknown";

const DEFAULTS: Record<ToolErrorCode, { title: string; hint: string }> = {
  unsupported: { title: "This file type isn't supported here", hint: "Check the list of supported formats above, or try the universal converter." },
  "too-large": { title: "This file is too large", hint: "Try a smaller file, or compress/split it first." },
  empty: { title: "This file is empty", hint: "The file contains no data. Check that it saved correctly and try again." },
  corrupted: { title: "This file looks damaged", hint: "It may be incomplete or corrupted. Try re-downloading or re-exporting it." },
  "invalid-format": { title: "The content isn't valid", hint: "Fix the problem described below and try again." },
  encrypted: { title: "This file is password-protected", hint: "Remove the password in the app that created it, then try again." },
  "conversion-failed": { title: "The conversion didn't complete", hint: "Try again. If it keeps failing, the file may use features we can't process yet." },
  "browser-unsupported": { title: "Your browser can't do this", hint: "Update your browser, or try the latest Chrome, Edge, Firefox or Safari." },
  network: { title: "Connection problem", hint: "Check your internet connection and try again." },
  "server-unavailable": { title: "The conversion service is unavailable", hint: "Please try again in a few minutes." },
  "rate-limited": { title: "Too many requests", hint: "Please wait a minute before trying again." },
  "too-many-files": { title: "Too many files", hint: "Remove some files and try again." },
  cancelled: { title: "Cancelled", hint: "" },
  unknown: { title: "Something went wrong", hint: "Try again. If the problem continues, please report it using the feedback link on this page." },
};

export class ToolError extends Error {
  readonly code: ToolErrorCode;
  readonly title: string;
  readonly hint: string;
  /** Extra specifics safe to show the user (e.g. "Unexpected token at line 3, column 7"). */
  readonly detail?: string;

  constructor(code: ToolErrorCode, detail?: string, overrides?: { title?: string; hint?: string }) {
    super(detail ?? DEFAULTS[code].title);
    this.name = "ToolError";
    this.code = code;
    this.title = overrides?.title ?? DEFAULTS[code].title;
    this.hint = overrides?.hint ?? DEFAULTS[code].hint;
    this.detail = detail;
  }
}

/** Map anything thrown by a library to a ToolError. */
export function toToolError(err: unknown): ToolError {
  if (err instanceof ToolError) return err;
  const e = err as { name?: string; message?: string } | undefined;
  const name = e?.name ?? "";
  const message = e?.message ?? "";

  if (name === "AbortError") return new ToolError("cancelled");
  if (name === "PasswordException" || /password/i.test(message)) return new ToolError("encrypted");
  if (name === "InvalidPDFException" || /invalid pdf|no pdf header|bad xref/i.test(message)) return new ToolError("corrupted", "The PDF structure couldn't be read.");
  if (/encrypted/i.test(message)) return new ToolError("encrypted");
  if (name === "QuotaExceededError" || /out of memory|allocation failed|array buffer allocation/i.test(message)) {
    return new ToolError("too-large", undefined, { title: "Your device ran out of memory", hint: "Try a smaller file, fewer pages or a lower resolution. Closing other tabs can also help." });
  }
  if (name === "EncodingError" || /decode|unsupported image/i.test(message)) return new ToolError("corrupted", "The image couldn't be decoded.");
  if (name === "TypeError" && /fetch|network/i.test(message)) return new ToolError("network");
  if (/zip|central directory|end of data/i.test(message)) return new ToolError("corrupted", "The archive structure couldn't be read.");
  return new ToolError("unknown");
}

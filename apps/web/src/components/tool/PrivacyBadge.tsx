import { CloudUpload, Laptop, ShieldCheck } from "lucide-react";
import type { ProcessingMode } from "@/registry/tools";

const COPY: Record<ProcessingMode, { label: string; detail: string; tone: "local" | "server" }> = {
  "local-file": {
    label: "Runs in your browser",
    detail: "Your files are processed on your device and are never uploaded.",
    tone: "local",
  },
  local: {
    label: "Runs in your browser",
    detail: "Everything you enter stays on your device. Nothing is sent to a server.",
    tone: "local",
  },
  server: {
    label: "Uploads for processing",
    detail: "Your file is sent over HTTPS to our conversion server and deleted immediately after conversion.",
    tone: "server",
  },
  hybrid: {
    label: "Runs in your browser",
    detail: "By default your file never leaves your device. An optional server mode is clearly marked and uploads only if you choose it.",
    tone: "local",
  },
};

export function PrivacyBadge({ mode }: { mode: ProcessingMode }) {
  const c = COPY[mode];
  const Icon = c.tone === "server" ? CloudUpload : mode === "local" ? ShieldCheck : Laptop;
  return (
    <p className="flex items-start gap-2 text-sm text-muted">
      <Icon aria-hidden className={c.tone === "server" ? "mt-0.5 size-4 shrink-0 text-info" : "mt-0.5 size-4 shrink-0 text-success"} />
      <span>
        <span className="font-medium text-fg">{c.label}.</span> {c.detail}
      </span>
    </p>
  );
}

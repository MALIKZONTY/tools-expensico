import { CloudUpload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ConversionDef } from "@/lib/convert/catalog";

const LABEL: Record<ConversionDef["quality"], { text: string; tone: "success" | "info" | "warning" }> = {
  exact: { text: "Exact conversion", tone: "success" },
  high: { text: "High fidelity", tone: "info" },
  basic: { text: "Basic conversion", tone: "warning" },
};

export function QualityNote({ def, inline }: { def: ConversionDef; /** Centred one-liner under the hero picker. */ inline?: boolean }) {
  const q = LABEL[def.quality];
  if (inline) {
    return (
      <p className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-muted">
        <Badge tone={q.tone}>{q.text}</Badge>
        {def.engine === "server" && (
          <Badge tone="info" icon={<CloudUpload aria-hidden />}>
            Uploads file
          </Badge>
        )}
        <span>{def.qualityNote}</span>
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm sm:flex-row sm:items-start sm:gap-3">
      <div className="flex shrink-0 flex-wrap gap-1.5">
        <Badge tone={q.tone}>{q.text}</Badge>
        {def.engine === "server" && (
          <Badge tone="info" icon={<CloudUpload aria-hidden />}>
            Uploads file
          </Badge>
        )}
      </div>
      <p className="text-muted">{def.qualityNote}</p>
    </div>
  );
}

import { cn } from "@/lib/cn";
import type { FormatId } from "@/lib/convert/formats";

/** Familiar colours per format (Word blue, Excel green, PDF red …) and the label printed on the sheet. */
const STYLE: Record<FormatId, { label: string; bg: string; fg?: string }> = {
  pdf: { label: "PDF", bg: "#e5322d" },
  jpg: { label: "JPG", bg: "#f5b400", fg: "#3a2a00" },
  png: { label: "PNG", bg: "#f5b400", fg: "#3a2a00" },
  webp: { label: "WEBP", bg: "#f5b400", fg: "#3a2a00" },
  gif: { label: "GIF", bg: "#f5b400", fg: "#3a2a00" },
  bmp: { label: "BMP", bg: "#f5b400", fg: "#3a2a00" },
  avif: { label: "AVIF", bg: "#f5b400", fg: "#3a2a00" },
  svg: { label: "SVG", bg: "#f08a24" },
  docx: { label: "DOCX", bg: "#2b5cb8" },
  doc: { label: "DOC", bg: "#2b5cb8" },
  odt: { label: "ODT", bg: "#2b5cb8" },
  rtf: { label: "RTF", bg: "#2b5cb8" },
  xlsx: { label: "XLSX", bg: "#1d7a45" },
  xls: { label: "XLS", bg: "#1d7a45" },
  ods: { label: "ODS", bg: "#1d7a45" },
  csv: { label: "CSV", bg: "#22a06b" },
  tsv: { label: "TSV", bg: "#22a06b" },
  pptx: { label: "PPTX", bg: "#d24726" },
  ppt: { label: "PPT", bg: "#d24726" },
  odp: { label: "ODP", bg: "#d24726" },
  json: { label: "JSON", bg: "#475569" },
  xml: { label: "XML", bg: "#0e7490" },
  yaml: { label: "YAML", bg: "#0e7490" },
  html: { label: "HTML", bg: "#e44d26" },
  md: { label: "MD", bg: "#334155" },
  txt: { label: "TXT", bg: "#64748b" },
  zip: { label: "ZIP", bg: "#7c5cdb" },
};

/** Extra labels for viewers whose files aren't conversion formats. */
const EXTRA: Record<string, { label: string; bg: string; fg?: string }> = {
  js: { label: "JS", bg: "#f0c800", fg: "#2b2400" },
};

export function hasDocStyle(id: string): boolean {
  return id in STYLE || id in EXTRA;
}

/** A realistic document sheet: white page, folded corner, a few text lines and a coloured format band. */
export function DocSheet({ format, className }: { format: string; className?: string }) {
  const s = STYLE[format as FormatId] ?? EXTRA[format] ?? STYLE.txt;
  const long = s.label.length > 3;
  return (
    <svg aria-hidden viewBox="0 0 40 48" className={cn("drop-shadow-[0_2px_3px_rgb(15_23_42/0.18)]", className)}>
      <path d="M8 1.5h17.5L36.5 12.5V42a4.5 4.5 0 0 1-4.5 4.5H8A4.5 4.5 0 0 1 3.5 42V6A4.5 4.5 0 0 1 8 1.5Z" fill="#fff" stroke="#d7dce4" />
      <path d="M25.5 1.5V9a3.5 3.5 0 0 0 3.5 3.5h7.5" fill="#edf0f5" stroke="#d7dce4" strokeLinejoin="round" />
      <rect x="9" y="9" width="11" height="2" rx="1" fill="#e2e6ed" />
      <rect x="9" y="15" width="21" height="2" rx="1" fill="#e2e6ed" />
      <rect x="9" y="20" width="17" height="2" rx="1" fill="#e2e6ed" />
      <rect x="0.5" y="26" width={long ? 31 : 27} height="13" rx="3" fill={s.bg} />
      <text
        x={long ? 16 : 14}
        y="35.4"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontWeight="800"
        fontSize={long ? 7.4 : 8.4}
        letterSpacing="0.2"
        fill={s.fg ?? "#fff"}
      >
        {s.label}
      </text>
    </svg>
  );
}

/** Two overlapping document sheets (source behind, target in front): the converter icon. */
export function FormatPairIcon({ from, to, className }: { from: FormatId; to: FormatId; className?: string }) {
  return (
    <span aria-hidden className={cn("relative inline-block size-12 shrink-0", className)}>
      <DocSheet format={from} className="absolute left-0 top-0 h-[78%] -rotate-6 opacity-95" />
      <DocSheet format={to} className="absolute bottom-0 right-0 h-[78%]" />
    </span>
  );
}

/** Single document sheet, e.g. beside a converter in a menu. */
export function FormatBadge({ id, className }: { id: FormatId; className?: string }) {
  return <DocSheet format={id} className={cn("h-7 w-auto shrink-0", className)} />;
}

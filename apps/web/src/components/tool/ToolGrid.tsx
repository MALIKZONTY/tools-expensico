import Link from "next/link";
import { cn } from "@/lib/cn";
import { toolPath, type ToolMeta } from "@/registry/tools";
import { getConversion } from "@/lib/convert/catalog";
import { FormatPairIcon } from "./FormatPairIcon";
import { ToolIcon, hasIcon } from "./tool-icon";

/** Icon key for a tool: its own icon, or the generic converter icon. */
export function iconKey(tool: ToolMeta): string {
  return hasIcon(tool.slug) ? tool.slug : tool.kind === "converter" ? "@convert" : "@fallback";
}

/** Short display name for cards and menus: "PDF to Word (DOCX) — Editable Text" → "PDF to Word". */
export function cardTitle(title: string): string {
  return title.replace(/\s+—.*$/, "").replace(/\s*\(.*?\)/g, "").replace(/ Converter$/, "").trim();
}

export function ToolGlyph({ tool, size = "lg" }: { tool: ToolMeta; size?: "md" | "lg" }) {
  const def = tool.conversionSlug ? getConversion(tool.conversionSlug) : undefined;
  if (def) return <FormatPairIcon from={def.from} to={def.to} className={size === "md" ? "size-10" : "size-14"} />;
  return <ToolIcon name={iconKey(tool)} category={tool.category} size={size} className={size === "lg" ? "size-14 rounded-2xl" : undefined} />;
}

/** First sentence of a tool's description — cards stay short and scannable. */
export function cardSummary(description: string): string {
  const m = description.match(/^.*?[.!?](?=\s|$)/);
  return (m ? m[0] : description).trim();
}

export function ToolLinkCard({ tool, className, badge }: { tool: ToolMeta; className?: string; badge?: string }) {
  return (
    <Link
      href={toolPath(tool)}
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-border bg-surface p-4 transition-[border-color,box-shadow,transform] duration-150",
        "hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md sm:p-6",
        className,
      )}
    >
      {badge && (
        <span className="absolute right-3 top-3 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-soft-fg sm:right-4 sm:top-4">{badge}</span>
      )}
      <ToolGlyph tool={tool} />
      <span className="mt-3 block text-[0.9375rem] font-semibold leading-snug text-fg sm:mt-4 sm:text-lg">{cardTitle(tool.title)}</span>
      <span className="mt-1.5 hidden text-sm leading-relaxed text-muted sm:line-clamp-3 sm:block">{cardSummary(tool.description)}</span>
    </Link>
  );
}

export function ToolGrid({ tools, className }: { tools: ToolMeta[]; className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5", className)}>
      {tools.map((t) => (
        <li key={t.slug} className="min-w-0">
          <ToolLinkCard tool={t} />
        </li>
      ))}
    </ul>
  );
}

/** Compact two-column link list for dense directories. */
export function ToolLinkList({ tools }: { tools: ToolMeta[] }) {
  return (
    <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
      {tools.map((t) => (
        <li key={t.slug} className="min-w-0">
          <Link href={toolPath(t)} className="group flex min-w-0 items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-2">
            <ToolIcon name={iconKey(t)} category={t.category} size="sm" />
            <span className="min-w-0 truncate text-[0.9375rem] text-fg group-hover:text-brand">{t.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

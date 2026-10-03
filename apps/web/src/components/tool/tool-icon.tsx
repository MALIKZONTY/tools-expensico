import { cn } from "@/lib/cn";
import type { CategoryId } from "@/registry/categories";
import { DocSheet } from "./FormatPairIcon";
import { ICON_MAP } from "./icons.generated";

/** Icon keys: a tool slug, "@category-<id>", "@convert", "@notes". */
export function hasIcon(key: string): boolean {
  return key in ICON_MAP;
}

function Part({ spec, className }: { spec: string; className?: string }) {
  const [kind, value] = spec.split(":");
  if (kind === "doc") return <DocSheet format={value} className={cn("h-full w-auto", className)} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small static SVGs; next/image adds nothing here
    <img src={`/icons/${value}.svg`} alt="" width={64} height={64} loading="lazy" decoding="async" draggable={false} className={cn("size-full select-none", className)} />
  );
}

/** Realistic icon on its own: a Fluent Emoji image or a document sheet, optionally with an action badge. */
export function RealIcon({ name, className }: { name: string; className?: string }) {
  const [base, badge] = (ICON_MAP[name] ?? ICON_MAP["@fallback"]).split("+");
  if (!badge) return <Part spec={base} className={className} />;
  return (
    <span className={cn("relative flex size-full items-center justify-center", className)}>
      <Part spec={base} className="pr-[14%] pb-[6%]" />
      <span className="absolute -bottom-[4%] -right-[4%] size-[58%] drop-shadow-[0_1px_2px_rgb(15_23_42/0.3)]">
        <Part spec={badge} />
      </span>
    </span>
  );
}

type Tone = CategoryId | "notes";

const tileTone: Record<CategoryId, string> = {
  files: "from-[var(--cat-files-soft)]",
  pdf: "from-[var(--cat-pdf-soft)]",
  convert: "from-[var(--cat-convert-soft)]",
  finance: "from-[var(--cat-finance-soft)]",
  productivity: "from-[var(--cat-productivity-soft)]",
  developer: "from-[var(--cat-developer-soft)]",
};

/** Realistic icon on a soft, category-tinted tile. */
export function ToolIcon({ name, category, size = "md", className }: { name: string; category: Tone; size?: "xs" | "sm" | "md" | "lg" | "xl"; className?: string }) {
  const c: CategoryId = category === "notes" ? "productivity" : category;
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-gradient-to-br to-surface ring-1 ring-inset ring-border/70",
        tileTone[c],
        size === "xs" && "size-7 rounded-lg p-0.5",
        size === "sm" && "size-8 rounded-lg p-1",
        size === "md" && "size-10 rounded-xl p-1",
        size === "lg" && "size-12 rounded-[14px] p-1.5",
        size === "xl" && "size-16 rounded-2xl p-2",
        className,
      )}
    >
      <RealIcon name={name} />
    </span>
  );
}

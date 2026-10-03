import { site } from "@/config/site";
import { cn } from "@/lib/cn";

/*
 * Expensico mark: a bold "E" whose top-right corner is a folded page (documents) and whose
 * middle bar is angled (forward motion). Geometry is on a 64×64 grid and shared by the
 * favicon (app/icon.svg) and the Open Graph image, so keep them in sync.
 */
export const MARK_PATHS = {
  spine: "M18 8h4v48h-4A10 10 0 0 1 8 46V18A10 10 0 0 1 18 8Z",
  top: "M20 8h21l11 11a2 2 0 0 1-2 2H20Z",
  fold: "M41 8v8a3 3 0 0 0 3 3h8Z",
  middle: "M20 25.5h26.4a1.8 1.8 0 0 1 1.5 2.8l-5.6 9a1.8 1.8 0 0 1-1.5.7H20Z",
  bottom: "M20 43h29.5a6.5 6.5 0 0 1 0 13H20Z",
} as const;

/** Gradient mark for light and dark surfaces. `id` keeps gradient ids unique when the mark appears twice on a page. */
export function LogoMark({ className, id = "m" }: { className?: string; id?: string }) {
  const g = (n: string) => `ex-${id}-${n}`;
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("size-8 shrink-0", className)}>
      <defs>
        <linearGradient id={g("bars")} x1="20" y1="8" x2="40" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#10b981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id={g("spine")} x1="8" y1="8" x2="22" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0ea371" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
        <linearGradient id={g("mid")} x1="20" y1="0" x2="44" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ecfdf5" stopOpacity="0.3" />
          <stop offset="1" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={g("fold")} x1="41" y1="19" x2="50" y2="9" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#a7f3d0" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <path d={MARK_PATHS.top} fill={`url(#${g("bars")})`} />
      <path d={MARK_PATHS.middle} fill={`url(#${g("bars")})`} />
      <path d={MARK_PATHS.middle} fill={`url(#${g("mid")})`} />
      <path d={MARK_PATHS.bottom} fill={`url(#${g("bars")})`} />
      <path d={MARK_PATHS.spine} fill={`url(#${g("spine")})`} />
      <path d={MARK_PATHS.fold} fill={`url(#${g("fold")})`} />
    </svg>
  );
}

/** App-icon tile: white "E" on the green gradient square. */
export function AppIcon({ className, id = "a" }: { className?: string; id?: string }) {
  const g = (n: string) => `ex-${id}-${n}`;
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("size-10 shrink-0", className)}>
      <defs>
        <linearGradient id={g("tile")} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#10b981" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
        <linearGradient id={g("e")} x1="0" y1="6" x2="0" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d1fae5" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#${g("tile")})`} />
      <g transform="translate(12.8 12.8) scale(0.6)" fill={`url(#${g("e")})`}>
        <path d={MARK_PATHS.spine} />
        <path d={MARK_PATHS.top} />
        <path d={MARK_PATHS.middle} />
        <path d={MARK_PATHS.bottom} />
        <path d={MARK_PATHS.fold} fill="#6ee7b7" />
      </g>
    </svg>
  );
}

export function Logo({ className, id, slogan }: { className?: string; id?: string; slogan?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark id={id} className="size-8" />
      <span className="flex flex-col leading-none">
        <span className="text-[1.25rem] font-extrabold tracking-[-0.03em] text-fg">{site.name}</span>
        {slogan && <span className="mt-1 text-xs font-medium text-muted">{site.slogan}</span>}
      </span>
    </span>
  );
}

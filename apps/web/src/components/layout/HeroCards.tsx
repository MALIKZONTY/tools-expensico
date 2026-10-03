import Link from "next/link";
import { RealIcon } from "@/components/tool/tool-icon";
import { cn } from "@/lib/cn";

/** Category shortcuts floating beside the homepage headline (wide screens only). */
const CARDS = [
  { label: "PDF Tools", href: "/pdf", icon: "@category-pdf", pos: "left-[3%] top-[9%]", tilt: "-rotate-6", delay: "0s" },
  { label: "Convert", href: "/convert", icon: "@category-convert", pos: "left-[11%] top-[40%]", tilt: "rotate-[5deg]", delay: "-2s" },
  { label: "Image Tools", href: "/tools", icon: "image-viewer", pos: "left-[2%] top-[64%]", tilt: "-rotate-[4deg]", delay: "-4s" },
  { label: "Finance", href: "/finance", icon: "sip-calculator", pos: "right-[11%] top-[8%]", tilt: "rotate-[4deg]", delay: "-1s" },
  { label: "Productivity", href: "/productivity", icon: "@category-productivity", pos: "right-[2%] top-[32%]", tilt: "rotate-[6deg]", delay: "-3s" },
  { label: "Developer", href: "/developer", icon: "@category-developer", pos: "right-[12%] top-[56%]", tilt: "-rotate-[5deg]", delay: "-5s" },
  { label: "Notes", href: "/notes", icon: "@notes", pos: "right-[2%] top-[68%]", tilt: "rotate-[5deg]", delay: "-2.5s" },
];

export function HeroCards() {
  return (
    <nav aria-label="Browse by category" className="pointer-events-none absolute inset-0 hidden xl:block">
      {CARDS.map((c) => (
        <div key={c.label} className={cn("absolute", c.pos)}>
          <div className={c.tilt}>
            <Link
              href={c.href}
              style={{ animationDelay: c.delay }}
              className="hero-float pointer-events-auto flex w-[7.5rem] flex-col items-center gap-2.5 rounded-2xl border border-border/80 bg-surface/90 px-3 py-4 text-sm font-semibold text-fg shadow-[0_12px_30px_-12px_rgb(15_23_42/0.25)] backdrop-blur transition-[box-shadow,transform] hover:-translate-y-1 hover:shadow-[0_18px_36px_-12px_rgb(15_23_42/0.3)]"
            >
              <span className="size-11">
                <RealIcon name={c.icon} />
              </span>
              {c.label}
            </Link>
          </div>
        </div>
      ))}
    </nav>
  );
}

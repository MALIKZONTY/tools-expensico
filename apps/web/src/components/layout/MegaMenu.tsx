"use client";

import type { PointerEvent } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CategoryMenu, MenuLink } from "@/registry/menu";
import { cn } from "@/lib/cn";
import { FormatBadge, FormatPairIcon } from "@/components/tool/FormatPairIcon";
import { ToolIcon } from "@/components/tool/tool-icon";

const asideTone: Record<CategoryMenu["id"], string> = {
  files: "from-[var(--cat-files-soft)]",
  pdf: "from-[var(--cat-pdf-soft)]",
  convert: "from-[var(--cat-convert-soft)]",
  finance: "from-[var(--cat-finance-soft)]",
  productivity: "from-[var(--cat-productivity-soft)]",
  developer: "from-[var(--cat-developer-soft)]",
};

interface CategoryPanelProps {
  id: string;
  menu: CategoryMenu;
  onNavigate: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: (e: PointerEvent) => void;
}

function ToolItem({ link, onNavigate }: { link: MenuLink; onNavigate: () => void }) {
  return (
    <Link href={link.href} onClick={onNavigate} className="group/item flex min-w-0 items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface-2">
      {link.from && link.format ? (
        <FormatPairIcon from={link.from} to={link.format} className="size-10 transition-transform duration-150 group-hover/item:scale-105" />
      ) : (
        <ToolIcon name={link.icon} category={link.category} size="md" className="transition-transform duration-150 group-hover/item:scale-105" />
      )}
      <span className="min-w-0 pt-0.5">
        <span className="block truncate text-[0.9375rem] font-semibold text-fg group-hover/item:text-brand">{link.title}</span>
        <span className="mt-0.5 block truncate text-[0.8125rem] text-muted">{link.summary}</span>
      </span>
    </Link>
  );
}

function ConvertItem({ link, onNavigate }: { link: MenuLink; onNavigate: () => void }) {
  return (
    <Link href={link.href} onClick={onNavigate} className="flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium text-fg transition-colors hover:bg-surface-2 hover:text-brand">
      {link.format && <FormatBadge id={link.format} />}
      <span className="truncate">{link.title}</span>
    </Link>
  );
}

/** Floating dropdown for one category: intro on the left, its tools on the right. */
export function MegaMenu({ id, menu, onNavigate, onPointerEnter, onPointerLeave }: CategoryPanelProps) {
  const isConvert = menu.id === "convert";
  const links = menu.columns.flatMap((c) => c.links);

  return (
    // The top padding is a hover bridge between the header button and the card.
    <div id={id} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} className="absolute inset-x-0 top-full px-4 pt-2 sm:px-6 lg:px-8">
      <div className="mega-panel mx-auto flex max-h-[calc(100dvh-6rem)] max-w-6xl overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_60px_-20px_rgb(0_0_0/0.25)]">
        <aside className={cn("flex w-64 shrink-0 flex-col bg-gradient-to-b to-surface p-6", asideTone[menu.id])}>
          <ToolIcon name={`@category-${menu.id}`} category={menu.id} size="lg" />
          <p className="mt-4 text-lg font-bold tracking-tight text-fg">{menu.title}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{menu.description}</p>
          <div className="mt-auto flex flex-col gap-2 pt-6">
            <Link
              href={menu.href}
              onClick={onNavigate}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-fg px-4 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
            >
              View all {menu.total} <ArrowRight aria-hidden className="size-4" />
            </Link>
            {isConvert && (
              <Link href="/convert" onClick={onNavigate} className="text-center text-sm font-medium text-brand hover:underline">
                Universal file converter
              </Link>
            )}
          </div>
        </aside>

        <div className="min-w-0 flex-1 overflow-y-auto p-4">
          {isConvert ? (
            <div className="columns-3 gap-x-4 p-2">
              {menu.columns.map((col) => (
                <div key={col.id} className="mb-5 min-w-0 break-inside-avoid">
                  <p className="px-2 text-xs font-semibold uppercase tracking-wide text-subtle">{col.title}</p>
                  <ul className="mt-2 grid grid-cols-1 gap-0.5">
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <ConvertItem link={l} onNavigate={onNavigate} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <ul className="grid grid-cols-3 gap-1">
              {links.map((l) => (
                <li key={l.href} className="min-w-0">
                  <ToolItem link={l} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

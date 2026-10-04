"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Kbd } from "@/components/ui/kbd";
import { useClientValue } from "@/hooks/use-mounted";
import type { CategoryMenu, MenuColumn } from "@/registry/menu";
import { Logo } from "./Logo";
import { MegaMenu } from "./MegaMenu";
import { SearchPalette } from "./SearchPalette";
import { ThemeToggleButton } from "./ThemeToggle";

export interface HeaderMenus {
  /** One dropdown per category in the desktop bar. */
  categories: CategoryMenu[];
  /** Every tool per category, for the mobile menu. */
  mobile: MenuColumn[];
}

/** Shortcuts at the top of the mobile menu. */
const QUICK_LINKS = [
  { href: "/pdf/pdf-merge", label: "Merge PDF" },
  { href: "/pdf/pdf-compress", label: "Compress PDF" },
  { href: "/convert/pdf-to-jpg", label: "PDF to JPG" },
];

type Open = CategoryMenu["id"] | null;

/** Delay before a hovered category opens, so sweeping the pointer across the bar doesn't flash menus. */
const HOVER_OPEN_MS = 90;
const HOVER_CLOSE_MS = 180;

export function Header({ menus }: { menus: HeaderMenus }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [open, setOpen] = useState<Open>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  /** True briefly after hover opened a menu, so the click that usually follows doesn't close it. */
  const justHovered = useRef(false);
  const isMac = useClientValue(() => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent), true);

  // Close menus when the route changes (derived during render rather than in an effect).
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
    setOpen(null);
  }

  const openSearch = useCallback(() => {
    setMenuOpen(false);
    setOpen(null);
    setSearchOpen(true);
  }, []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeMenus = useCallback(() => {
    setOpen(null);
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "Escape") {
        setOpen(null);
        setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const hoverOpen = (id: Exclude<Open, null>) => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(
      () => {
        justHovered.current = true;
        window.setTimeout(() => (justHovered.current = false), 600);
        setOpen(id);
      },
      open ? 0 : HOVER_OPEN_MS,
    );
  };
  const hoverClose = () => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpen(null), HOVER_CLOSE_MS);
  };
  const keepOpen = () => window.clearTimeout(hoverTimer.current);
  const clickToggle = (id: Exclude<Open, null>) => {
    window.clearTimeout(hoverTimer.current);
    const keep = justHovered.current;
    justHovered.current = false;
    setOpen((o) => (o === id && !keep ? null : id));
  };

  const navItem = "inline-flex h-10 items-center gap-1.5 rounded-md px-2.5 text-[0.9375rem] font-medium transition-colors xl:px-3";
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header ref={navRef} className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur supports-[not(backdrop-filter:blur(1px))]:bg-surface">
      <div className="mx-auto flex h-16 max-w-[96rem] items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="-ml-1 mr-2 rounded-md p-1" aria-label="Expensico home">
          <Logo id="hd" />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center">
            {menus.categories.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  aria-expanded={open === c.id}
                  aria-controls={open === c.id ? `menu-${c.id}` : undefined}
                  onClick={() => clickToggle(c.id)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && hoverOpen(c.id)}
                  onPointerLeave={(e) => e.pointerType === "mouse" && hoverClose()}
                  className={cn(navItem, open === c.id ? "bg-surface-2 text-fg" : isActive(c.href) ? "text-brand hover:bg-surface-2" : "text-fg hover:bg-surface-2")}
                >
                  {c.label}
                  <ChevronDown aria-hidden className={cn("size-4 transition-transform", open === c.id && "rotate-180")} />
                </button>
              </li>
            ))}
            <li className="hidden xl:list-item">
              <Link href="/notes" aria-current={isActive("/notes") ? "page" : undefined} className={cn(navItem, isActive("/notes") ? "text-brand" : "text-fg hover:text-brand")}>
                Notes
              </Link>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={openSearch}
            className="hidden h-10 w-56 items-center gap-2 rounded-full border border-border bg-bg px-4 text-sm text-subtle transition-colors hover:border-border-strong hover:text-muted md:flex lg:hidden xl:flex xl:w-52 2xl:w-96"
            aria-label="Search tools"
          >
            <Search aria-hidden className="size-4" />
            <span className="flex-1 truncate text-left">
              Search tools…<span className="hidden 2xl:inline"> e.g. PDF to JPG, EMI, JSON</span>
            </span>
            <span className="flex gap-0.5">
              <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
              <Kbd>K</Kbd>
            </span>
          </button>
          <button type="button" onClick={openSearch} className="inline-flex size-10 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg md:hidden lg:inline-flex xl:hidden" aria-label="Search tools">
            <Search aria-hidden className="size-5" />
          </button>
          <ThemeToggleButton />
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex size-10 items-center justify-center rounded-md text-fg hover:bg-surface-2 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? "mobile-nav" : undefined}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
          </button>
        </div>
      </div>

      {menus.categories.map(
        (c) =>
          open === c.id && (
            <MegaMenu
              key={c.id}
              id={`menu-${c.id}`}
              menu={c}
              onNavigate={closeMenus}
              onPointerEnter={keepOpen}
              onPointerLeave={(e) => e.pointerType === "mouse" && hoverClose()}
            />
          ),
      )}

      {menuOpen && (
        <nav id="mobile-nav" aria-label="Main" className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-surface lg:hidden">
          <ul className="grid grid-cols-2 gap-2 px-4 pt-4 sm:grid-cols-4 sm:px-6">
            {[...QUICK_LINKS, { href: "/convert", label: "Convert a file" }, { href: "/notes", label: "Notes" }, { href: "/#all-tools", label: "All tools" }].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="flex h-11 items-center justify-center rounded-lg border border-border bg-bg px-3 text-sm font-medium text-fg hover:border-border-strong">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="divide-y divide-border px-4 py-3 sm:px-6">
            {menus.mobile.map((col) => (
              <details key={col.id} className="group py-1">
                <summary className="flex h-12 cursor-pointer list-none items-center justify-between text-[0.9375rem] font-semibold text-fg [&::-webkit-details-marker]:hidden">
                  {col.title}
                  <span className="flex items-center gap-2 text-sm font-normal text-subtle">
                    {col.links.length}
                    <ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" />
                  </span>
                </summary>
                <ul className="grid grid-cols-1 pb-3 sm:grid-cols-2">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="block rounded-md px-2 py-2 text-[0.9375rem] text-muted hover:bg-surface-2 hover:text-fg">
                        {l.title}
                      </Link>
                    </li>
                  ))}
                  {col.href && (
                    <li>
                      <Link href={col.href} className="flex items-center gap-1 rounded-md px-2 py-2 text-[0.9375rem] font-medium text-brand hover:bg-surface-2">
                        See all {col.title.toLowerCase()} <ArrowRight aria-hidden className="size-4" />
                      </Link>
                    </li>
                  )}
                </ul>
              </details>
            ))}
          </div>
        </nav>
      )}

      <SearchPalette open={searchOpen} onClose={closeSearch} />
    </header>
  );
}

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CornerDownLeft, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { searchEntries, type SearchEntry } from "@/lib/search";
import { track } from "@/lib/analytics";
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/progress";
import { useSearchIndex } from "./use-search-index";

const catDot: Record<string, string> = {
  files: "bg-[var(--cat-files)]",
  pdf: "bg-[var(--cat-pdf)]",
  convert: "bg-[var(--cat-convert)]",
  finance: "bg-[var(--cat-finance)]",
  productivity: "bg-[var(--cat-productivity)]",
  developer: "bg-[var(--cat-developer)]",
};

interface ResultsListProps {
  results: SearchEntry[];
  activeIndex: number;
  listId: string;
  onHover: (i: number) => void;
  onSelect: (entry: SearchEntry) => void;
}

export function SearchResultsList({ results, activeIndex, listId, onHover, onSelect }: ResultsListProps) {
  return (
    <ul id={listId} role="listbox" aria-label="Search results" className="flex flex-col gap-0.5">
      {results.map((r, i) => (
        <li
          key={r.href}
          id={`${listId}-opt-${i}`}
          role="option"
          aria-selected={i === activeIndex}
          onMouseMove={() => onHover(i)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSelect(r)}
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5",
            i === activeIndex ? "bg-surface-2" : "hover:bg-surface-2",
          )}
        >
          <span aria-hidden className={cn("size-2 shrink-0 rounded-full", catDot[r.category] ?? "bg-subtle")} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[0.9375rem] font-medium text-fg">{r.title}</span>
            <span className="block truncate text-sm text-muted">{r.description}</span>
          </span>
          <span className="hidden shrink-0 text-xs text-subtle sm:block">{r.group}</span>
          {i === activeIndex && <CornerDownLeft aria-hidden className="hidden size-4 shrink-0 text-subtle sm:block" />}
        </li>
      ))}
    </ul>
  );
}

/** Shared search state: query, results, keyboard navigation and selection. */
export function useToolSearch(enabled: boolean, onNavigate?: () => void) {
  const router = useRouter();
  const { entries, error } = useSearchIndex(enabled);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const lastTracked = useRef("");

  const results = useMemo(() => {
    if (!entries) return [];
    if (!query.trim()) return entries.filter((e) => e.popular && e.href.split("/").length > 2).slice(0, 8);
    return searchEntries(entries, query, 12);
  }, [entries, query]);

  // Report searches that found nothing, debounced, so we learn which tools people miss.
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!entries || q.length < 3) return;
    const id = window.setTimeout(() => {
      if (lastTracked.current === q) return;
      lastTracked.current = q;
      track("search", { query: q, results: results.length });
    }, 1200);
    return () => window.clearTimeout(id);
  }, [query, entries, results.length]);

  const select = useCallback(
    (entry: SearchEntry) => {
      track("search_selected", { href: entry.href, hadQuery: Boolean(query.trim()) });
      onNavigate?.();
      router.push(entry.href);
    },
    [router, onNavigate, query],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
      } else if (e.key === "Enter") {
        const r = results[activeIndex];
        if (r) {
          e.preventDefault();
          select(r);
        }
      }
    },
    [results, activeIndex, select],
  );

  const updateQuery = useCallback((q: string) => {
    setQuery(q);
    setActiveIndex(0);
  }, []);

  return { query, setQuery: updateQuery, results, activeIndex, setActiveIndex, onKeyDown, select, loading: enabled && !entries && !error, error };
}

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const search = useToolSearch(open, onClose);
  const { setQuery } = search;

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      requestAnimationFrame(() => inputRef.current?.focus());
    }
    if (!open && el.open) {
      el.close();
      setQuery("");
    }
  }, [open, setQuery]);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Search tools"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className={cn(
        "m-0 h-dvh max-h-none w-full max-w-none bg-surface p-0 text-fg backdrop:bg-black/50",
        "sm:mx-auto sm:mt-[12vh] sm:h-auto sm:max-h-[70vh] sm:w-[calc(100%-2rem)] sm:max-w-xl sm:rounded-xl sm:border sm:border-border sm:shadow-lg",
        "open:[animation:ex-fade-in_120ms_ease-out]",
      )}
    >
      {open && (
        <div className="flex h-full max-h-[inherit] flex-col">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search aria-hidden className="size-5 shrink-0 text-muted" />
            <input
              ref={inputRef}
              type="search"
              role="combobox"
              aria-expanded={search.results.length > 0}
              aria-controls={listId}
              aria-activedescendant={search.results.length ? `${listId}-opt-${search.activeIndex}` : undefined}
              aria-autocomplete="list"
              aria-label="Search for a tool"
              placeholder="Search for a tool…"
              value={search.query}
              onChange={(e) => search.setQuery(e.target.value)}
              onKeyDown={search.onKeyDown}
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="go"
              className="h-14 min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-subtle [&::-webkit-search-cancel-button]:hidden"
            />
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-md px-2 text-sm text-muted hover:bg-surface-2 hover:text-fg"
              aria-label="Close search"
            >
              <span className="hidden sm:inline">
                <Kbd>Esc</Kbd>
              </span>
              <X aria-hidden className="size-5 sm:hidden" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain p-2">
            {search.loading && (
              <div className="flex justify-center py-10">
                <Spinner label="Loading tools" />
              </div>
            )}
            {search.error && <p className="px-3 py-8 text-center text-sm text-muted">Search couldn&apos;t load. Check your connection and try again.</p>}
            {!search.loading && !search.error && (
              <>
                {!search.query.trim() && <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-subtle">Popular tools</p>}
                {search.results.length > 0 ? (
                  <SearchResultsList
                    results={search.results}
                    activeIndex={search.activeIndex}
                    listId={listId}
                    onHover={search.setActiveIndex}
                    onSelect={search.select}
                  />
                ) : (
                  search.query.trim() && (
                    <div className="px-3 py-10 text-center">
                      <p className="font-medium">No tools match “{search.query.trim()}”</p>
                      <p className="mt-1 text-sm text-muted">Try a format (PDF, CSV, JSON) or a task (compress, merge, EMI).</p>
                      <Link href="/tools" onClick={onClose} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
                        Browse all tools <ArrowRight aria-hidden className="size-4" />
                      </Link>
                    </div>
                  )
                )}
              </>
            )}
          </div>

          <div className="hidden items-center gap-4 border-t border-border px-4 py-2 text-xs text-subtle sm:flex">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <Kbd>↵</Kbd> open
            </span>
            <span className="flex items-center gap-1">
              <Kbd>Esc</Kbd> close
            </span>
          </div>
        </div>
      )}
    </dialog>
  );
}

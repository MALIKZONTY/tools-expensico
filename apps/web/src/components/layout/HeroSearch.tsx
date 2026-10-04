"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { SearchResultsList, useToolSearch } from "./SearchPalette";

/** Inline search with a results dropdown (combobox pattern). */
export function HeroSearch({ className }: { className?: string }) {
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const search = useToolSearch(touched);
  const open = focused && search.query.trim().length > 0;

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setFocused(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // aria-controls must name an element that exists, and the listbox only mounts with results.
  const listShown = open && !search.loading && search.results.length > 0;

  return (
    <div ref={wrapRef} className={cn("relative w-full", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const r = search.results[search.activeIndex];
          if (r) search.select(r);
        }}
      >
        <label htmlFor="hero-search" className="sr-only">
          Search for a tool
        </label>
        <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-subtle" />
        <input
          id="hero-search"
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listShown ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={listShown ? `${listId}-opt-${search.activeIndex}` : undefined}
          placeholder="Search for a tool…  e.g. PDF to JPG, EMI, JSON"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          value={search.query}
          onFocus={() => {
            setFocused(true);
            setTouched(true);
          }}
          onChange={(e) => {
            setTouched(true);
            setFocused(true);
            search.setQuery(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              search.setQuery("");
              return;
            }
            search.onKeyDown(e);
          }}
          className="h-14 w-full rounded-xl border border-border-strong bg-surface pl-12 pr-4 text-base text-fg shadow-md outline-none transition-colors placeholder:text-subtle focus:border-ring focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring [&::-webkit-search-cancel-button]:hidden"
        />
      </form>
      {open && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 max-h-[min(26rem,60vh)] overflow-y-auto rounded-xl border border-border bg-surface p-2 text-left shadow-lg">
          {search.loading ? (
            <p className="px-3 py-6 text-center text-sm text-muted">Loading…</p>
          ) : search.results.length ? (
            <SearchResultsList results={search.results} activeIndex={search.activeIndex} listId={listId} onHover={search.setActiveIndex} onSelect={search.select} />
          ) : (
            <p className="px-3 py-6 text-center text-sm text-muted">No tools match “{search.query.trim()}”. Try a format or a task like “compress”.</p>
          )}
        </div>
      )}
    </div>
  );
}

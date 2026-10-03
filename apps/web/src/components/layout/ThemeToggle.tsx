"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { DEFAULT_THEME, applyTheme, readThemePreference, type ThemePreference } from "./theme";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystem = () => {
    if (readThemePreference() === "system") applyTheme("system");
    onChange();
  };
  window.addEventListener("ex-theme-change", onChange);
  window.addEventListener("storage", onChange);
  mq.addEventListener("change", onSystem);
  return () => {
    window.removeEventListener("ex-theme-change", onChange);
    window.removeEventListener("storage", onChange);
    mq.removeEventListener("change", onSystem);
  };
}

/** Current theme preference from localStorage, kept in sync across tabs and OS changes. */
function usePreference(): ThemePreference {
  return useSyncExternalStore(subscribe, readThemePreference, () => DEFAULT_THEME);
}

/** Header button: flips between light and dark based on what is currently shown. */
export function ThemeToggleButton() {
  usePreference();
  function toggle() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    applyTheme(isDark ? "light" : "dark");
  }
  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex size-10 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      <Sun aria-hidden className="size-[18px] dark:hidden" />
      <Moon aria-hidden className="hidden size-[18px] dark:block" />
    </button>
  );
}

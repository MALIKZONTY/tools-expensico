export type ThemePreference = "system" | "light" | "dark";
export const THEME_STORAGE_KEY = "ex-theme";

/** Light is the default; dark applies only when chosen, or when "system" is chosen and the OS is dark. */
export const DEFAULT_THEME: ThemePreference = "light";

/** Runs in <head> before first paint; keep it tiny and dependency-free. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})()`;

export function readThemePreference(): ThemePreference {
  try {
    const t = localStorage.getItem(THEME_STORAGE_KEY);
    return t === "light" || t === "dark" || t === "system" ? t : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function applyTheme(pref: ThemePreference) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // Storage unavailable (private mode); the choice still applies for this page view.
  }
  const dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  window.dispatchEvent(new CustomEvent("ex-theme-change", { detail: pref }));
}

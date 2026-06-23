import type { Theme } from "./ipc";

let systemMediaQuery: MediaQueryList | null = null;
let systemChangeHandler: ((event: MediaQueryListEvent) => void) | null = null;

function effectiveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const isDark = effectiveTheme(theme) === "dark";

  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Keep system preference listener up to date when in "system" mode.
  if (theme === "system") {
    if (!systemMediaQuery) {
      systemMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      systemChangeHandler = (event: MediaQueryListEvent) => {
        if (event.matches) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      };
      systemMediaQuery.addEventListener("change", systemChangeHandler);
    }
  } else if (systemMediaQuery && systemChangeHandler) {
    systemMediaQuery.removeEventListener("change", systemChangeHandler);
    systemMediaQuery = null;
    systemChangeHandler = null;
  }
}

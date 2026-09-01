import { useEffect, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
type EffectiveTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "srw-theme";

const themeOptions = ["light", "dark", "system"] as const;

function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === "string" && themeOptions.includes(value as ThemePreference);
}

function getSystemTheme(): EffectiveTheme {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

function getStoredTheme(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    return isThemePreference(storedTheme) ? storedTheme : "system";
  } catch {
    return "system";
  }
}

function resolveTheme(theme: ThemePreference): EffectiveTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

function applyTheme(theme: ThemePreference) {
  if (typeof document === "undefined") {
    return;
  }

  const effectiveTheme = resolveTheme(theme);

  document.documentElement.classList.toggle("dark", effectiveTheme === "dark");
  document.documentElement.style.colorScheme = effectiveTheme;
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemePreference>(getStoredTheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function syncTheme() {
      applyTheme(theme);
    }

    syncTheme();

    if (theme === "system") {
      mediaQuery.addEventListener("change", syncTheme);

      return () => mediaQuery.removeEventListener("change", syncTheme);
    }
  }, [theme]);

  function setTheme(nextTheme: ThemePreference) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Theme still applies for the current session when storage is blocked.
    }

    setThemeState(nextTheme);
  }

  return {
    setTheme,
    theme,
  };
}

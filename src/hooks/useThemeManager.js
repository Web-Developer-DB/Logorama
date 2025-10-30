/**
 * @file useThemeManager.js
 * @description Hook, der Theme-Modi (System, Light, Dark) inkl. Persistenz und
 * OS-Listenern verwaltet.
 */

import { useCallback, useEffect, useState } from "react";

const THEME_STORAGE_KEY = "logorama-theme-mode";
const THEME_MODES = ["system", "light", "dark"];

/**
 * Setzt das data-theme-Attribut auf dem <html>-Element, damit CSS-Variablen
 * sofort auf das gewünschte Farbschema reagieren können.
 */
const applyThemeAttribute = (nextTheme) => {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.dataset.theme = nextTheme;
};

/**
 * Liest die Theme-Präferenz des Betriebssystems aus.
 */
const getSystemTheme = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

/**
 * Übersetzt einen Theme-Modus in den tatsächlich zu verwendenden Modus.
 */
const resolveTheme = (mode) => {
  if (mode === "light" || mode === "dark") {
    return mode;
  }
  return getSystemTheme();
};

/**
 * Ermittelt den beim Start zu ladenden Modus aus dem LocalStorage.
 */
const getInitialThemeMode = () => {
  if (typeof window === "undefined") {
    return "system";
  }
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "system" || storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }
  return "system";
};

/**
 * Kapselt das komplette Theme-State-Handling inklusive Persistenz,
 * System-Listenern und Wechsel-Shortcut. Komponenten konsumieren nur noch
 * die Rückgabewerte und müssen keine Seiteneffekte mehr selbst verwalten.
 *
 * @returns {{
 *   themeMode: "system"|"light"|"dark",
 *   resolvedTheme: "light"|"dark",
 *   cycleThemeMode: () => void
 * }} Steuerobjekt für Theme-Umschalter.
 */
const useThemeManager = () => {
  const initialThemeMode = getInitialThemeMode();
  const [themeMode, setThemeMode] = useState(initialThemeMode);
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(initialThemeMode));

  useEffect(() => {
    if (themeMode === "system") {
      setResolvedTheme(resolveTheme("system"));
    } else {
      setResolvedTheme(themeMode);
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    }
  }, [themeMode]);

  useEffect(() => {
    applyThemeAttribute(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (event) => {
      if (themeMode === "system") {
        setResolvedTheme(event.matches ? "dark" : "light");
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [themeMode]);

  /**
   * Wechselt zum nächsten Theme-Modus in der Reihenfolge System → Hell → Dunkel.
   */
  const cycleThemeMode = useCallback(() => {
    setThemeMode((prev) => {
      const index = THEME_MODES.indexOf(prev);
      const nextIndex = index === -1 ? 0 : (index + 1) % THEME_MODES.length;
      return THEME_MODES[nextIndex];
    });
  }, []);

  return {
    themeMode,
    resolvedTheme,
    cycleThemeMode
  };
};

export default useThemeManager;

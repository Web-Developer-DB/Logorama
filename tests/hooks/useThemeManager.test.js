/**
 * @file useThemeManager.test.js
 * @description Verifiziert Persistenz, Systemlistener und Theme-Wechsel-Logik.
 */

import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import useThemeManager from "../../src/hooks/useThemeManager.js";

const matchMediaMock = () => {
  let listener = null;
  const mediaQueryList = {
    matches: false,
    addEventListener: jest.fn((_, cb) => {
      listener = cb;
    }),
    removeEventListener: jest.fn(),
    addListener: jest.fn((cb) => {
      listener = cb;
    }),
    removeListener: jest.fn(),
    dispatch(value) {
      this.matches = value;
      if (listener) {
        listener({ matches: value });
      }
    }
  };
  return mediaQueryList;
};

describe("useThemeManager", () => {
  let manager;
  let mediaQueryList;
  let originalMatchMedia;

  const Harness = () => {
    manager = useThemeManager();
    return null;
  };

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.theme = "";
    originalMatchMedia = window.matchMedia;
    mediaQueryList = matchMediaMock();
    window.matchMedia = jest.fn(() => mediaQueryList);
    render(<Harness />);
  });

  afterEach(() => {
    cleanup();
    window.matchMedia = originalMatchMedia;
    jest.restoreAllMocks();
  });

  test("initialisiert mit Systemmodus und setzt data-theme entsprechend", () => {
    expect(manager.themeMode).toBe("system");
    expect(manager.resolvedTheme).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  test("zyklischer Wechsel persistiert im LocalStorage", () => {
    act(() => {
      manager.cycleThemeMode();
    });
    expect(manager.themeMode).toBe("light");
    expect(localStorage.getItem("logorama-theme-mode")).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");

    act(() => {
      manager.cycleThemeMode();
    });
    expect(manager.themeMode).toBe("dark");
    expect(localStorage.getItem("logorama-theme-mode")).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  test("Systemmodus reagiert auf Änderungen des Betriebssystems", () => {
    act(() => {
      manager.cycleThemeMode(); // light
      manager.cycleThemeMode(); // dark
      manager.cycleThemeMode(); // zurück auf system
    });
    expect(manager.themeMode).toBe("system");
    act(() => {
      mediaQueryList.dispatch(true);
    });
    expect(manager.resolvedTheme).toBe("dark");
    act(() => {
      mediaQueryList.dispatch(false);
    });
    expect(manager.resolvedTheme).toBe("light");
  });
});

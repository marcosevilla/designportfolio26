"use client";

import { useTheme } from "next-themes";
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { PaletteIcon as PaletteIconComponent } from "./Icons";

// ── Color themes ──────────────────────────────────────────────
// Each color family has both a light and a dark variant so it can be paired
// with either site mode while keeping the same hue identity. Variants are
// hand-tuned so fg/bg and accent/bg contrast meets WCAG AA on both sides.
export type ThemeVariant = {
  bg: string;
  fg: string;
  fgSecondary: string;
  fgTertiary: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  muted: string;
  accent: string;
  glow: string;
};

export type ColoredTheme = {
  name: string;
  light: ThemeVariant;
  dark: ThemeVariant;
};

export const coloredThemes: ColoredTheme[] = [
  {
    name: "ocean",
    light: {
      bg: "#ecf4f8", fg: "#0c2a3a",
      fgSecondary: "rgba(12,42,58,0.65)", fgTertiary: "rgba(12,42,58,0.35)",
      surface: "#dde9f0", surfaceRaised: "#cee0e9", border: "#bdd5e0", muted: "#dde9f0",
      accent: "#1d6b89", glow: "#155a78",
    },
    dark: {
      bg: "#0f2b3c", fg: "#e8f0f4",
      fgSecondary: "rgba(232,240,244,0.65)", fgTertiary: "rgba(232,240,244,0.35)",
      surface: "#163548", surfaceRaised: "#1c3f54", border: "#1f4a62", muted: "#163548",
      accent: "#5bb8d4", glow: "#7cd4ef",
    },
  },
  {
    name: "forest",
    light: {
      bg: "#eef5ec", fg: "#14281a",
      fgSecondary: "rgba(20,40,26,0.65)", fgTertiary: "rgba(20,40,26,0.35)",
      surface: "#e0ede0", surfaceRaised: "#d2e5d2", border: "#c2d8c2", muted: "#e0ede0",
      accent: "#2f7a3e", glow: "#226a30",
    },
    dark: {
      bg: "#1a2e1a", fg: "#e4efe0",
      fgSecondary: "rgba(228,239,224,0.65)", fgTertiary: "rgba(228,239,224,0.35)",
      surface: "#223a22", surfaceRaised: "#2a4a2a", border: "#2f522f", muted: "#223a22",
      accent: "#6db86b", glow: "#8fd48d",
    },
  },
  {
    name: "wine",
    light: {
      bg: "#f9eef0", fg: "#2a0e18",
      fgSecondary: "rgba(42,14,24,0.65)", fgTertiary: "rgba(42,14,24,0.35)",
      surface: "#f1dde2", surfaceRaised: "#ead0d6", border: "#ddc0c7", muted: "#f1dde2",
      accent: "#a83a55", glow: "#962d48",
    },
    dark: {
      bg: "#2d1420", fg: "#f2e4ea",
      fgSecondary: "rgba(242,228,234,0.65)", fgTertiary: "rgba(242,228,234,0.35)",
      surface: "#3a1c2c", surfaceRaised: "#462336", border: "#522a40", muted: "#3a1c2c",
      accent: "#d4728a", glow: "#e8a0b3",
    },
  },
  {
    name: "slate",
    light: {
      bg: "#eff0f7", fg: "#161b2e",
      fgSecondary: "rgba(22,27,46,0.65)", fgTertiary: "rgba(22,27,46,0.35)",
      surface: "#e3e4ed", surfaceRaised: "#d6d7e2", border: "#c5c6d4", muted: "#e3e4ed",
      accent: "#4b50a0", glow: "#393d8a",
    },
    dark: {
      bg: "#1e2030", fg: "#e0e2ef",
      fgSecondary: "rgba(224,226,239,0.65)", fgTertiary: "rgba(224,226,239,0.35)",
      surface: "#262840", surfaceRaised: "#2e3050", border: "#363860", muted: "#262840",
      accent: "#8b8fd4", glow: "#b3b7e8",
    },
  },
  {
    name: "ember",
    light: {
      bg: "#f7eee3", fg: "#2c1408",
      fgSecondary: "rgba(44,20,8,0.65)", fgTertiary: "rgba(44,20,8,0.35)",
      surface: "#efe2d3", surfaceRaised: "#e8d6c2", border: "#ddc8b0", muted: "#efe2d3",
      accent: "#b85a1c", glow: "#a14a14",
    },
    dark: {
      bg: "#2c1810", fg: "#f4e8e0",
      fgSecondary: "rgba(244,232,224,0.65)", fgTertiary: "rgba(244,232,224,0.35)",
      surface: "#3a2218", surfaceRaised: "#482c20", border: "#563628", muted: "#3a2218",
      accent: "#d48a5b", glow: "#e8b08d",
    },
  },
  {
    name: "lavender",
    light: {
      bg: "#f0ecf8", fg: "#2a2440",
      fgSecondary: "rgba(42,36,64,0.65)", fgTertiary: "rgba(42,36,64,0.35)",
      surface: "#e8e2f4", surfaceRaised: "#ddd6ee", border: "#cdc4e0", muted: "#e8e2f4",
      accent: "#7c5cbf", glow: "#9a7ce0",
    },
    dark: {
      bg: "#1a1428", fg: "#ede8f4",
      fgSecondary: "rgba(237,232,244,0.65)", fgTertiary: "rgba(237,232,244,0.35)",
      surface: "#221c34", surfaceRaised: "#2c2540", border: "#362f4d", muted: "#221c34",
      accent: "#b39bd9", glow: "#c8b4e6",
    },
  },
  {
    name: "mint",
    light: {
      bg: "#ecf6f2", fg: "#1a3028",
      fgSecondary: "rgba(26,48,40,0.65)", fgTertiary: "rgba(26,48,40,0.35)",
      surface: "#e0f0e8", surfaceRaised: "#d4eade", border: "#bddccc", muted: "#e0f0e8",
      accent: "#2d8a5e", glow: "#256e4a",
    },
    dark: {
      bg: "#0f1f1a", fg: "#e0efe7",
      fgSecondary: "rgba(224,239,231,0.65)", fgTertiary: "rgba(224,239,231,0.35)",
      surface: "#182a24", surfaceRaised: "#20382f", border: "#2a463a", muted: "#182a24",
      accent: "#5bd498", glow: "#80e0b0",
    },
  },
  {
    name: "rose",
    light: {
      bg: "#f8eff0", fg: "#3a2028",
      fgSecondary: "rgba(58,32,40,0.65)", fgTertiary: "rgba(58,32,40,0.35)",
      surface: "#f2e4e6", surfaceRaised: "#ecdadc", border: "#e0c8cc", muted: "#f2e4e6",
      accent: "#b8485e", glow: "#a23a4f",
    },
    dark: {
      bg: "#251218", fg: "#f2e0e4",
      fgSecondary: "rgba(242,224,228,0.65)", fgTertiary: "rgba(242,224,228,0.35)",
      surface: "#311a22", surfaceRaised: "#3d232c", border: "#4d2e38", muted: "#311a22",
      accent: "#e08099", glow: "#e8a0b0",
    },
  },
  {
    name: "butter",
    light: {
      bg: "#f6f2e6", fg: "#302a18",
      fgSecondary: "rgba(48,42,24,0.65)", fgTertiary: "rgba(48,42,24,0.35)",
      surface: "#f0eadc", surfaceRaised: "#eae2d0", border: "#ddd2b8", muted: "#f0eadc",
      accent: "#8a7028", glow: "#735c1e",
    },
    dark: {
      bg: "#221c0a", fg: "#f0e8d0",
      fgSecondary: "rgba(240,232,208,0.65)", fgTertiary: "rgba(240,232,208,0.35)",
      surface: "#2c2410", surfaceRaised: "#382d18", border: "#463822", muted: "#2c2410",
      accent: "#d9b454", glow: "#e8c878",
    },
  },
  {
    name: "sky",
    light: {
      bg: "#edf4f8", fg: "#1a2830",
      fgSecondary: "rgba(26,40,48,0.65)", fgTertiary: "rgba(26,40,48,0.35)",
      surface: "#e2eef4", surfaceRaised: "#d6e6ee", border: "#c0d6e4", muted: "#e2eef4",
      accent: "#2d7aa8", glow: "#246592",
    },
    dark: {
      bg: "#0e1a24", fg: "#dde8ef",
      fgSecondary: "rgba(221,232,239,0.65)", fgTertiary: "rgba(221,232,239,0.35)",
      surface: "#16242f", surfaceRaised: "#1e2e3a", border: "#283c4a", muted: "#16242f",
      accent: "#5fb0d9", glow: "#80c4e8",
    },
  },
];

export type Mode = "light" | "dark";
// Legacy alias kept so existing imports of ThemeMode don't break.
export type ThemeMode = Mode;

// A hue family is always active — there's no neutral fallback. `ember` is
// the default because its accent (#d48a5b dark / #b85a1c light) is closest
// to the original copper/orange identity the site shipped with.
export const DEFAULT_THEME_FAMILY = "ember";
const LEGACY_NATURALLY_DARK = new Set(["ocean", "forest", "wine", "slate", "ember"]);

export function applyColoredTheme(theme: ColoredTheme, mode: Mode) {
  const root = document.documentElement;
  const v = theme[mode];
  root.style.setProperty("--color-bg", v.bg);
  root.style.setProperty("--color-fg", v.fg);
  root.style.setProperty("--color-fg-secondary", v.fgSecondary);
  root.style.setProperty("--color-fg-tertiary", v.fgTertiary);
  root.style.setProperty("--color-surface", v.surface);
  root.style.setProperty("--color-surface-raised", v.surfaceRaised);
  root.style.setProperty("--color-border", v.border);
  root.style.setProperty("--color-muted", v.muted);
  root.style.setProperty("--color-accent", v.accent);
  root.style.setProperty("--color-glow", v.glow);
}

export function clearColoredTheme() {
  const root = document.documentElement;
  const vars = [
    "--color-bg", "--color-fg", "--color-fg-secondary", "--color-fg-tertiary",
    "--color-surface", "--color-surface-raised", "--color-border", "--color-muted", "--color-accent", "--color-glow",
  ];
  vars.forEach((v) => root.style.removeProperty(v));
}

// ── Font size scaling ─────────────────────────────────────────
const FONT_SIZE_MIN = -4;
const FONT_SIZE_MAX = 4;
const FONT_SIZE_STEP = 2;

export function applyFontSizeOffset(offset: number) {
  document.documentElement.style.setProperty("--font-size-offset", `${offset}px`);
}

export function clearFontSizeOffset() {
  document.documentElement.style.removeProperty("--font-size-offset");
}

// ── Theme state provider ──────────────────────────────────────
// Theme state must be SHARED across components — multiple sites read it
// (palette swatches, the mode-toggle button in the icon row, etc.) and
// they all need to mutate the same store. Hosting state in a context
// avoids the classic "multiple components each call a hook with internal
// useState" bug where each consumer gets its own divergent copy.
type ThemeStateContextValue = {
  mounted: boolean;
  mode: Mode;
  themeFamily: string;
  coloredThemeName: string; // legacy alias of themeFamily
  fontSizeOffset: number;
  selectLight: () => void;
  selectDark: () => void;
  selectColored: (name: string) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetAll: () => void;
};

const ThemeStateContext = createContext<ThemeStateContextValue | null>(null);

export function useThemeState(): ThemeStateContextValue {
  const ctx = useContext(ThemeStateContext);
  if (ctx) return ctx;
  // Safe fallback for any component that ends up outside the provider —
  // e.g., during SSR or in tests. All actions become no-ops.
  return {
    mounted: false,
    mode: "light",
    themeFamily: DEFAULT_THEME_FAMILY,
    coloredThemeName: DEFAULT_THEME_FAMILY,
    fontSizeOffset: 0,
    selectLight: () => {},
    selectDark: () => {},
    selectColored: () => {},
    increaseFontSize: () => {},
    decreaseFontSize: () => {},
    resetAll: () => {},
  };
}

export function ThemeStateProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mode, setModeState] = useState<Mode>("light");
  const [themeFamily, setThemeFamilyState] = useState<string>(DEFAULT_THEME_FAMILY);
  const [fontSizeOffset, setFontSizeOffset] = useState(0);

  useEffect(() => {
    setMounted(true);

    let initialMode: Mode = theme === "dark" ? "dark" : "light";
    // Hue family is intentionally NOT persisted — every fresh load starts
    // at the default. Only light/dark mode and font-size are sticky.
    const initialFamily: string = DEFAULT_THEME_FAMILY;

    const savedMode = localStorage.getItem("theme-mode");

    // Migration: drop any prior schemas that persisted hue family.
    if (savedMode === "colored") {
      const legacyName = localStorage.getItem("colored-theme-name");
      if (legacyName) {
        const found = coloredThemes.find((t) => t.name === legacyName);
        initialMode = found && LEGACY_NATURALLY_DARK.has(found.name) ? "dark" : "light";
      }
      localStorage.setItem("theme-mode", initialMode);
    } else if (savedMode === "light" || savedMode === "dark") {
      initialMode = savedMode;
    }
    localStorage.removeItem("colored-theme-name");
    localStorage.removeItem("theme-family");

    setModeState(initialMode);
    setThemeFamilyState(initialFamily);
    setTheme(initialMode);

    const foundInitial = coloredThemes.find((t) => t.name === initialFamily);
    if (foundInitial) applyColoredTheme(foundInitial, initialMode);

    // Font-size offset is intentionally NOT persisted — every fresh load
    // starts at 0, matching the hue-family behavior. Clean up any stale
    // value from prior sessions so the offset doesn't linger.
    localStorage.removeItem("font-size-offset");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Selecting a mode preserves the current hue family (so e.g. ocean-light
  // can flip to ocean-dark without losing the ocean choice). When no family
  // is active, this just changes the achromatic light/dark.
  const selectMode = useCallback((newMode: Mode) => {
    setModeState(newMode);
    setTheme(newMode);
    localStorage.setItem("theme-mode", newMode);
    const found = coloredThemes.find((t) => t.name === themeFamily);
    if (found) applyColoredTheme(found, newMode);
  }, [setTheme, themeFamily]);

  const selectLight = useCallback(() => selectMode("light"), [selectMode]);
  const selectDark = useCallback(() => selectMode("dark"), [selectMode]);

  // Selecting a family preserves the current mode. A hue family is always
  // active — clicking the currently-active swatch is a no-op.
  const selectColored = useCallback((familyName: string) => {
    if (familyName === themeFamily) return;
    const found = coloredThemes.find((t) => t.name === familyName);
    if (!found) return;
    setThemeFamilyState(familyName);
    applyColoredTheme(found, mode);
    // Hue family is session-only — do not persist.
  }, [themeFamily, mode]);

  const increaseFontSize = useCallback(() => {
    setFontSizeOffset((prev) => {
      const next = Math.min(prev + FONT_SIZE_STEP, FONT_SIZE_MAX);
      applyFontSizeOffset(next);
      // Session-only — no persistence.
      return next;
    });
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSizeOffset((prev) => {
      const next = Math.max(prev - FONT_SIZE_STEP, FONT_SIZE_MIN);
      applyFontSizeOffset(next);
      // Session-only — no persistence.
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setTheme("light");
    setModeState("light");
    setThemeFamilyState(DEFAULT_THEME_FAMILY);
    const found = coloredThemes.find((t) => t.name === DEFAULT_THEME_FAMILY);
    if (found) applyColoredTheme(found, "light");
    localStorage.setItem("theme-mode", "light");
    localStorage.removeItem("theme-family");
    localStorage.removeItem("colored-theme-name");
    clearFontSizeOffset();
    setFontSizeOffset(0);
    localStorage.removeItem("font-size-offset");
  }, [setTheme]);

  const value = useMemo<ThemeStateContextValue>(() => ({
    mounted,
    mode,
    themeFamily,
    coloredThemeName: themeFamily,
    fontSizeOffset,
    selectLight,
    selectDark,
    selectColored,
    increaseFontSize,
    decreaseFontSize,
    resetAll,
  }), [mounted, mode, themeFamily, fontSizeOffset, selectLight, selectDark, selectColored, increaseFontSize, decreaseFontSize, resetAll]);

  return <ThemeStateContext.Provider value={value}>{children}</ThemeStateContext.Provider>;
}

// ── Palette icon (canonical in Icons.tsx) ─────────────────────
export { PaletteIcon } from "./Icons";

// ── Legacy exports for compatibility ──────────────────────────
export function useThemeCycle() {
  const state = useThemeState();
  return {
    mode: state.mode,
    mounted: state.mounted,
    cycle: () => {},
    label: "Open palette",
  };
}

export function ThemeIcon({ mode }: { mode: ThemeMode }) {
  return <PaletteIconComponent />;
}

// Mobile default export
export default function ThemeToggle() {
  return null;
}

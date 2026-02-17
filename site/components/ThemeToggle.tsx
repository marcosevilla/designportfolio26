"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useCallback } from "react";
import { PaletteIcon as PaletteIconComponent } from "./Icons";

// ── Color themes ──────────────────────────────────────────────
export const coloredThemes = [
  {
    name: "ocean",
    bg: "#0f2b3c", fg: "#e8f0f4", fgSecondary: "rgba(232,240,244,0.65)", fgTertiary: "rgba(232,240,244,0.35)",
    surface: "#163548", surfaceRaised: "#1c3f54", border: "#1f4a62", muted: "#163548", accent: "#5bb8d4",
    glow: "#7cd4ef",
  },
  {
    name: "forest",
    bg: "#1a2e1a", fg: "#e4efe0", fgSecondary: "rgba(228,239,224,0.65)", fgTertiary: "rgba(228,239,224,0.35)",
    surface: "#223a22", surfaceRaised: "#2a4a2a", border: "#2f522f", muted: "#223a22", accent: "#6db86b",
    glow: "#8fd48d",
  },
  {
    name: "wine",
    bg: "#2d1420", fg: "#f2e4ea", fgSecondary: "rgba(242,228,234,0.65)", fgTertiary: "rgba(242,228,234,0.35)",
    surface: "#3a1c2c", surfaceRaised: "#462336", border: "#522a40", muted: "#3a1c2c", accent: "#d4728a",
    glow: "#e8a0b3",
  },
  {
    name: "slate",
    bg: "#1e2030", fg: "#e0e2ef", fgSecondary: "rgba(224,226,239,0.65)", fgTertiary: "rgba(224,226,239,0.35)",
    surface: "#262840", surfaceRaised: "#2e3050", border: "#363860", muted: "#262840", accent: "#8b8fd4",
    glow: "#b3b7e8",
  },
  {
    name: "ember",
    bg: "#2c1810", fg: "#f4e8e0", fgSecondary: "rgba(244,232,224,0.65)", fgTertiary: "rgba(244,232,224,0.35)",
    surface: "#3a2218", surfaceRaised: "#482c20", border: "#563628", muted: "#3a2218", accent: "#d48a5b",
    glow: "#e8b08d",
  },
  {
    name: "lavender",
    bg: "#f0ecf8", fg: "#2a2440", fgSecondary: "rgba(42,36,64,0.65)", fgTertiary: "rgba(42,36,64,0.35)",
    surface: "#e8e2f4", surfaceRaised: "#ddd6ee", border: "#cdc4e0", muted: "#e8e2f4", accent: "#7c5cbf",
    glow: "#9a7ce0",
  },
  {
    name: "mint",
    bg: "#ecf6f2", fg: "#1a3028", fgSecondary: "rgba(26,48,40,0.65)", fgTertiary: "rgba(26,48,40,0.35)",
    surface: "#e0f0e8", surfaceRaised: "#d4eade", border: "#bddccc", muted: "#e0f0e8", accent: "#3a9e6e",
    glow: "#2d8a5e",
  },
  {
    name: "rose",
    bg: "#f8eff0", fg: "#3a2028", fgSecondary: "rgba(58,32,40,0.65)", fgTertiary: "rgba(58,32,40,0.35)",
    surface: "#f2e4e6", surfaceRaised: "#ecdadc", border: "#e0c8cc", muted: "#f2e4e6", accent: "#c45a6e",
    glow: "#b8485e",
  },
  {
    name: "butter",
    bg: "#f6f2e6", fg: "#302a18", fgSecondary: "rgba(48,42,24,0.65)", fgTertiary: "rgba(48,42,24,0.35)",
    surface: "#f0eadc", surfaceRaised: "#eae2d0", border: "#ddd2b8", muted: "#f0eadc", accent: "#a08430",
    glow: "#8a7028",
  },
  {
    name: "sky",
    bg: "#edf4f8", fg: "#1a2830", fgSecondary: "rgba(26,40,48,0.65)", fgTertiary: "rgba(26,40,48,0.35)",
    surface: "#e2eef4", surfaceRaised: "#d6e6ee", border: "#c0d6e4", muted: "#e2eef4", accent: "#3a8ab8",
    glow: "#2d7aa8",
  },
];

export type ColoredTheme = (typeof coloredThemes)[0];
export type ThemeMode = "light" | "dark" | "colored";

export function applyColoredTheme(theme: ColoredTheme) {
  const root = document.documentElement;
  root.style.setProperty("--color-bg", theme.bg);
  root.style.setProperty("--color-fg", theme.fg);
  root.style.setProperty("--color-fg-secondary", theme.fgSecondary);
  root.style.setProperty("--color-fg-tertiary", theme.fgTertiary);
  root.style.setProperty("--color-surface", theme.surface);
  root.style.setProperty("--color-surface-raised", theme.surfaceRaised);
  root.style.setProperty("--color-border", theme.border);
  root.style.setProperty("--color-muted", theme.muted);
  root.style.setProperty("--color-accent", theme.accent);
  root.style.setProperty("--color-glow", theme.glow);
}

export function clearColoredTheme() {
  const root = document.documentElement;
  const vars = [
    "--color-bg", "--color-fg", "--color-fg-secondary", "--color-fg-tertiary",
    "--color-surface", "--color-surface-raised", "--color-border", "--color-muted", "--color-accent", "--color-glow",
  ];
  vars.forEach((v) => root.style.removeProperty(v));
}

// ── Font pairings ─────────────────────────────────────────────
export const fontPairings = [
  {
    name: "Default",
    display: 'var(--font-geist-sans, "Geist"), system-ui, sans-serif',
    heading: 'var(--font-geist-sans, "Geist"), system-ui, sans-serif',
    body: 'var(--font-geist-sans, "Geist"), system-ui, sans-serif',
    mono: '"Departure Mono", monospace',
  },
  {
    name: "Formula",
    display: '"PP Formula SemiExtended", sans-serif',
    heading: '"PP Formula SemiExtended", sans-serif',
    body: '"GT Cinetype", sans-serif',
    mono: '"Departure Mono", monospace',
  },
  {
    name: "Serif",
    display: 'var(--font-instrument-serif, "Instrument Serif"), serif',
    heading: 'var(--font-instrument-sans, "Instrument Sans"), sans-serif',
    body: 'var(--font-instrument-sans, "Instrument Sans"), sans-serif',
    mono: '"Departure Mono", monospace',
    sizeBoost: 2,
  },
];

export type FontPairing = (typeof fontPairings)[0] & { headingStyle?: string; sizeBoost?: number };

export function applyFontPairing(pairing: FontPairing) {
  const root = document.documentElement;
  root.style.setProperty("--font-display", pairing.display);
  root.style.setProperty("--font-heading", pairing.heading);
  root.style.setProperty("--font-body", pairing.body);
  root.style.setProperty("--font-mono", pairing.mono);
  root.style.setProperty("--font-heading-style", pairing.headingStyle || "normal");
  root.style.setProperty("--font-pairing-boost", `${pairing.sizeBoost || 0}px`);
}

export function clearFontPairing() {
  const root = document.documentElement;
  ["--font-display", "--font-heading", "--font-body", "--font-mono", "--font-heading-style", "--font-pairing-boost"].forEach((v) =>
    root.style.removeProperty(v)
  );
}

// ── Font size scaling ─────────────────────────────────────────
const FONT_SIZE_MIN = -4; // -4px → 12px body
const FONT_SIZE_MAX = 4;  // +4px → 20px body
const FONT_SIZE_STEP = 2; // 2px per click

export function applyFontSizeOffset(offset: number) {
  document.documentElement.style.setProperty("--font-size-offset", `${offset}px`);
}

export function clearFontSizeOffset() {
  document.documentElement.style.removeProperty("--font-size-offset");
}

// ── Theme state hook ──────────────────────────────────────────
export function useThemeState() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<ThemeMode>("light");
  const [coloredThemeName, setColoredThemeName] = useState<string | null>(null);
  const [fontPairingName, setFontPairingName] = useState("Default");
  const [fontSizeOffset, setFontSizeOffset] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Restore color theme
    const savedMode = localStorage.getItem("theme-mode") as ThemeMode | null;
    if (savedMode === "colored") {
      const savedName = localStorage.getItem("colored-theme-name");
      const found = coloredThemes.find((t) => t.name === savedName);
      if (found) {
        setMode("colored");
        setColoredThemeName(found.name);
        applyColoredTheme(found);
      } else {
        setMode(theme === "dark" ? "dark" : "light");
      }
    } else if (savedMode) {
      setMode(savedMode);
    } else {
      setMode(theme === "dark" ? "dark" : "light");
    }

    // Restore font pairing
    const savedFont = localStorage.getItem("font-pairing");
    if (savedFont) {
      const found = fontPairings.find((p) => p.name === savedFont);
      if (found) {
        setFontPairingName(found.name);
        if (found.name !== "Default") applyFontPairing(found);
      }
    }

    // Restore font size
    const savedSize = localStorage.getItem("font-size-offset");
    if (savedSize) {
      const offset = parseInt(savedSize, 10);
      if (!isNaN(offset) && offset >= FONT_SIZE_MIN && offset <= FONT_SIZE_MAX) {
        setFontSizeOffset(offset);
        if (offset !== 0) applyFontSizeOffset(offset);
      }
    }
  }, []);

  const selectLight = useCallback(() => {
    clearColoredTheme();
    setTheme("light");
    setMode("light");
    setColoredThemeName(null);
    localStorage.setItem("theme-mode", "light");
    localStorage.removeItem("colored-theme-name");
  }, [setTheme]);

  const selectDark = useCallback(() => {
    clearColoredTheme();
    setTheme("dark");
    setMode("dark");
    setColoredThemeName(null);
    localStorage.setItem("theme-mode", "dark");
    localStorage.removeItem("colored-theme-name");
  }, [setTheme]);

  const selectColored = useCallback(
    (themeName: string) => {
      const t = coloredThemes.find((ct) => ct.name === themeName);
      if (!t) return;
      setTheme("light");
      document.documentElement.classList.remove("dark");
      applyColoredTheme(t);
      setMode("colored");
      setColoredThemeName(t.name);
      localStorage.setItem("theme-mode", "colored");
      localStorage.setItem("colored-theme-name", t.name);
    },
    [setTheme]
  );

  const selectFont = useCallback((name: string) => {
    const pairing = fontPairings.find((p) => p.name === name);
    if (!pairing) return;
    if (pairing.name === "Default") {
      clearFontPairing();
    } else {
      applyFontPairing(pairing);
    }
    setFontPairingName(pairing.name);
    localStorage.setItem("font-pairing", pairing.name);
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontSizeOffset((prev) => {
      const next = Math.min(prev + FONT_SIZE_STEP, FONT_SIZE_MAX);
      applyFontSizeOffset(next);
      localStorage.setItem("font-size-offset", String(next));
      return next;
    });
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSizeOffset((prev) => {
      const next = Math.max(prev - FONT_SIZE_STEP, FONT_SIZE_MIN);
      applyFontSizeOffset(next);
      localStorage.setItem("font-size-offset", String(next));
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    // Reset color to light
    clearColoredTheme();
    setTheme("light");
    setMode("light");
    setColoredThemeName(null);
    localStorage.setItem("theme-mode", "light");
    localStorage.removeItem("colored-theme-name");
    // Reset font to default
    clearFontPairing();
    setFontPairingName("Default");
    localStorage.setItem("font-pairing", "Default");
    // Reset font size
    clearFontSizeOffset();
    setFontSizeOffset(0);
    localStorage.removeItem("font-size-offset");
  }, [setTheme]);

  return {
    mounted,
    mode,
    coloredThemeName,
    fontPairingName,
    fontSizeOffset,
    selectLight,
    selectDark,
    selectColored,
    selectFont,
    increaseFontSize,
    decreaseFontSize,
    resetAll,
  };
}

// ── Palette icon (canonical in Icons.tsx) ─────────────────────
export { PaletteIcon } from "./Icons";

// ── Legacy exports for compatibility ──────────────────────────
// Keep useThemeCycle for any references, but delegate to useThemeState
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
  return null; // Mobile now uses the palette via Nav
}

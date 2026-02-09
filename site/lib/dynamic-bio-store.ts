"use client";

import { useSyncExternalStore, useCallback } from "react";
import { GridPosition, DEFAULT_GRID_POSITION } from "./bio-content";

// ── Types ──
export type BioMode = "classic" | "dynamic";

interface DynamicBioState {
  mode: BioMode;
  gridPosition: GridPosition;
}

// ── Storage keys ──
const STORAGE_KEY_MODE = "bio-mode";
const STORAGE_KEY_POSITION = "bio-grid-position";

// ── Initial state ──
let state: DynamicBioState = {
  mode: "classic",
  gridPosition: { ...DEFAULT_GRID_POSITION },
};

// ── Listeners ──
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

// ── Hydrate from localStorage (client-side only) ──
let hydrated = false;

function hydrateFromStorage() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;

  try {
    const storedMode = localStorage.getItem(STORAGE_KEY_MODE);
    if (storedMode === "classic" || storedMode === "dynamic") {
      state.mode = storedMode;
    }

    const storedPosition = localStorage.getItem(STORAGE_KEY_POSITION);
    if (storedPosition) {
      const parsed = JSON.parse(storedPosition);
      if (
        typeof parsed.x === "number" &&
        typeof parsed.y === "number" &&
        parsed.x >= 0 &&
        parsed.x <= 5 &&
        parsed.y >= 0 &&
        parsed.y <= 5
      ) {
        state.gridPosition = { x: parsed.x, y: parsed.y };
      }
    }
  } catch {
    // Ignore storage errors
  }
}

// ── Setters ──
export function setBioMode(mode: BioMode) {
  hydrateFromStorage();
  state = { ...state, mode };
  try {
    localStorage.setItem(STORAGE_KEY_MODE, mode);
  } catch {
    // Ignore storage errors
  }
  emit();
}

export function setGridPosition(position: GridPosition) {
  hydrateFromStorage();
  const clamped = {
    x: Math.max(0, Math.min(5, Math.round(position.x))),
    y: Math.max(0, Math.min(5, Math.round(position.y))),
  };
  state = { ...state, gridPosition: clamped };
  try {
    localStorage.setItem(STORAGE_KEY_POSITION, JSON.stringify(clamped));
  } catch {
    // Ignore storage errors
  }
  emit();
}

// ── Getters (for server render fallback) ──
function getSnapshot(): DynamicBioState {
  hydrateFromStorage();
  return state;
}

const SERVER_SNAPSHOT: DynamicBioState = {
  mode: "classic",
  gridPosition: DEFAULT_GRID_POSITION,
};

function getServerSnapshot(): DynamicBioState {
  return SERVER_SNAPSHOT;
}

// ── Subscribe function ──
function subscribe(callback: () => void) {
  hydrateFromStorage();
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// ── Hooks ──
export function useBioMode(): BioMode {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return s.mode;
}

export function useGridPosition(): GridPosition {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return s.gridPosition;
}

export function useDynamicBio() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleMode = useCallback(() => {
    setBioMode(s.mode === "classic" ? "dynamic" : "classic");
  }, [s.mode]);

  return {
    mode: s.mode,
    gridPosition: s.gridPosition,
    setMode: setBioMode,
    setGridPosition,
    toggleMode,
    isClassic: s.mode === "classic",
    isDynamic: s.mode === "dynamic",
  };
}

"use client";

import { useSyncExternalStore, useCallback } from "react";

// ── Storage key ──
const STORAGE_KEY = "feature-flags";

// ── Available feature flags ──
export type FeatureFlag = "dynamic-bio";

// ── Default values ──
const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
  "dynamic-bio": true, // Enabled by default
};

// ── State ──
let flags: Record<FeatureFlag, boolean> = { ...DEFAULT_FLAGS };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

// ── Hydrate from localStorage ──
let hydrated = false;

function hydrateFromStorage() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      flags = { ...DEFAULT_FLAGS, ...parsed };
    }
  } catch {
    // Ignore storage errors
  }
}

// ── Setters ──
export function setFeatureFlag(flag: FeatureFlag, enabled: boolean) {
  hydrateFromStorage();
  flags = { ...flags, [flag]: enabled };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  } catch {
    // Ignore storage errors
  }
  emit();
}

export function toggleFeatureFlag(flag: FeatureFlag) {
  hydrateFromStorage();
  setFeatureFlag(flag, !flags[flag]);
}

// ── Getters ──
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  hydrateFromStorage();
  return flags[flag] ?? DEFAULT_FLAGS[flag] ?? false;
}

// ── Subscribe function ──
function subscribe(callback: () => void) {
  hydrateFromStorage();
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): Record<FeatureFlag, boolean> {
  hydrateFromStorage();
  return flags;
}

function getServerSnapshot(): Record<FeatureFlag, boolean> {
  return { ...DEFAULT_FLAGS };
}

// ── Hooks ──
export function useFeatureFlag(flag: FeatureFlag): boolean {
  const allFlags = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return allFlags[flag] ?? DEFAULT_FLAGS[flag] ?? false;
}

export function useFeatureFlags() {
  const allFlags = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((flag: FeatureFlag) => {
    toggleFeatureFlag(flag);
  }, []);

  const set = useCallback((flag: FeatureFlag, enabled: boolean) => {
    setFeatureFlag(flag, enabled);
  }, []);

  return {
    flags: allFlags,
    isEnabled: (flag: FeatureFlag) => allFlags[flag] ?? DEFAULT_FLAGS[flag] ?? false,
    toggle,
    set,
  };
}

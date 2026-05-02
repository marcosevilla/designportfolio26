"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "portfolio-unlocked";

interface PasswordGateValue {
  unlocked: boolean;
  hydrated: boolean;
  isModalOpen: boolean;
  requestUnlock: () => void;
  closeModal: () => void;
  /** Returns true on successful unlock, false on bad code. */
  attemptUnlock: (password: string) => Promise<boolean>;
}

const PasswordGateContext = createContext<PasswordGateValue | null>(null);

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function PasswordGateProvider({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Read initial state from localStorage. Marked hydrated unconditionally
  // so consumers can render their post-hydration view.
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
    } catch {}
    setHydrated(true);
  }, []);

  // Multi-tab sync — unlock or lock in one tab propagates to others.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setUnlocked(e.newValue === "1");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const requestUnlock = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const attemptUnlock = useCallback(async (password: string): Promise<boolean> => {
    const expected = process.env.NEXT_PUBLIC_UNLOCK_CODE_HASH;
    if (!expected) {
      // Misconfigured build — fail closed. Surface to console so it's
      // visible in dev, but don't crash the page.
      console.warn("[PasswordGate] NEXT_PUBLIC_UNLOCK_CODE_HASH is not set.");
      return false;
    }
    const actual = await sha256Hex(password.trim().toLowerCase());
    if (actual === expected) {
      setUnlocked(true);
      setIsModalOpen(false);
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {}
      return true;
    }
    return false;
  }, []);

  return (
    <PasswordGateContext.Provider
      value={{ unlocked, hydrated, isModalOpen, requestUnlock, closeModal, attemptUnlock }}
    >
      {children}
    </PasswordGateContext.Provider>
  );
}

export function usePasswordGate() {
  const ctx = useContext(PasswordGateContext);
  if (!ctx) throw new Error("usePasswordGate must be used inside PasswordGateProvider");
  return ctx;
}

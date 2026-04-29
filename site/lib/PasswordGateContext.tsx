"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "portfolio-unlocked";
const PASSWORD = "marcopolo";

interface PasswordGateValue {
  unlocked: boolean;
  hydrated: boolean;
  isModalOpen: boolean;
  requestUnlock: () => void;
  closeModal: () => void;
  attemptUnlock: (password: string) => boolean;
}

const PasswordGateContext = createContext<PasswordGateValue | null>(null);

export function PasswordGateProvider({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
    } catch {}
    setHydrated(true);
  }, []);

  const requestUnlock = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const attemptUnlock = useCallback((password: string) => {
    if (password.trim().toLowerCase() === PASSWORD) {
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

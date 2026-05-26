"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type NavOverlayState = {
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
  toggleNav: () => void;
};

const Ctx = createContext<NavOverlayState | null>(null);

/** Global state for the hamburger nav overlay. The hamburger button in
 *  SiteHeader toggles `navOpen`; NavOverlay listens to render the
 *  sidebar; MainBlurLayer reads the same flag to blur the underlying
 *  page content while the overlay owns the screen. */
export function NavOverlayProvider({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const toggleNav = useCallback(() => setNavOpen((v) => !v), []);

  // Esc closes the overlay.
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  return (
    <Ctx.Provider value={{ navOpen, setNavOpen, toggleNav }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNavOverlay() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNavOverlay must be used inside NavOverlayProvider");
  return ctx;
}

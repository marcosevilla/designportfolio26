"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ChangelogOverlayState = {
  changelogOpen: boolean;
  setChangelogOpen: (open: boolean) => void;
  toggleChangelog: () => void;
};

const Ctx = createContext<ChangelogOverlayState | null>(null);

/** Global state for the "What's new" changelog overlay. The button in
 *  HeaderToolbar toggles `changelogOpen`; ChangelogOverlay listens to
 *  render the surface. Mirrors NavOverlayContext / ChatOverlayContext. */
export function ChangelogOverlayProvider({ children }: { children: React.ReactNode }) {
  const [changelogOpen, setChangelogOpen] = useState(false);
  const toggleChangelog = useCallback(() => setChangelogOpen((v) => !v), []);

  // Esc closes the overlay.
  useEffect(() => {
    if (!changelogOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setChangelogOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [changelogOpen]);

  return (
    <Ctx.Provider value={{ changelogOpen, setChangelogOpen, toggleChangelog }}>
      {children}
    </Ctx.Provider>
  );
}

export function useChangelogOverlay() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useChangelogOverlay must be used inside ChangelogOverlayProvider");
  return ctx;
}

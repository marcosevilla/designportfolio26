"use client";

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

export interface TOCItem {
  id: string;
  label: string;
}

interface SidebarContextValue {
  tocItems: TOCItem[] | null;
  setTocItems: (items: TOCItem[] | null) => void;
  activeTocId: string;
  /**
   * Update the active TOC id. Calls during the lock window (set by
   * setActiveTocIdAndLock) are ignored — this is what prevents the
   * IntersectionObserver in TOCObserver from clobbering the user's click
   * target as the smooth-scroll passes through intermediate sections.
   */
  setActiveTocId: (id: string) => void;
  /**
   * Set the active id immediately AND lock further updates for ms milliseconds.
   * Called by InlineTOC on link click so the user's intended destination wins
   * for the duration of the scroll animation.
   */
  setActiveTocIdAndLock: (id: string, ms: number) => void;
  backHref: string | null;
  setBackHref: (href: string | null) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  tocItems: null,
  setTocItems: () => {},
  activeTocId: "",
  setActiveTocId: () => {},
  setActiveTocIdAndLock: () => {},
  backHref: null,
  setBackHref: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [tocItems, setTocItems] = useState<TOCItem[] | null>(null);
  const [activeTocId, setActiveTocIdInternal] = useState("");
  const [backHref, setBackHref] = useState<string | null>(null);
  const lockUntilRef = useRef(0);

  const stableSetTocItems = useCallback((items: TOCItem[] | null) => setTocItems(items), []);
  const stableSetBackHref = useCallback((href: string | null) => setBackHref(href), []);

  const setActiveTocId = useCallback((id: string) => {
    if (Date.now() < lockUntilRef.current) return; // observer is locked out — click target wins
    setActiveTocIdInternal(id);
  }, []);

  const setActiveTocIdAndLock = useCallback((id: string, ms: number) => {
    lockUntilRef.current = Date.now() + ms;
    setActiveTocIdInternal(id);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        tocItems,
        setTocItems: stableSetTocItems,
        activeTocId,
        setActiveTocId,
        setActiveTocIdAndLock,
        backHref,
        setBackHref: stableSetBackHref,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

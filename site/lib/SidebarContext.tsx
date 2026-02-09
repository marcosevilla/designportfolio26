"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface TOCItem {
  id: string;
  label: string;
}

interface SidebarContextValue {
  tocItems: TOCItem[] | null;
  setTocItems: (items: TOCItem[] | null) => void;
  activeTocId: string;
  setActiveTocId: (id: string) => void;
  backHref: string | null;
  setBackHref: (href: string | null) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  tocItems: null,
  setTocItems: () => {},
  activeTocId: "",
  setActiveTocId: () => {},
  backHref: null,
  setBackHref: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [tocItems, setTocItems] = useState<TOCItem[] | null>(null);
  const [activeTocId, setActiveTocId] = useState("");
  const [backHref, setBackHref] = useState<string | null>(null);

  const stableSetTocItems = useCallback((items: TOCItem[] | null) => setTocItems(items), []);
  const stableSetActiveTocId = useCallback((id: string) => setActiveTocId(id), []);
  const stableSetBackHref = useCallback((href: string | null) => setBackHref(href), []);

  return (
    <SidebarContext.Provider
      value={{
        tocItems,
        setTocItems: stableSetTocItems,
        activeTocId,
        setActiveTocId: stableSetActiveTocId,
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

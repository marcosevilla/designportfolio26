"use client";

import { createContext, useContext, type RefObject } from "react";

interface ScrollContainerContextValue {
  /** The scrollable element. null = use window (default behavior). */
  scrollRef: RefObject<HTMLElement | null> | null;
}

const ScrollContainerContext = createContext<ScrollContainerContextValue>({
  scrollRef: null,
});

export function ScrollContainerProvider({
  scrollRef,
  children,
}: {
  scrollRef: RefObject<HTMLElement | null>;
  children: React.ReactNode;
}) {
  return (
    <ScrollContainerContext.Provider value={{ scrollRef }}>
      {children}
    </ScrollContainerContext.Provider>
  );
}

export function useScrollContainer() {
  return useContext(ScrollContainerContext);
}

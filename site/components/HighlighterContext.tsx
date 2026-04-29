"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type HighlightRange = {
  paraIdx: number;
  start: number;
  end: number;
  text: string;
};

type HighlighterCtx = {
  active: boolean;
  setActive: (v: boolean | ((prev: boolean) => boolean)) => void;
  highlight: HighlightRange | null;
  setHighlight: (h: HighlightRange | null) => void;
};

const HighlighterContext = createContext<HighlighterCtx | null>(null);

export function HighlighterProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [highlight, setHighlight] = useState<HighlightRange | null>(null);
  return (
    <HighlighterContext.Provider value={{ active, setActive, highlight, setHighlight }}>
      {children}
    </HighlighterContext.Provider>
  );
}

export function useHighlighter(): HighlighterCtx {
  const ctx = useContext(HighlighterContext);
  if (!ctx) throw new Error("useHighlighter must be used within HighlighterProvider");
  return ctx;
}

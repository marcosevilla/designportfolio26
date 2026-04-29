"use client";

import { createContext, useContext, useState, useEffect } from "react";

const MarqueeContext = createContext<{
  visible: boolean;
  toggle: () => void;
  setVisible: (v: boolean) => void;
}>({
  visible: true,
  toggle: () => {},
  setVisible: () => {},
});

export function MarqueeProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisibleState] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("marquee-visible");
    if (saved === "false") setVisibleState(false);
  }, []);

  const setVisible = (v: boolean) => {
    setVisibleState(v);
    localStorage.setItem("marquee-visible", String(v));
  };

  const toggle = () => setVisible(!visible);

  return (
    <MarqueeContext.Provider value={{ visible, toggle, setVisible }}>
      {children}
    </MarqueeContext.Provider>
  );
}

export function useMarquee() {
  return useContext(MarqueeContext);
}

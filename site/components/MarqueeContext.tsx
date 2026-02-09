"use client";

import { createContext, useContext, useState, useEffect } from "react";

const MarqueeContext = createContext({
  visible: true,
  toggle: () => {},
});

export function MarqueeProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("marquee-visible");
    if (saved === "false") setVisible(false);
  }, []);

  const toggle = () => {
    setVisible((v) => {
      localStorage.setItem("marquee-visible", String(!v));
      return !v;
    });
  };

  return (
    <MarqueeContext.Provider value={{ visible, toggle }}>
      {children}
    </MarqueeContext.Provider>
  );
}

export function useMarquee() {
  return useContext(MarqueeContext);
}

"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ChatOverlayState = {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  toggleChat: () => void;
};

const Ctx = createContext<ChatOverlayState | null>(null);

/** Global state for the chat overlay. ChatBar listens to render the
 *  surface; SiteHeader hides while open; MainBlurLayer blurs underlying
 *  page content. HeaderToolbar's chat trigger flips this directly. */
export function ChatOverlayProvider({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  const toggleChat = useCallback(() => setChatOpen((v) => !v), []);

  // Esc closes.
  useEffect(() => {
    if (!chatOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setChatOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen]);

  return (
    <Ctx.Provider value={{ chatOpen, setChatOpen, toggleChat }}>
      {children}
    </Ctx.Provider>
  );
}

export function useChatOverlay() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useChatOverlay must be used inside ChatOverlayProvider");
  return ctx;
}

"use client";

// Fixed-inset backdrop overlay. Click anywhere to close.
// Uses pointer-events-auto so it actually receives the click — the chat
// panel sits at a higher z-index and stops propagation.

import { motion } from "framer-motion";

export default function ChatOverlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      key="chat-overlay"
      onClick={onClose}
      className="fixed inset-0 z-[150]"
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-bg) 60%, transparent)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      aria-hidden
    />
  );
}

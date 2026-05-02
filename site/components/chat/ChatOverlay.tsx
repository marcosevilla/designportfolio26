"use client";

// Click-outside catcher for the chat panel. Visually transparent — when
// the panel overlaps body content (narrow viewport drawer mode), we keep
// the body clearly visible behind it. The user closes by clicking outside
// the panel surface; this element catches that click.
//
// Hidden entirely at lg+ via globals.css (.chat-overlay), since the
// persistent side panel leaves the page interactive.

import { motion } from "framer-motion";

export default function ChatOverlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      key="chat-overlay"
      onClick={onClose}
      className="chat-overlay fixed inset-0 z-[150]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      style={{
        // Fully transparent — no tint, no blur. The opacity transition still
        // runs so the click-target attaches/detaches without visual artifact.
        backgroundColor: "transparent",
      }}
      aria-hidden
    />
  );
}

"use client";

// Suggested-prompt chip rendered in the empty transcript state.
// One click → fills the input AND submits in the same gesture, so the
// visitor doesn't have to click twice.

import { motion } from "framer-motion";

const HOVER_SPRING = { type: "spring" as const, stiffness: 500, damping: 38 };

export default function ChipPrompt({
  label,
  onSelect,
}: {
  label: string;
  onSelect: (text: string) => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(label)}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={HOVER_SPRING}
      className="text-left rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "12px",
        lineHeight: 1.3,
        fontWeight: 500,
        color: "var(--color-fg-secondary)",
        backgroundColor: "color-mix(in srgb, var(--color-surface) 60%, transparent)",
        border: "1px solid color-mix(in srgb, var(--color-border) 60%, transparent)",
        padding: "7px 12px",
        cursor: "pointer",
      }}
    >
      {label}
    </motion.button>
  );
}

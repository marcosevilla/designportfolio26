"use client";

import { motion } from "framer-motion";

interface DynamicBioMinimizedHintProps {
  onClick: () => void;
}

export function DynamicBioMinimizedHint({ onClick }: DynamicBioMinimizedHintProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="
        flex items-center gap-2 px-3 py-1.5 rounded-full
        text-[11px] text-[var(--color-fg-tertiary)]
        border border-[var(--color-border)]
        bg-[var(--color-bg-secondary)]
        hover:bg-[var(--color-bg-tertiary)]
        hover:text-[var(--color-fg-secondary)]
        transition-colors duration-150
        cursor-pointer
      "
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      aria-label="Enable dynamic bio mode"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className="opacity-60"
      >
        <circle cx="2" cy="2" r="1" fill="currentColor" />
        <circle cx="6" cy="2" r="1" fill="currentColor" />
        <circle cx="10" cy="2" r="1" fill="currentColor" />
        <circle cx="2" cy="6" r="1" fill="currentColor" />
        <circle cx="6" cy="6" r="1.5" fill="currentColor" />
        <circle cx="10" cy="6" r="1" fill="currentColor" />
        <circle cx="2" cy="10" r="1" fill="currentColor" />
        <circle cx="6" cy="10" r="1" fill="currentColor" />
        <circle cx="10" cy="10" r="1" fill="currentColor" />
      </svg>
      <span>Adjust bio tone</span>
    </motion.button>
  );
}

export default DynamicBioMinimizedHint;

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function InlineExpandButton({
  prompt,
  onClick,
  disabled,
}: {
  prompt: string;
  onClick: () => void;
  disabled: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (hovered && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.bottom + 6,
        left: rect.left + rect.width / 2,
      });
    } else {
      setTooltipPos(null);
    }
  }, [hovered]);

  return (
    <>
      {/* Desktop: inline "+" with hover tooltip */}
      <motion.button
        ref={buttonRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        onClick={disabled ? undefined : onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={prompt}
        className="hidden md:inline-flex items-center justify-center border-none bg-transparent text-[var(--color-accent)] text-[20px] font-semibold leading-none px-0.5 ml-1 align-baseline relative transition-opacity duration-200"
        style={{ cursor: disabled ? "default" : "pointer" }}
      >
        +
      </motion.button>

      {/* Mobile: tappable pill with prompt text, rendered below paragraph */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        onClick={disabled ? undefined : onClick}
        className="md:hidden flex items-center gap-1 mt-3 py-1.5 px-3 rounded-[20px] border-none text-[13px] font-medium transition-colors duration-200"
        style={{
          backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
          color: "var(--color-accent)",
          cursor: disabled ? "default" : "pointer",
        }}
      >
        {prompt} <span className="text-[15px] font-semibold leading-none">+</span>
      </motion.button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {hovered && !disabled && tooltipPos && (
              <motion.span
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                transition={{ duration: 0.15 }}
                className="fixed whitespace-nowrap rounded-lg px-3 py-1 text-[13px] leading-relaxed pointer-events-none z-[9999]"
                style={{
                  top: tooltipPos.top,
                  left: tooltipPos.left,
                  transform: "translateX(-50%)",
                  backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
                  color: "var(--color-accent)",
                }}
              >
                {prompt}
              </motion.span>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

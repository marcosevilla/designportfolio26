"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_ITEMS, useActiveSection, type NavItem } from "./HomeNav";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";

const PILL_SHADOW =
  "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.18)";

const TINT_ACTIVE = "color-mix(in srgb, var(--color-accent) 14%, transparent)";

/** Mobile/tablet section nav. Fixed to the bottom of the viewport,
 *  horizontal layout. Mirrors the desktop HomeNav's behavior (in-page
 *  anchors + About-me page link) but in a single-row pill. Renders only
 *  below lg; the desktop nav lives in HomeLayout's left column at lg+. */
export default function MobileSectionNav({
  aboutMeOpen = false,
  onAboutMeOpen,
  onAboutMeClose,
}: {
  aboutMeOpen?: boolean;
  onAboutMeOpen?: () => void;
  onAboutMeClose?: () => void;
}) {
  const { activeId, setAndLock } = useActiveSection();
  const { overlayOpen } = useAudioPlayer();
  const [pressed, setPressed] = useState<string | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
    e.preventDefault();
    if (item.kind === "page" && item.id === "about") {
      if (aboutMeOpen) onAboutMeClose?.();
      else onAboutMeOpen?.();
      return;
    }
    const id = item.id;
    setAndLock(id);
    const section = document.getElementById(id);
    if (!section) return;
    if (id === "projects") {
      const firstCard = section.querySelector(
        "button[aria-label^='Open project gallery']"
      ) as HTMLElement | null;
      if (firstCard) {
        firstCard.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <AnimatePresence>
      {!overlayOpen && (
    <motion.nav
      key="mobile-section-nav"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Primary"
      className="lg:hidden fixed bottom-3 left-3 right-3 z-[80] pointer-events-none"
    >
      <div
        className="pointer-events-auto flex items-center justify-around gap-1 px-1.5 py-1.5"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--color-bg) 80%, var(--color-surface-raised))",
          border: "1px solid color-mix(in srgb, var(--color-border) 60%, transparent)",
          boxShadow: PILL_SHADOW,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active =
            item.kind === "page"
              ? item.id === "about" && aboutMeOpen
              : item.id === activeId && !aboutMeOpen;
          return (
            <a
              key={item.id}
              href={item.kind === "page" ? "#" : `#${item.id}`}
              onClick={(e) => handleClick(e, item)}
              onPointerDown={() => setPressed(item.id)}
              onPointerUp={() => setPressed(null)}
              onPointerCancel={() => setPressed(null)}
              aria-current={active ? "page" : undefined}
              className="flex-1 inline-flex items-center justify-center h-9 transition-colors focus:outline-none"
              style={{
                fontFamily:
                  "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                fontSize: 11,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: active
                  ? "var(--color-accent)"
                  : "var(--color-fg-secondary)",
                backgroundColor: active
                  ? TINT_ACTIVE
                  : pressed === item.id
                  ? "color-mix(in srgb, var(--color-accent) 6%, transparent)"
                  : "transparent",
                borderRadius: 0,
                transform: pressed === item.id ? "scale(0.97)" : "scale(1)",
                transition: "transform 120ms ease-out, background-color 150ms ease-out",
              }}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </motion.nav>
      )}
    </AnimatePresence>
  );
}

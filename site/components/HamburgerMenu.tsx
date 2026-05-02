"use client";

// Compressed-mode nav replacement.
//
// When the chat side panel is open at lg+ but the viewport is too narrow
// to also fit HomeNav (homepage left rail) or InlineTOC (case-study left
// rail), those rails get hidden via CSS and this hamburger button appears
// in their place — in HeroToolbar's iconRow on the homepage, and in
// MobileNav on case-study pages.
//
// Click the trigger → a left-side panel slides in mirroring the chat
// panel's chrome (same .chat-surface background, border, shadow, and
// rounded corners). Inside:
//   - Case study (tocItems present) → Back link + TOC items
//   - Homepage (tocItems null) → Home / Work / Playground anchors
//
// A second hamburger icon at the top of the panel closes it (toggle), and
// ESC + click-outside also close.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/lib/SidebarContext";
import { HOME_NAV_ITEMS } from "./HomeNav";
import { BackChevronIcon } from "./Icons";

const PANEL_SPRING = { type: "spring" as const, stiffness: 380, damping: 33 };
const BACKDROP_EASE = [0.22, 1, 0.36, 1] as const;

function HamburgerIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
    </svg>
  );
}

const NAV_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
  fontSize: "12px",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  lineHeight: 1,
};

export default function HamburgerMenu({
  className = "",
}: {
  /** Extra Tailwind utilities for the trigger button — used to vary
   *  visibility selectors between HeroToolbar and MobileNav contexts. */
  className?: string;
}) {
  const { tocItems, activeTocId, setActiveTocIdAndLock, backHref } = useSidebar();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // ESC closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isCaseStudy = tocItems !== null;
  const items = isCaseStudy ? tocItems : HOME_NAV_ITEMS;

  const handleHomeAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleTocClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setOpen(false);
    setActiveTocIdAndLock(id, 900);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Trigger — toggles the panel. Hidden until compressed via .chat-cmp-show. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className={`chat-cmp-show bio-toolbar-btn ${className}`}
      >
        <HamburgerIcon size={16} />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                {/* Click-outside catcher. Transparent — content stays clearly
                    visible behind the panel; the user closes by clicking
                    anywhere outside the panel surface. */}
                <motion.div
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 z-[150]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: BACKDROP_EASE }}
                  style={{ backgroundColor: "transparent" }}
                  aria-hidden
                />
                {/* Panel — left edge, mirrors chat panel: 12px gutters, 360px,
                    .chat-surface chrome (border, shadow, rounded). */}
                <motion.div
                  key="hamburger-panel"
                  className="chat-surface fixed top-3 bottom-3 left-3 z-[160] flex flex-col"
                  style={{ width: "min(calc(100vw - 24px), 360px)" }}
                  initial={{ x: -380, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -380, opacity: 0 }}
                  transition={PANEL_SPRING}
                  role="dialog"
                  aria-label="Navigation menu"
                >
                  {/* Header — hamburger icon (close toggle) + label. */}
                  <div
                    className="flex items-center gap-2 px-4 pt-3 pb-2"
                    style={{
                      borderBottom:
                        "1px solid color-mix(in srgb, var(--color-border) 30%, transparent)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label="Close menu"
                      className="rounded-full p-1.5 transition-colors hover:bg-(--color-muted) focus:outline-none focus-visible:ring-1 focus-visible:ring-(--color-accent) -ml-1.5"
                      style={{ color: "var(--color-fg-secondary)", cursor: "pointer" }}
                    >
                      <HamburgerIcon size={14} />
                    </button>
                    <span
                      style={{
                        ...NAV_LABEL_STYLE,
                        color: "var(--color-fg-tertiary)",
                      }}
                    >
                      {isCaseStudy ? "Contents" : "Menu"}
                    </span>
                  </div>

                  {/* Body — Back link first (case study), then nav items. */}
                  <div className="flex-1 overflow-y-auto p-3">
                    {isCaseStudy && (
                      <Link
                        href={backHref ?? "/#projects"}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-1.5 px-2 py-2 mb-1 rounded-md transition-colors hover:text-(--color-accent)"
                        style={{
                          ...NAV_LABEL_STYLE,
                          color: "var(--color-fg-secondary)",
                        }}
                      >
                        <BackChevronIcon size={12} />
                        Back
                      </Link>
                    )}
                    <ul className="flex flex-col">
                      {items.map((item) => {
                        const active = isCaseStudy && item.id === activeTocId;
                        return (
                          <li key={item.id}>
                            <a
                              href={`#${item.id}`}
                              onClick={(e) =>
                                isCaseStudy
                                  ? handleTocClick(e, item.id)
                                  : handleHomeAnchorClick(e, item.id)
                              }
                              className="block px-2 py-2 rounded-md transition-colors hover:bg-(--color-muted) hover:text-(--color-accent)"
                              style={{
                                ...NAV_LABEL_STYLE,
                                color: active
                                  ? "var(--color-accent)"
                                  : "var(--color-fg-secondary)",
                              }}
                            >
                              {item.label}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

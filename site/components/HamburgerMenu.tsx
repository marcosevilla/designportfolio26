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
import { BackChevronIcon, CloseIcon } from "./Icons";
import ConnectLinks from "./ConnectLinks";

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
  // Mobile gets a full-page takeover sheet (large nav, X close, slides in
  // from the left). Desktop keeps the existing 360px chat-surface drawer.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

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
                    anywhere outside the panel surface. Mobile takeover is
                    opaque, so the catcher is harmless underneath. */}
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
                {isMobile ? (
                  /* Mobile: full-page takeover. Slides in from the left,
                     opaque page bg, large nav controls, X close at top. */
                  <motion.div
                    key="hamburger-panel-mobile"
                    className="fixed inset-0 z-[160] flex flex-col"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      paddingTop: "max(env(safe-area-inset-top, 0px), 16px)",
                      paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)",
                    }}
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={PANEL_SPRING}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Navigation menu"
                  >
                    {/* Top bar — small mono label on the left, X on the right. */}
                    <div className="flex items-center justify-between px-6 pb-4 pt-2">
                      <span
                        style={{
                          ...NAV_LABEL_STYLE,
                          color: "var(--color-fg-tertiary)",
                        }}
                      >
                        {isCaseStudy ? "Contents" : "Menu"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Close menu"
                        className="rounded-full w-11 h-11 inline-flex items-center justify-center transition-colors hover:bg-(--color-muted) focus:outline-none focus-visible:ring-1 focus-visible:ring-(--color-accent) active:scale-[0.96]"
                        // Solid fg (not the 60%-alpha fg-secondary) so the
                        // two strokes of the X don't double-paint at their
                        // crossing point — the alpha overlap was reading as
                        // a darker pixel in the middle of the glyph.
                        style={{ color: "var(--color-fg)", cursor: "pointer" }}
                      >
                        <CloseIcon size={16} />
                      </button>
                    </div>

                    {/* Body — Back link first (case study), then big nav items. */}
                    <div className="flex-1 overflow-y-auto px-6 pt-4">
                      {isCaseStudy && (
                        <Link
                          href={backHref ?? "/#projects"}
                          onClick={() => setOpen(false)}
                          className="inline-flex items-center gap-2 mb-8 transition-colors hover:text-(--color-accent)"
                          style={{
                            ...NAV_LABEL_STYLE,
                            color: "var(--color-fg-secondary)",
                          }}
                        >
                          <BackChevronIcon size={14} />
                          Back
                        </Link>
                      )}
                      <ul className="flex flex-col gap-1">
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
                                className="block py-3 transition-colors hover:text-(--color-accent)"
                                style={{
                                  fontFamily: "var(--font-sans)",
                                  fontSize: "32px",
                                  fontWeight: 500,
                                  letterSpacing: "-0.02em",
                                  lineHeight: 1.15,
                                  color: active
                                    ? "var(--color-accent)"
                                    : "var(--color-fg)",
                                }}
                              >
                                {item.label}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                      {/* Social links (X / LinkedIn / email) — surface
                          them inside the mobile menu since the
                          desktop-only HomeNav left rail isn't visible
                          here. ConnectLinks already renders the right
                          icon set and hover treatment. */}
                      <div className="mt-10 pt-6" style={{ borderTop: "1px solid var(--color-border)" }}>
                        <span
                          style={{
                            ...NAV_LABEL_STYLE,
                            color: "var(--color-fg-tertiary)",
                          }}
                        >
                          Connect
                        </span>
                        <ConnectLinks />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                /* Desktop: 360px left-edge drawer with chat-surface chrome. */
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
                        // py-4 + 12px text = 44px tap target (was py-2 = 28px,
                        // below the 40×40 mobile minimum)
                        className="flex items-center gap-1.5 px-2 py-4 mb-1 rounded-md transition-colors hover:text-(--color-accent)"
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
                              // py-4 = 44px tap target on mobile; full row
                              // hit area thanks to `block`. Was py-2 (28px).
                              className="block px-2 py-4 rounded-md transition-colors hover:bg-(--color-muted) hover:text-(--color-accent)"
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
                )}
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useThemeState, PaletteIcon } from "./ThemeToggle";
import { useMarquee } from "./MarqueeContext";
import { useActivePanel, requestGoToWork, requestGoToBio } from "./SectionSnapContext";
import { useDynamicBio } from "@/lib/dynamic-bio-store";
import { useSidebar } from "@/lib/SidebarContext";
import ThemePalette from "./ThemePalette";

const navLinks = [
  { href: "/", label: "Home", disabled: false },
  { href: "/#work", label: "Work", disabled: false },
  { href: "/writing", label: "Writing", disabled: true },
  { href: "/play", label: "Play", disabled: true },
];

function SidebarIcon({
  label,
  href,
  external,
  onClick,
  children,
}: {
  label: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const Tag = href ? motion.a : motion.button;
  const linkProps = href
    ? { href, ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}) }
    : { onClick };

  return (
    <Tag
      {...(linkProps as any)}
      className="flex items-center justify-start"
      style={{ color: hovered ? "var(--color-accent)" : "var(--color-fg-secondary)" }}
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{ x: hovered ? 4 : 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </Tag>
  );
}

export default function DesktopSidebar() {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { visible: marqueeVisible, toggle: toggleMarquee } = useMarquee();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const paletteButtonRef = useRef<HTMLDivElement>(null);
  const [anchorPos, setAnchorPos] = useState<{ top: number; left: number } | null>(null);

  const snapPanel = useActivePanel();
  const themeState = useThemeState();
  const dynamicBio = useDynamicBio();
  const { tocItems, activeTocId, backHref } = useSidebar();
  const tocListRef = useRef<HTMLUListElement>(null);
  const [measuredTocTops, setMeasuredTocTops] = useState<number[]>([]);

  const togglePalette = useCallback(() => {
    if (!paletteOpen && paletteButtonRef.current) {
      const rect = paletteButtonRef.current.getBoundingClientRect();
      setAnchorPos({ top: rect.top, left: rect.right + 8 });
    }
    setPaletteOpen((o) => !o);
  }, [paletteOpen]);

  // ── Nav mode helpers ──
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" && snapPanel === "bio";
    if (href === "/#work") return (pathname === "/" && snapPanel === "work") || pathname.startsWith("/work");
    return pathname.startsWith(href);
  };

  const handleLinkClick = useCallback(
    (e: React.MouseEvent, href: string) => {
      if (href === "/#work") {
        if (pathname === "/") {
          e.preventDefault();
          requestGoToWork();
        }
      } else if (href === "/" && pathname === "/") {
        e.preventDefault();
        requestGoToBio();
      }
    },
    [pathname]
  );

  // ── TOC mode helpers ──
  const handleTocClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Determine mode ──
  const isTocMode = tocItems !== null;

  // Active index for star positioning
  const navActiveIndex = navLinks.findIndex((link) => isActive(link.href));
  const tocActiveIndex = isTocMode ? tocItems.findIndex((item) => item.id === activeTocId) : -1;
  const activeIndex = isTocMode ? tocActiveIndex : navActiveIndex;

  // Measure actual TOC item positions from DOM (avoids hardcoded spacing drift)
  useEffect(() => {
    if (!isTocMode || !tocListRef.current) {
      setMeasuredTocTops([]);
      return;
    }
    const items = tocListRef.current.querySelectorAll(":scope > li");
    setMeasuredTocTops(
      Array.from(items).map((li) => (li as HTMLElement).offsetTop)
    );
  }, [isTocMode, tocItems]);

  const tocStarY =
    activeIndex >= 0 && measuredTocTops[activeIndex] != null
      ? measuredTocTops[activeIndex]
      : 0;
  const navStarY = activeIndex * 36;

  return (
    <>
      <aside className="hidden lg:flex sticky top-0 h-screen w-[200px] shrink-0 flex-col pt-[18vh] pb-36">
        {/* Items list */}
        <div className="flex-1 min-h-0">
          {isTocMode ? (
            /* ── TOC Mode ── */
            <div>
              <Link
                href={backHref ?? "/#work"}
                className="flex items-center gap-1 text-[14px] mb-6 transition-colors hover:text-[var(--color-accent)]"
                style={{ color: "var(--color-fg-secondary)" }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 12L6 8l4-4" />
                </svg>
                Back
              </Link>
              <ul
                ref={tocListRef}
                className="flex flex-col gap-2 relative"
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {activeIndex >= 0 && (
                  <motion.span
                    className="absolute left-0 pointer-events-none"
                    style={{
                      color: "var(--color-accent)",
                      fontSize: "12px",
                      lineHeight: "20px",
                    }}
                    animate={{
                      y: tocStarY,
                      opacity: 1,
                    }}
                    initial={{ y: tocStarY, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 34,
                    }}
                    aria-hidden
                  >
                    ✸
                  </motion.span>
                )}
                {tocItems.map((item, index) => {
                  const active = item.id === activeTocId;
                  const isHovered = hoveredIndex === index;
                  const textColor = isHovered || active
                    ? "var(--color-accent)"
                    : "var(--color-fg-secondary)";

                  return (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        onClick={(e) => handleTocClick(e, item.id)}
                        className="block transition-colors"
                        style={{ fontSize: "14px", fontWeight: 400, lineHeight: "20px" }}
                        onMouseEnter={() => setHoveredIndex(index)}
                      >
                        <motion.span
                          className="inline-block"
                          animate={{ x: active ? 18 : isHovered ? 8 : 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25,
                          }}
                          style={{ color: textColor }}
                        >
                          {item.label}
                        </motion.span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            /* ── Nav Mode ── */
            <ul
              className="flex flex-col gap-3 relative"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {activeIndex >= 0 && (
                <motion.span
                  className="absolute left-0 pointer-events-none"
                  style={{
                    color: "var(--color-accent)",
                    fontSize: "14px",
                    lineHeight: "24px",
                  }}
                  animate={{
                    y: navStarY,
                    opacity: 1,
                  }}
                  initial={{ y: navStarY, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 28,
                  }}
                  aria-hidden
                >
                  ✸
                </motion.span>
              )}
              {navLinks.map((link, index) => {
                const active = !link.disabled && isActive(link.href);
                const isHovered = !link.disabled && hoveredIndex === index;
                const textColor = link.disabled
                  ? "var(--color-fg-tertiary)"
                  : isHovered || active
                    ? "var(--color-accent)"
                    : "var(--color-fg-secondary)";

                return (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.06,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                  >
                    {link.disabled ? (
                      <span
                        className="block"
                        style={{ fontSize: "16px", fontWeight: 500, color: textColor, cursor: "default" }}
                      >
                        {link.label}
                      </span>
                    ) : (
                      <Link
                        href={link.href}
                        className="block transition-colors"
                        style={{ fontSize: "16px", fontWeight: 500 }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onClick={(e) => handleLinkClick(e, link.href)}
                      >
                        <motion.span
                          className="inline-block"
                          animate={{ x: active ? 18 : isHovered ? 8 : 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25,
                          }}
                          style={{ color: textColor }}
                        >
                          {link.label}
                        </motion.span>
                      </Link>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Icon buttons — always at bottom */}
        <div className="flex flex-col items-start gap-4 mt-8">
          <SidebarIcon href="mailto:hello@marcosevilla.com" label="Email">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 4L12 13 2 4" />
            </svg>
          </SidebarIcon>
          <SidebarIcon href="https://www.linkedin.com/in/marcogsevilla/" label="LinkedIn" external>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </SidebarIcon>
          {themeState.mounted ? (
            <div ref={paletteButtonRef}>
              <SidebarIcon label="Theme palette" onClick={togglePalette}>
                <PaletteIcon />
              </SidebarIcon>
            </div>
          ) : (
            <div style={{ height: 18 }} aria-hidden />
          )}
          <SidebarIcon label={marqueeVisible ? "Hide quotes" : "Show quotes"} onClick={toggleMarquee}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: marqueeVisible ? 1 : 0.4 }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M8 9.5c0-.3.2-.5.5-.5s.5.2.5.5-.2.5-.5.5-.5-.2-.5-.5ZM14.5 9.5c0-.3.2-.5.5-.5s.5.2.5.5-.2.5-.5.5-.5-.2-.5-.5Z" fill="currentColor" stroke="none" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            </svg>
          </SidebarIcon>
        </div>
      </aside>

      {/* Desktop palette */}
      <div className="hidden lg:block">
        <ThemePalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          mode={themeState.mode}
          coloredThemeName={themeState.coloredThemeName}
          fontPairingName={themeState.fontPairingName}
          fontSizeOffset={themeState.fontSizeOffset}
          bioMode={dynamicBio.mode}
          gridPosition={dynamicBio.gridPosition}
          onBioModeToggle={dynamicBio.toggleMode}
          onGridPositionChange={dynamicBio.setGridPosition}
          onSelectLight={themeState.selectLight}
          onSelectDark={themeState.selectDark}
          onSelectColored={themeState.selectColored}
          onSelectFont={themeState.selectFont}
          onIncreaseFontSize={themeState.increaseFontSize}
          onDecreaseFontSize={themeState.decreaseFontSize}
          onResetAll={themeState.resetAll}
          anchorPos={anchorPos}
        />
      </div>
    </>
  );
}

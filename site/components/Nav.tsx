"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { SPRING_SNAP } from "@/lib/springs";
import { useRouter } from "next/navigation";
import { useThemeState } from "./ThemeToggle";
import { PaletteIcon } from "./Icons";
import { useMarquee } from "./MarqueeContext";
import { useActivePanel, requestGoToWork, requestGoToBio } from "./SectionSnapContext";
import { useDynamicBio } from "@/lib/dynamic-bio-store";
import ThemePalette from "./ThemePalette";

const links = [
  { href: "/", label: "Home" },
  { href: "/#work", label: "Work" },
  { href: "/writing", label: "Writing" },
  { href: "/play", label: "Play" },
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
      transition={SPRING_SNAP}
    >
      {children}
    </Tag>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { visible: marqueeVisible, toggle: toggleMarquee } = useMarquee();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const paletteButtonRef = useRef<HTMLDivElement>(null);
  const [anchorPos, setAnchorPos] = useState<{ top: number; left: number } | null>(null);

  const router = useRouter();
  const snapPanel = useActivePanel();
  const themeState = useThemeState();
  const dynamicBio = useDynamicBio();

  const togglePalette = useCallback(() => {
    if (!paletteOpen && paletteButtonRef.current) {
      const rect = paletteButtonRef.current.getBoundingClientRect();
      setAnchorPos({ top: rect.bottom + 4, left: rect.right + 4 });
    }
    setPaletteOpen((o) => !o);
  }, [paletteOpen]);

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

  const activeIndex = links.findIndex((link) => isActive(link.href));
  const starIndex = activeIndex;

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed top-0 left-0 h-screen w-[100px] flex-col px-8 pb-8 pt-[22vh] z-50">
        <ul
          className="flex flex-col gap-3 relative"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {starIndex >= 0 && (
            <motion.span
              className="absolute left-0 pointer-events-none"
              style={{
                color: "var(--color-accent)",
                fontSize: "14px",
                lineHeight: "24px",
              }}
              animate={{
                y: starIndex * 36,
                opacity: 1,
              }}
              initial={{ y: starIndex * 36, opacity: 0 }}
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

          {links.map((link, index) => {
            const active = isActive(link.href);
            const isHovered = hoveredIndex === index;
            const textColor = isHovered || active
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
              </motion.li>
            );
          })}
        </ul>

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
      </nav>

      {/* Desktop palette */}
      <div className="hidden md:block">
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

      {/* Mobile top bar */}
      <nav className="md:hidden sticky top-0 z-50 backdrop-blur-md bg-[var(--color-bg)]/80 border-b border-[var(--color-border)]">
        <div className="px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-x-4">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1 transition-colors"
                  style={{ fontSize: "14px" }}
                  onClick={(e) => handleLinkClick(e, link.href)}
                >
                  {active && (
                    <span style={{ color: "var(--color-accent)", fontSize: "12px" }}>
                      ✸
                    </span>
                  )}
                  <span
                    style={{
                      color: active
                        ? "var(--color-accent)"
                        : "var(--color-fg-secondary)",
                    }}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
          {themeState.mounted && (
            <button
              onClick={togglePalette}
              className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-[var(--color-muted)] transition-colors"
              aria-label="Theme palette"
              style={{ color: "var(--color-fg-secondary)" }}
            >
              <PaletteIcon />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile palette (bottom sheet) */}
      <div className="md:hidden">
        <ThemePalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          mode={themeState.mode}
          coloredThemeName={themeState.coloredThemeName}
          fontPairingName={themeState.fontPairingName}
          fontSizeOffset={themeState.fontSizeOffset}
          onSelectLight={themeState.selectLight}
          onSelectDark={themeState.selectDark}
          onSelectColored={themeState.selectColored}
          onSelectFont={themeState.selectFont}
          onIncreaseFontSize={themeState.increaseFontSize}
          onDecreaseFontSize={themeState.decreaseFontSize}
          onResetAll={themeState.resetAll}
          isMobile
        />
      </div>
    </>
  );
}

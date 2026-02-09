"use client";

import { useState, useRef, useCallback } from "react";
import { useThemeState, PaletteIcon } from "./ThemeToggle";
import { useMarquee } from "./MarqueeContext";
import { useDynamicBio } from "@/lib/dynamic-bio-store";
import ThemePalette from "./ThemePalette";

function FooterIcon({
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
  const Tag = href ? "a" : "button";
  const linkProps = href
    ? { href, ...(external ? { target: "_blank" as const, rel: "noopener noreferrer" } : {}) }
    : { onClick };

  return (
    <Tag
      {...(linkProps as any)}
      className="flex items-center justify-center w-9 h-9 transition-colors text-[var(--color-fg-secondary)] hover:text-[var(--color-accent)]"
      aria-label={label}
    >
      {children}
    </Tag>
  );
}

export default function StickyFooter() {
  const { visible: marqueeVisible, toggle: toggleMarquee } = useMarquee();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const paletteButtonRef = useRef<HTMLDivElement>(null);
  const [anchorPos, setAnchorPos] = useState<{ top: number; left: number } | null>(null);
  const themeState = useThemeState();
  const dynamicBio = useDynamicBio();

  const togglePalette = useCallback(() => {
    if (!paletteOpen && paletteButtonRef.current) {
      const rect = paletteButtonRef.current.getBoundingClientRect();
      setAnchorPos({ top: rect.top - 8, left: rect.left });
    }
    setPaletteOpen((o) => !o);
  }, [paletteOpen]);

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md bg-[var(--color-bg)]/80 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-center gap-4 h-12">
          <FooterIcon href="mailto:hello@marcosevilla.com" label="Email">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 4L12 13 2 4" />
            </svg>
          </FooterIcon>
          <FooterIcon href="https://www.linkedin.com/in/marcogsevilla/" label="LinkedIn" external>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </FooterIcon>
          {themeState.mounted && (
            <div ref={paletteButtonRef}>
              <FooterIcon label="Theme palette" onClick={togglePalette}>
                <PaletteIcon />
              </FooterIcon>
            </div>
          )}
          <FooterIcon label={marqueeVisible ? "Hide quotes" : "Show quotes"} onClick={toggleMarquee}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: marqueeVisible ? 1 : 0.4 }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M8 9.5c0-.3.2-.5.5-.5s.5.2.5.5-.2.5-.5.5-.5-.2-.5-.5ZM14.5 9.5c0-.3.2-.5.5-.5s.5.2.5.5-.2.5-.5.5-.5-.2-.5-.5Z" fill="currentColor" stroke="none" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            </svg>
          </FooterIcon>
        </div>
      </footer>

      {/* Theme palette — desktop panel */}
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

      {/* Theme palette — mobile bottom sheet */}
      <div className="lg:hidden">
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

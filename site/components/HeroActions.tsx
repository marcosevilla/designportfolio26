"use client";

import { useState, useRef, useCallback } from "react";
import { useThemeState } from "./ThemeToggle";
import { useMarquee } from "./MarqueeContext";
import ThemePalette from "./ThemePalette";
import { EmailIcon, LinkedInIcon, MusicNoteIcon, PaletteIcon, SmileyIcon } from "./Icons";

function ActionIcon({
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
    : { onClick, type: "button" as const };

  return (
    <Tag
      {...(linkProps as any)}
      className="flex items-center justify-center transition-colors text-[var(--color-fg-secondary)] hover:text-[var(--color-accent)]"
      aria-label={label}
    >
      {children}
    </Tag>
  );
}

export default function HeroActions() {
  const { visible: marqueeVisible, toggle: toggleMarquee } = useMarquee();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const paletteButtonRef = useRef<HTMLDivElement>(null);
  const [anchorPos, setAnchorPos] = useState<{ top: number; left: number } | null>(null);
  const themeState = useThemeState();

  const togglePalette = useCallback(() => {
    if (!paletteOpen && paletteButtonRef.current) {
      const rect = paletteButtonRef.current.getBoundingClientRect();
      setAnchorPos({ top: rect.bottom + 8, left: rect.left });
    }
    setPaletteOpen((o) => !o);
  }, [paletteOpen]);

  return (
    <>
      <div className="flex items-center gap-3">
        <ActionIcon href="mailto:hello@marcosevilla.com" label="Email">
          <EmailIcon size={14} />
        </ActionIcon>
        <ActionIcon
          href="https://www.linkedin.com/in/marcogsevilla/"
          label="LinkedIn"
          external
        >
          <LinkedInIcon size={14} />
        </ActionIcon>
        {themeState.mounted && (
          <div ref={paletteButtonRef}>
            <ActionIcon label="Theme palette" onClick={togglePalette}>
              <PaletteIcon size={14} />
            </ActionIcon>
          </div>
        )}
        <ActionIcon
          label={marqueeVisible ? "Hide quotes" : "Show quotes"}
          onClick={toggleMarquee}
        >
          <SmileyIcon size={14} style={{ opacity: marqueeVisible ? 1 : 0.4 }} />
        </ActionIcon>
        {/* Placeholder — music player coming soon */}
        <ActionIcon label="Music player (coming soon)">
          <MusicNoteIcon size={14} style={{ opacity: 0.4 }} />
        </ActionIcon>
      </div>

      {/* Theme palette — desktop panel */}
      <div className="hidden lg:block">
        <ThemePalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          mode={themeState.mode}
          coloredThemeName={themeState.coloredThemeName}
          fontSizeOffset={themeState.fontSizeOffset}
          onSelectLight={themeState.selectLight}
          onSelectDark={themeState.selectDark}
          onSelectColored={themeState.selectColored}
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
          fontSizeOffset={themeState.fontSizeOffset}
          onSelectLight={themeState.selectLight}
          onSelectDark={themeState.selectDark}
          onSelectColored={themeState.selectColored}
          onIncreaseFontSize={themeState.increaseFontSize}
          onDecreaseFontSize={themeState.decreaseFontSize}
          onResetAll={themeState.resetAll}
          isMobile
        />
      </div>
    </>
  );
}

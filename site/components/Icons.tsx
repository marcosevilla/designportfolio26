/** Shared SVG icons. All accept `size` override and inherit `currentColor`. */

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ── Navigation ──

export function BackChevronIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 12L6 8l4-4" />
    </svg>
  );
}

// ── View toggles ──

// All view-toggle icons use viewBox 24×24 with strokeWidth 1.5, matching the
// EmailIcon / LinkedInIcon / PaletteIcon / SmileyIcon family rendered by
// HeroActions. Same proportional stroke weight regardless of render size.
export function GridIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="4" width="6" height="6" />
      <rect x="14" y="4" width="6" height="6" />
      <rect x="4" y="14" width="6" height="6" />
      <rect x="14" y="14" width="6" height="6" />
    </svg>
  );
}

export function ListIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function CarouselIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="8" width="4" height="8" />
      <rect x="10" y="5" width="4" height="14" />
      <rect x="16" y="8" width="4" height="8" />
    </svg>
  );
}

export function FilterIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18M6 12h12M9 18h6" />
    </svg>
  );
}

// ── Status ──

export function LockIcon({ size = 12, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="5" y="11" width="14" height="10" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

// ── Actions ──

export function CloseIcon({ size = 10, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <line x1="2" y1="2" x2="8" y2="8" />
      <line x1="8" y1="2" x2="2" y2="8" />
    </svg>
  );
}

export function PlusIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function MinusIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function ResetIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 105.64-11.36L1 10" />
    </svg>
  );
}

export function ExternalArrowIcon({ size = 12, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M4 8L8 4" />
      <path d="M4.5 4H8v3.5" />
    </svg>
  );
}

// ── Footer / social ──

export function EmailIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 4L12 13 2 4" />
    </svg>
  );
}

export function LinkedInIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

// X (formerly Twitter) — stylized X glyph rendered as two crossing strokes.
export function XIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 4l16 16" />
      <path d="M20 4L4 20" />
    </svg>
  );
}

export function PaletteIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 9 9c0 1.66-1.34 3-3 3h-1.5a1.5 1.5 0 0 0-1.5 1.5c0 .42.13.8.36 1.1.23.3.39.65.39 1.05 0 .8-.65 1.45-1.45 1.45z" />
      <circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="5.75" r="1" fill="currentColor" stroke="none" />
      <circle cx="17.25" cy="8.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SunIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M4.93 19.07l1.41-1.41" />
      <path d="M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function MoonIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

// ── Transport (music player) ──

export function PlayIcon({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M8 5.5L19 12 8 18.5z" />
    </svg>
  );
}

export function PauseIcon({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M9 6v12M15 6v12" />
    </svg>
  );
}

export function SkipBackIcon({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M6 6v12" />
      <path d="M19 6L9 12l10 6z" />
    </svg>
  );
}

export function SkipForwardIcon({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M18 6v12" />
      <path d="M5 6l10 6L5 18z" />
    </svg>
  );
}

// ── Visualizer scenes ──

// Waveform — clean oscilloscope sine wave, two cycles.
export function WaveformSceneIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M2 12 C 5 4, 8 4, 9 12 S 13 20, 14 12 S 18 4, 19 12 S 22 20, 22 12" />
    </svg>
  );
}

// Sparkles — scattered four-point star sparkles (bass-reactive sparkle field).
export function SparklesSceneIcon({ size = 16, className, style }: IconProps) {
  const spark = "M0 -3 L0.7 -0.7 L3 0 L0.7 0.7 L0 3 L-0.7 0.7 L-3 0 L-0.7 -0.7 Z";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className} style={style}>
      <path transform="translate(7 8) scale(1.1)" d={spark} />
      <path transform="translate(16 7) scale(0.7)" d={spark} />
      <path transform="translate(13 15) scale(0.85)" d={spark} />
      <path transform="translate(18 17) scale(0.55)" d={spark} />
    </svg>
  );
}

// Chladni — nodal dot lattice (sand particles settled at standing-wave nodes).
export function ChladniSceneIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className} style={style}>
      {[5, 12, 19].map((y) =>
        [5, 12, 19].map((x) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={(x === 12 && y === 12) ? 1.6 : 1.1} />
        ))
      )}
    </svg>
  );
}

// Feedback — concentric rings (echoing trails / warp).
export function FeedbackSceneIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.5" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

// Lissajous — figure-eight parametric trace.
export function LissajousSceneIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M3 12 C 3 6, 9 6, 12 12 S 21 18, 21 12 S 15 6, 12 12 S 3 18, 3 12 Z" />
    </svg>
  );
}

export function SmileyIcon({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 9.5c0-.3.2-.5.5-.5s.5.2.5.5-.2.5-.5.5-.5-.2-.5-.5ZM14.5 9.5c0-.3.2-.5.5-.5s.5.2.5.5-.2.5-.5.5-.5-.2-.5-.5Z" fill="currentColor" stroke="none" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    </svg>
  );
}

export function MusicNoteIcon({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

// ── Dev tools ──

export function EditPencilIcon({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function HighlighterIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="m9 11-6 6v3h9l3-3" />
      <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
    </svg>
  );
}

export function EraserIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4l9-9a1 1 0 0 1 1.4 0l5.6 5.6a1 1 0 0 1 0 1.4L13 21" />
      <path d="M22 21H7" />
      <path d="m5 11 9 9" />
    </svg>
  );
}

export function ChevronUpIcon({ size = 10, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M4 10l4-4 4 4" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 10, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

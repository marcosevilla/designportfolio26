# Typography Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse the portfolio's two-family (Geist + Departure Mono) + three-pairing (Default/Formula/Serif) typography system down to a single Geist Sans family with a three-weight system (400/500/600), reshape the hero so the positioning statement is the h1, and convert case study h2 headings into small sentence-case tertiary labels.

**Architecture:** Foundation-first. Swap CSS variables + typescale tokens in one pass so most consumers update automatically. Then restructure the one place that hard-codes line-by-line fonts (Hero). Pilot the new case study h2 treatment on one study before propagating. Delete unused font files at the end so bundle savings can be measured.

**Tech Stack:** Next.js 14, Tailwind CSS, CSS variables, TypeScript. All paths relative to project root `/Users/marcosevilla/Developer/portfolio 2026`. All npm commands run from `site/`.

---

## Scope Clarifications

Three components use mono *representationally* (URL bar, system architecture diagram labels, teaser shader caption) — they display code/tech content, not page chrome. These keep mono aesthetics but switch to the system `ui-monospace` stack so we can still delete the `DepartureMono-Regular.woff2` file. Affected:

- `site/components/fb-showcase/BrowserMockup.tsx` — URL bar
- `site/components/fb-showcase/SystemArchitecture.tsx` — diagram labels
- `site/components/Teaser.tsx` — teaser page (gated off via env var, but clean it up anyway)

Also switching away from mono as page chrome:

- `site/components/case-study/InlineTOC.tsx` — TOC item font (was mono 13px, becomes sans 13px)

---

## Pre-Flight

- [ ] **Step 1: Verify clean working tree**

Run: `git status`
Expected: Only the three pre-existing modifications (`CLAUDE.md`, `site/next-env.d.ts`, `site/tsconfig.tsbuildinfo`). If anything else is modified, stop and resolve before continuing.

- [ ] **Step 2: Record baseline bundle size**

Run: `du -sh "site/public/fonts"`
Expected: A size value (e.g., `320K`). Copy this number — you'll compare after font files are deleted.

Also run: `ls -la "site/public/fonts"` and record the file list for the final diff.

- [ ] **Step 3: Start the dev server for visual verification**

Run (from `site/`): `npm run dev`
Expected: Dev server starts on `http://localhost:3000`. Leave running in a separate terminal for all visual checks.

---

## Task 1: Simplify globals.css fonts

**Files:**
- Modify: `site/app/globals.css` (lines 1-99, font-face + :root vars)

**Goal:** Delete all custom `@font-face` declarations. Collapse `--font-display`, `--font-heading`, `--font-body`, `--font-mono` into a single `--font-sans`. Keep `--font-size-offset` (accessibility). Delete `--font-heading-style`, `--font-pairing-boost`.

- [ ] **Step 1: Replace the font-face block and :root font vars**

Edit `site/app/globals.css`. Replace lines 5–99 (from the first `/* PP Editorial New */` comment through the closing `}` of `:root`) with:

```css
:root {
  --color-bg: #ffffff;
  --color-fg: #1a1a1a;
  --color-fg-secondary: rgba(17, 17, 17, 0.82);
  --color-fg-tertiary: rgba(17, 17, 17, 0.35);
  --color-surface: #fbfbfb;
  --color-surface-raised: #f5f4f9;
  --color-border: #e6e6e6;
  --color-muted: #f3f3f3;
  --color-accent: #B5651D;
  --color-glow: #B5651D;

  --font-sans: var(--font-geist-sans, "Geist"), system-ui, sans-serif;
  --font-mono-system: ui-monospace, Menlo, Monaco, monospace;
  --font-size-offset: 0px;
}
```

Note: `--font-mono-system` is only used by the three representational components listed in Scope Clarifications (URL bar, system architecture, teaser). It points to the OS monospace stack — no font file to load.

- [ ] **Step 2: Update body font-family**

In `site/app/globals.css`, find line ~119 (after the edit, the line number will be different — search for `font-family: var(--font-body)`):

Before:
```css
body {
  font-family: var(--font-body), ui-sans-serif, system-ui, sans-serif;
```

After:
```css
body {
  font-family: var(--font-sans);
```

- [ ] **Step 3: Update .dotted-link-arrow**

In `site/app/globals.css`, find the `.dotted-link-arrow` rule (line ~181):

Before:
```css
.dotted-link-arrow {
  font-family: var(--font-body), system-ui, sans-serif;
```

After:
```css
.dotted-link-arrow {
  font-family: var(--font-sans);
```

- [ ] **Step 4: Verify no other var(--font-*) references remain in globals.css**

Run: Grep for `var(--font-` in `site/app/globals.css`.
Expected: Only `var(--font-sans)`, `var(--font-mono-system)`, and `var(--font-geist-sans)` (inside the `--font-sans` definition). No references to `--font-display`, `--font-heading`, `--font-body`, `--font-mono`, `--font-heading-style`, or `--font-pairing-boost`.

- [ ] **Step 5: TypeScript check**

The PostToolUse hook runs `tsc --noEmit` automatically after TS/TSX edits. For CSS edits, manually run (from `site/`):
`npx tsc --noEmit`
Expected: No new errors (existing tsbuildinfo may have pre-existing unrelated errors — compare against baseline).

- [ ] **Step 6: Commit**

```bash
git add site/app/globals.css
git commit -m "Simplify globals.css to single --font-sans variable

Remove all @font-face rules for Departure Mono, PP Editorial, PP Formula,
and GT Cinetype. Collapse --font-display/heading/body/mono into --font-sans.
Add --font-mono-system for representational URL-bar/diagram components."
```

---

## Task 2: Simplify layout.tsx font imports

**Files:**
- Modify: `site/app/layout.tsx`

**Goal:** Remove `GeistPixelSquare`, `Instrument_Serif`, `Instrument_Sans` imports. Keep only `GeistSans`.

- [ ] **Step 1: Remove unused font imports and wiring**

Edit `site/app/layout.tsx`.

Replace lines 3–5 (the font imports):

Before:
```typescript
import { GeistSans } from "geist/font/sans";
import { GeistPixelSquare } from "geist/font/pixel";
import { Instrument_Serif, Instrument_Sans } from "next/font/google";
```

After:
```typescript
import { GeistSans } from "geist/font/sans";
```

Delete lines 49–58 (the `instrumentSerif` and `instrumentSans` declarations):

Before:
```typescript
const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
});
```

After: (delete the whole block — no replacement)

- [ ] **Step 2: Update html className to only include GeistSans variable**

In `site/app/layout.tsx`, find the `<html lang="en"` line (~66):

Before:
```tsx
<html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistPixelSquare.variable} ${instrumentSerif.variable} ${instrumentSans.variable}`}>
```

After:
```tsx
<html lang="en" suppressHydrationWarning className={GeistSans.variable}>
```

- [ ] **Step 3: TypeScript check**

Automatic via PostToolUse hook.
Expected: No new errors.

- [ ] **Step 4: Commit**

```bash
git add site/app/layout.tsx
git commit -m "Remove GeistPixel, Instrument Serif, Instrument Sans font imports

These were loaded only for the Formula/Serif theme pairings which are
being removed. GeistSans remains as the sole font."
```

---

## Task 3: Rewrite lib/typography.ts

**Files:**
- Modify: `site/lib/typography.ts` (full rewrite)

**Goal:** Every entry points to `var(--font-sans)` or uses no font family (inheriting from body). Remove the `boost` parameter. Update sizes/weights/colors per the spec tables. Add `sectionLabel` entry.

- [ ] **Step 1: Replace entire file contents**

Replace `site/lib/typography.ts` with:

```typescript
import type { CSSProperties } from "react";

/**
 * Shared typescale for the portfolio.
 * All scalable sizes include var(--font-size-offset)
 * so they respond to the Theme Palette font-size slider.
 */

const off = "var(--font-size-offset)";

function scaled(base: string): string {
  return `calc(${base} + ${off})`;
}

function scaledClamp(min: string, preferred: string, max: string): string {
  return `clamp(calc(${min} + ${off}), calc(${preferred} + ${off}), calc(${max} + ${off}))`;
}

export const typescale = {
  /** Hero H1 (homepage statement) + DynamicBio H1 */
  display: {
    fontFamily: "var(--font-sans)",
    fontSize: scaledClamp("28px", "3vw", "32px"),
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
  } as CSSProperties,

  /** Case Study Hero title */
  caseStudyHero: {
    fontFamily: "var(--font-sans)",
    fontSize: scaledClamp("28px", "3vw", "32px"),
    fontWeight: 600,
    lineHeight: 1.15,
    letterSpacing: "-0.01em",
  } as CSSProperties,

  /** Page titles — /work, /writing, /play */
  pageTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: scaled("24px"),
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
  } as CSSProperties,

  /** Section label — case study h2 ("Problem", "Solution") rendered as small tertiary label */
  sectionLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: "12px",
    fontWeight: 500,
    lineHeight: 1.4,
    color: "var(--color-fg-tertiary)",
  } as CSSProperties,

  /** H3 — Subsections */
  h3: {
    fontFamily: "var(--font-sans)",
    fontSize: scaled("18px"),
    fontWeight: 500,
    lineHeight: 1.3,
    letterSpacing: "-0.01em",
  } as CSSProperties,

  /** H4 — Sub-subsections */
  h4: {
    fontFamily: "var(--font-sans)",
    fontSize: scaled("16px"),
    fontWeight: 500,
    lineHeight: 1.4,
  } as CSSProperties,

  /** Case study body text */
  body: {
    fontSize: scaled("14px"),
    lineHeight: "22px",
  } as CSSProperties,

  /** Case study hero subtitle, NextProject description */
  subtitle: {
    fontSize: scaled("14px"),
    lineHeight: "22px",
  } as CSSProperties,

  /** QuickStats value — big number */
  statValue: {
    fontFamily: "var(--font-sans)",
    fontSize: "24px",
    fontWeight: 500,
    lineHeight: 1.1,
    letterSpacing: "-0.01em",
  } as CSSProperties,

  /** PullQuote text */
  pullQuote: {
    fontFamily: "var(--font-sans)",
    fontSize: scaledClamp("18px", "2.5vw", "22px"),
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: "-0.01em",
  } as CSSProperties,

  /** NextProject title */
  nextProjectTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: scaled("22px"),
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
  } as CSSProperties,

  /** Small sans label — year badges, card meta, list row details (replaces old mono label) */
  label: {
    fontFamily: "var(--font-sans)",
    fontSize: "11px",
    fontWeight: 400,
    letterSpacing: 0,
  } as CSSProperties,

  /** Nav links — desktop 16px, sans */
  nav: {
    fontFamily: "var(--font-sans)",
    fontWeight: 400,
    fontSize: "16px",
  } as CSSProperties,

  /** Nav links — mobile variant */
  navMobile: {
    fontFamily: "var(--font-sans)",
    fontWeight: 400,
    fontSize: "14px",
  } as CSSProperties,
} as const;
```

Notes on what changed:
- The old `h2` entry is removed. Case study h2s now use `sectionLabel`.
- `display` is now 28-32px clamp at weight 600 (was 40px mono at no explicit weight — implied 400).
- `caseStudyHero` is now 28-32px clamp at weight 600 (was 24-28px mono 400).
- `statValue` is now 24px weight 500 sans (was 20px mono 400).
- `nextProjectTitle` is now 22px weight 500 sans (was 20px mono).
- `pageTitle` is now weight 500 (was 700).
- `label` is now sans with letter-spacing 0 (was mono with 0.02em).
- `pullQuote` is now weight 400 (was 300).
- All `var(--font-mono)`, `var(--font-display)`, `var(--font-heading)` references replaced with `var(--font-sans)`.

- [ ] **Step 2: TypeScript check**

Automatic. Expected: No new errors. If errors appear, it's likely a consumer referencing the removed `h2` entry — address in Task 5.

- [ ] **Step 3: Commit**

```bash
git add site/lib/typography.ts
git commit -m "Rewrite typescale to single sans family with 3-weight system

Removes h2 entry (case study h2 now uses sectionLabel),
updates display/caseStudyHero to 28-32px weight 600,
updates statValue/nextProjectTitle/pageTitle weights,
drops --font-pairing-boost integration."
```

---

## Task 4: Remove font pairings from ThemeToggle.tsx

**Files:**
- Modify: `site/components/ThemeToggle.tsx`

**Goal:** Delete `fontPairings` array, `applyFontPairing`, `clearFontPairing`, `selectFont`, `fontPairingName` state.

- [ ] **Step 1: Delete the fontPairings block**

In `site/components/ThemeToggle.tsx`, find and delete lines 97–140 (the entire "Font pairings" section, from `// ── Font pairings ──` through the closing `}` of `clearFontPairing`):

Delete this block:

```typescript
// ── Font pairings ─────────────────────────────────────────────
export const fontPairings = [
  { /* Default */ },
  { /* Formula */ },
  { /* Serif */ },
];

export type FontPairing = (typeof fontPairings)[0] & { headingStyle?: string; sizeBoost?: number };

export function applyFontPairing(pairing: FontPairing) {
  const root = document.documentElement;
  root.style.setProperty("--font-display", pairing.display);
  root.style.setProperty("--font-heading", pairing.heading);
  root.style.setProperty("--font-body", pairing.body);
  root.style.setProperty("--font-mono", pairing.mono);
  root.style.setProperty("--font-heading-style", pairing.headingStyle || "normal");
  root.style.setProperty("--font-pairing-boost", `${pairing.sizeBoost || 0}px`);
}

export function clearFontPairing() {
  const root = document.documentElement;
  ["--font-display", "--font-heading", "--font-body", "--font-mono", "--font-heading-style", "--font-pairing-boost"].forEach((v) =>
    root.style.removeProperty(v)
  );
}
```

- [ ] **Step 2: Update useThemeState — remove font-pairing state and handlers**

In `useThemeState`, remove:
- `const [fontPairingName, setFontPairingName] = useState("Default");`
- The `// Restore font pairing` block inside `useEffect`.
- The `selectFont` `useCallback`.
- The "Reset font to default" section inside `resetAll` (3 lines: `clearFontPairing()`, `setFontPairingName("Default")`, `localStorage.setItem("font-pairing", "Default")`).
- `fontPairingName` and `selectFont` from the return object.

The cleaned-up `useThemeState` should return:

```typescript
return {
  mounted,
  mode,
  coloredThemeName,
  fontSizeOffset,
  selectLight,
  selectDark,
  selectColored,
  increaseFontSize,
  decreaseFontSize,
  resetAll,
};
```

- [ ] **Step 3: TypeScript check**

Automatic. Expected: Errors in `ThemePalette.tsx` (it still imports `fontPairings` and uses `fontPairingName`). These are fixed in Task 5.

- [ ] **Step 4: Commit**

```bash
git add site/components/ThemeToggle.tsx
git commit -m "Remove fontPairings and font-pairing state from ThemeToggle

No more Default/Formula/Serif switching. The palette keeps color themes
and font-size offset."
```

---

## Task 5: Remove font picker from ThemePalette.tsx

**Files:**
- Modify: `site/components/ThemePalette.tsx`

**Goal:** Remove the 3-card "Aa" font picker block. Drop `fontPairings`, `fontPairingName`, `onSelectFont` from the props and JSX.

- [ ] **Step 1: Remove `fontPairings` from imports**

Edit `site/components/ThemePalette.tsx`.

Before (line ~8):
```typescript
import {
  coloredThemes,
  fontPairings,
  type ThemeMode,
} from "./ThemeToggle";
```

After:
```typescript
import {
  coloredThemes,
  type ThemeMode,
} from "./ThemeToggle";
```

- [ ] **Step 2: Remove `fontPairingName` and `onSelectFont` from ThemePaletteProps**

In the `ThemePaletteProps` interface, delete these two lines:
```typescript
fontPairingName: string;
onSelectFont: (name: string) => void;
```

- [ ] **Step 3: Remove them from the destructured args**

In the `export default function ThemePalette({` signature, delete `fontPairingName,` and `onSelectFont,` from the destructuring.

- [ ] **Step 4: Delete the font pairing cards block**

Delete the entire `{/* Font pairing cards */}` block (JSX roughly lines 173–213 — the whole `<div>` with `gridTemplateColumns: "repeat(3, 1fr)"` containing the `fontPairings.map`). It starts with `{/* Font pairing cards */}` and ends with the closing `</div>` before `{/* Action buttons: - / reset / + */}`.

- [ ] **Step 5: Update callsite — find and update the one place that renders ThemePalette**

Grep for `ThemePalette` in `site/components/` to find where it's rendered.

Run: `grep -rn "ThemePalette" site/components --include="*.tsx"`

Expected: Two callsites — `site/components/Nav.tsx` and `site/components/StickyFooter.tsx` (both render `<ThemePalette ... />`).

For each file:
- Remove `fontPairingName={...}` and `onSelectFont={...}` props from the `<ThemePalette ... />` JSX
- Remove any local destructure of `fontPairingName` or `selectFont` from `useThemeState()` if no longer needed elsewhere in the file

- [ ] **Step 6: TypeScript check**

Automatic. Expected: All errors related to font pairings should be resolved.

- [ ] **Step 7: Visual verification**

In browser (http://localhost:3000), click the Theme Palette button (bottom-left sticky footer). Verify:
- The panel opens
- Color swatches render
- The "Aa" font cards row is gone
- The −/reset/+ buttons are present
- Dynamic Bio toggle is present

- [ ] **Step 8: Commit**

```bash
git add site/components/ThemePalette.tsx site/components/StickyFooter.tsx site/components/Nav.tsx
git commit -m "Remove font picker from Theme Palette UI

Palette now shows only color swatches, font size controls, and Dynamic
Bio toggle. No Aa font cards."
```

(Run `git status` first to confirm which files were modified; drop any that weren't.)

---

## Task 6: Split HEADING_LINES in bio-content.ts

**Files:**
- Modify: `site/lib/bio-content.ts` (lines 52-57)

**Goal:** Replace `HEADING_LINES` with `HERO_NAME` and `HERO_STATEMENT` constants. Update `HEADING_WORDS` / `HEADING_TEXT` derivations accordingly.

- [ ] **Step 1: Replace HEADING_LINES block**

In `site/lib/bio-content.ts`, find lines 52–57:

Before:
```typescript
export const HEADING_LINES = [
  { text: "MARCO SEVILLA", weight: 700 as const, font: "var(--font-mono)", size: "28px", lineHeight: 1.4 },
  { text: "I design software in San Francisco. Currently at Canary where I simplify operational workflows for the largest hotel brands in the world.", weight: 400 as const, font: "var(--font-body)", size: "20px", lineHeight: 1.6 },
];
export const HEADING_TEXT = HEADING_LINES.map(l => l.text).join(" ");
export const HEADING_WORDS = HEADING_TEXT.split(" ");
```

After:
```typescript
export const HERO_NAME = "Marco Sevilla";
export const HERO_STATEMENT = "I design software in San Francisco. Currently at Canary where I simplify operational workflows for the largest hotel brands in the world.";
export const HEADING_WORDS = HERO_STATEMENT.split(" ");
```

Note: `HEADING_TEXT` is removed — only `HEADING_WORDS` (used by streaming) is kept. `HERO_NAME` is displayed statically, never streamed.

- [ ] **Step 2: TypeScript check**

Automatic. Expected: Error in `site/components/Hero.tsx` referring to `HEADING_LINES`. Fixed in Task 7.

- [ ] **Step 3: Commit**

```bash
git add site/lib/bio-content.ts
git commit -m "Split HEADING_LINES into HERO_NAME and HERO_STATEMENT

Prepares for hero restructure where the name is a static label and
the positioning statement is the streaming h1."
```

---

## Task 7: Restructure Hero.tsx — static name label + streaming statement h1

**Files:**
- Modify: `site/components/Hero.tsx`

**Goal:** Render `HERO_NAME` as a small always-visible tertiary label. Render `HERO_STATEMENT` as a streaming h1 using the new `typescale.display` style. Preserve the 5-phase intro state machine and sessionStorage skip behavior.

- [ ] **Step 1: Update imports**

In `site/components/Hero.tsx`, find line 5:

Before:
```typescript
import { PARAGRAPHS, PROMPTS, MAX_LEVEL, HEADING_LINES } from "@/lib/bio-content";
```

After:
```typescript
import { PARAGRAPHS, PROMPTS, MAX_LEVEL, HERO_NAME, HERO_STATEMENT } from "@/lib/bio-content";
```

- [ ] **Step 2: Simplify StreamingHeadingLines to stream a single text**

Replace the `StreamingHeadingLines` component (lines 15–105) with a simpler `StreamingStatement` component:

```typescript
function StreamingStatement({
  text,
  stream,
  onComplete,
  reducedMotion,
}: {
  text: string;
  stream: boolean;
  onComplete: () => void;
  reducedMotion: boolean;
}) {
  const words = useMemo(() => text.split(" "), [text]);
  const total = words.length;
  const [visibleCount, setVisibleCount] = useState(
    !stream || reducedMotion ? total : 0
  );
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!stream || reducedMotion) {
      if (stream) onComplete();
      return;
    }
    let i = 0;
    const reveal = () => {
      i++;
      setVisibleCount(i);
      if (i < total) {
        timerRef.current = setTimeout(reveal, 40);
      } else {
        timerRef.current = setTimeout(onComplete, 300);
      }
    };
    timerRef.current = setTimeout(reveal, 40);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stream, total, onComplete, reducedMotion]);

  if (!stream) {
    return <>{text}</>;
  }

  return (
    <>
      {words.slice(0, visibleCount).map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          style={{ display: "inline" }}
        >
          {i > 0 ? " " : ""}
          {w}
        </motion.span>
      ))}
    </>
  );
}
```

Also remove the now-unused `HeadingLine` type (line 15).

- [ ] **Step 3: Update the JSX that rendered heading lines**

In the `Hero` component's return JSX, find the block that renders the heading (lines ~220–241 — the `<h1>` with `StreamingHeadingLines`):

Before:
```tsx
<TwoCol>
  <TwoCol.Left>
    <div className="sticky top-14 z-40 -mx-4 px-4 sm:-mx-8 sm:px-8 py-3 bg-[var(--color-bg)]/90 backdrop-blur-sm lg:relative lg:top-auto lg:z-auto lg:mx-0 lg:px-0 lg:py-0 lg:bg-transparent lg:backdrop-blur-none">
      <h1
        className="tracking-tight"
        style={{
          ...typescale.display,
        }}
      >
        {introPhase === "star1" ? null : (
          <StreamingHeadingLines
            lines={HEADING_LINES}
            stream={introPhase === "subtitle"}
            onComplete={onHeadingComplete}
            reducedMotion={reducedMotion}
          />
        )}
      </h1>
    </div>
  </TwoCol.Left>
</TwoCol>
```

After:
```tsx
<TwoCol>
  <TwoCol.Left>
    <div className="sticky top-14 z-40 -mx-4 px-4 sm:-mx-8 sm:px-8 py-3 bg-[var(--color-bg)]/90 backdrop-blur-sm lg:relative lg:top-auto lg:z-auto lg:mx-0 lg:px-0 lg:py-0 lg:bg-transparent lg:backdrop-blur-none">
      <span
        className="block mb-3"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "14px",
          fontWeight: 400,
          color: "var(--color-fg-tertiary)",
          lineHeight: 1.4,
        }}
      >
        {HERO_NAME}
      </span>
      <h1
        className="tracking-tight"
        style={typescale.display}
      >
        {introPhase === "star1" ? null : (
          <StreamingStatement
            text={HERO_STATEMENT}
            stream={introPhase === "subtitle"}
            onComplete={onHeadingComplete}
            reducedMotion={reducedMotion}
          />
        )}
      </h1>
    </div>
  </TwoCol.Left>
</TwoCol>
```

- [ ] **Step 4: TypeScript check**

Automatic. Expected: No errors.

- [ ] **Step 5: Visual verification — fresh-load intro**

In browser devtools, open Application → Session Storage, delete the `portfolio-intro-seen` key. Reload http://localhost:3000.

Expected:
1. "Marco Sevilla" label appears immediately (14px, tertiary color)
2. Star blinks for ~1.8s
3. Statement streams word-by-word below the label as a large h1 (28-32px, weight 600)
4. Second star blinks
5. Bio paragraph streams below

- [ ] **Step 6: Visual verification — skipped-intro path**

Without clearing sessionStorage, reload http://localhost:3000.

Expected: Everything appears immediately — name, statement, and first bio paragraph all visible together (no streaming).

- [ ] **Step 7: Visual verification — mobile sticky**

In devtools responsive mode, set width to 375px. Scroll down the homepage.

Expected: Name + statement stack sticks to top of viewport as you scroll past them (via the existing sticky wrapper).

- [ ] **Step 8: Commit**

```bash
git add site/components/Hero.tsx
git commit -m "Restructure hero: static name label + streaming statement h1

Name (\"Marco Sevilla\") renders as a 14px tertiary label above the h1.
Statement becomes the h1 at 28-32px weight 600 and streams word-by-word
during the intro. 5-phase state machine and sessionStorage skip unchanged."
```

---

## Task 8: Clean mono overrides from CaseStudyHero.tsx

**Files:**
- Modify: `site/components/case-study/CaseStudyHero.tsx`

**Goal:** Remove the inline `fontFamily: "var(--font-mono)", fontWeight: 400` override so the h1 inherits `typescale.caseStudyHero` (now sans 600).

- [ ] **Step 1: Remove the inline overrides**

In `site/components/case-study/CaseStudyHero.tsx`, find line 43:

Before:
```tsx
<h1
  data-editable="hero-title"
  className="text-white tracking-tight max-w-[700px]"
  style={{ ...typescale.caseStudyHero, fontFamily: "var(--font-mono)", fontWeight: 400 }}
>
  {title}
</h1>
```

After:
```tsx
<h1
  data-editable="hero-title"
  className="text-white tracking-tight max-w-[700px]"
  style={typescale.caseStudyHero}
>
  {title}
</h1>
```

- [ ] **Step 2: TypeScript check**

Automatic. Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add site/components/case-study/CaseStudyHero.tsx
git commit -m "Remove mono override from case study hero h1

The h1 now uses the updated typescale.caseStudyHero (sans weight 600)."
```

---

## Task 9: Convert SectionHeading h2 to sectionLabel

**Files:**
- Modify: `site/components/case-study/SectionHeading.tsx`

**Goal:** h2 branch renders a small sentence-case tertiary label using `typescale.sectionLabel`. Semantics stay `<h2>`. h3/h4 branches unchanged.

- [ ] **Step 1: Update h2 branch**

In `site/components/case-study/SectionHeading.tsx`, replace the h2 branch (lines 17–26):

Before:
```tsx
if (level === 2) {
  return (
    <>
      {id && <div id={id} className="scroll-mt-24" />}
      <h2 className="text-[var(--color-fg)] mb-3 tracking-tight" style={typescale.h2}>
        {children}
      </h2>
    </>
  );
}
```

After:
```tsx
if (level === 2) {
  return (
    <>
      {id && <div id={id} className="scroll-mt-24" />}
      <h2 className="mt-12 mb-3" style={typescale.sectionLabel}>
        {children}
      </h2>
    </>
  );
}
```

Changes:
- `typescale.h2` → `typescale.sectionLabel`
- Added `mt-12` (48px top margin) so the small label has clear separation from the preceding section content
- Removed `text-[var(--color-fg)]` (label color comes from `typescale.sectionLabel.color` = tertiary)
- Removed `tracking-tight` (labels at 12px don't want negative tracking)

- [ ] **Step 2: TypeScript check**

Automatic. Expected: No errors. (The deleted `typescale.h2` would have been flagged in Task 3 if consumers referenced it — this is the only consumer.)

- [ ] **Step 3: Commit**

```bash
git add site/components/case-study/SectionHeading.tsx
git commit -m "Convert case study h2 to small sentence-case tertiary label

Uses typescale.sectionLabel (12px weight 500 tertiary). Semantics stay
<h2> for screen readers. mt-12 added for visual section separation."
```

---

## Task 10: Clean mono overrides from CaseStudyCard.tsx

**Files:**
- Modify: `site/components/CaseStudyCard.tsx`

**Goal:** Remove inline `fontFamily: "var(--font-mono)"` / `"var(--font-body)"` overrides on title, year label, subtitle. They inherit sans from body.

- [ ] **Step 1: Remove fontFamily from year label**

In `site/components/CaseStudyCard.tsx`, find the year label block (~lines 155–167):

Before:
```tsx
{showYear && (
  <span
    className="block mb-2"
    style={{
      fontFamily: "var(--font-mono)",
      fontSize: "11px",
      color: "var(--color-fg-tertiary)",
      letterSpacing: "0.02em",
    }}
  >
    {study.year}
  </span>
)}
```

After:
```tsx
{showYear && (
  <span
    className="block mb-2"
    style={{
      fontSize: "11px",
      color: "var(--color-fg-tertiary)",
    }}
  >
    {study.year}
  </span>
)}
```

Changes: remove `fontFamily` (inherits sans from body), remove `letterSpacing: "0.02em"` (0 for small sans labels per spec).

- [ ] **Step 2: Remove fontFamily from title**

Find the title h3 (~lines 168–178):

Before:
```tsx
<h3
  className="leading-tight tracking-tight"
  style={{
    fontFamily: "var(--font-mono)",
    fontWeight: 500,
    fontSize: TITLE_SIZES[cardSize],
    color: "var(--color-fg)",
  }}
>
  {study.title}
</h3>
```

After:
```tsx
<h3
  className="leading-tight tracking-tight"
  style={{
    fontWeight: 500,
    fontSize: TITLE_SIZES[cardSize],
    color: "var(--color-fg)",
  }}
>
  {study.title}
</h3>
```

- [ ] **Step 3: Remove fontFamily from subtitle**

Find the subtitle p (~lines 179–189):

Before:
```tsx
<p
  className="mt-1.5"
  style={{
    fontFamily: "var(--font-body)",
    fontSize: SUBTITLE_SIZES[cardSize],
    lineHeight: 1.5,
    color: "var(--color-fg-secondary)",
  }}
>
  {study.subtitle}
</p>
```

After:
```tsx
<p
  className="mt-1.5"
  style={{
    fontSize: SUBTITLE_SIZES[cardSize],
    lineHeight: 1.5,
    color: "var(--color-fg-secondary)",
  }}
>
  {study.subtitle}
</p>
```

- [ ] **Step 4: Fix the remaining `var(--font-pairing-boost)` references in size calcs**

At the top of the file (lines ~51–64), `TITLE_SIZES` and `SUBTITLE_SIZES` use the removed `--font-pairing-boost` variable. Update:

Before:
```typescript
const TITLE_SIZES: Record<CardSize, string> = {
  hero: "calc(18px + var(--font-size-offset) + var(--font-pairing-boost))",
  large: "calc(18px + var(--font-size-offset) + var(--font-pairing-boost))",
  medium: "calc(18px + var(--font-size-offset) + var(--font-pairing-boost))",
  standard: "calc(18px + var(--font-size-offset) + var(--font-pairing-boost))",
  wide: "calc(18px + var(--font-size-offset) + var(--font-pairing-boost))",
};

const SUBTITLE_SIZES: Record<CardSize, string> = {
  hero: "calc(15px + var(--font-size-offset) + var(--font-pairing-boost))",
  large: "calc(14px + var(--font-size-offset) + var(--font-pairing-boost))",
  medium: "calc(14px + var(--font-size-offset) + var(--font-pairing-boost))",
  standard: "calc(14px + var(--font-size-offset) + var(--font-pairing-boost))",
  wide: "calc(14px + var(--font-size-offset) + var(--font-pairing-boost))",
};
```

After:
```typescript
const TITLE_SIZES: Record<CardSize, string> = {
  hero: "calc(18px + var(--font-size-offset))",
  large: "calc(18px + var(--font-size-offset))",
  medium: "calc(18px + var(--font-size-offset))",
  standard: "calc(18px + var(--font-size-offset))",
  wide: "calc(18px + var(--font-size-offset))",
};

const SUBTITLE_SIZES: Record<CardSize, string> = {
  hero: "calc(15px + var(--font-size-offset))",
  large: "calc(14px + var(--font-size-offset))",
  medium: "calc(14px + var(--font-size-offset))",
  standard: "calc(14px + var(--font-size-offset))",
  wide: "calc(14px + var(--font-size-offset))",
};
```

- [ ] **Step 5: TypeScript check**

Automatic. Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add site/components/CaseStudyCard.tsx
git commit -m "Remove mono overrides from case study cards

Card title and year label now inherit sans. Drops --font-pairing-boost
from size calcs (variable no longer exists)."
```

---

## Task 11: Clean up remaining explicit font references

**Files:**
- Modify: `site/components/Marquee.tsx`
- Modify: `site/components/CaseStudyListRow.tsx`
- Modify: `site/components/CaseStudyList.tsx`
- Modify: `site/components/case-study/InlineTOC.tsx`

**Goal:** Every explicit `var(--font-body)` / `var(--font-heading)` / `var(--font-mono)` reference in page chrome either (a) becomes `var(--font-sans)`, or (b) is removed to inherit. Also strip `var(--font-pairing-boost)` from inline calc expressions.

- [ ] **Step 1: Update Marquee.tsx**

In `site/components/Marquee.tsx`, line 83:

Before:
```tsx
style={{ fontSize: "calc(14px + var(--font-size-offset) + var(--font-pairing-boost))", fontFamily: "var(--font-body)", fontWeight: 400 }}
```

After:
```tsx
style={{ fontSize: "calc(14px + var(--font-size-offset))", fontWeight: 400 }}
```

- [ ] **Step 2: Update CaseStudyListRow.tsx**

In `site/components/CaseStudyListRow.tsx`, find the title motion.span (~lines 38–50):

Before:
```tsx
style={{
  fontFamily: "var(--font-heading)",
  fontWeight: 500,
  fontSize: "calc(16px + var(--font-size-offset) + var(--font-pairing-boost))",
  color: hovered ? "var(--color-accent)" : "var(--color-fg)",
}}
```

After:
```tsx
style={{
  fontWeight: 500,
  fontSize: "calc(16px + var(--font-size-offset))",
  color: hovered ? "var(--color-accent)" : "var(--color-fg)",
}}
```

- [ ] **Step 3: Update CaseStudyList.tsx**

In `site/components/CaseStudyList.tsx`, line 224 area. Grep for `var(--font-heading)` to locate.

Remove the `fontFamily: "var(--font-heading)"` line. If the style object has other `--font-pairing-boost` references in size calcs, strip them as you did in Task 10 Step 4 and Step 2 above.

- [ ] **Step 4: Update InlineTOC.tsx**

In `site/components/case-study/InlineTOC.tsx`, line 76:

Before:
```tsx
style={{ fontSize: "13px", fontFamily: "var(--font-mono)", fontWeight: 400, lineHeight: "20px" }}
```

After:
```tsx
style={{ fontSize: "13px", fontWeight: 400, lineHeight: "20px" }}
```

- [ ] **Step 5: Grep to confirm no stale references remain on public surfaces**

Run: `grep -rn "var(--font-mono)\|var(--font-display)\|var(--font-heading)\|var(--font-body)\|var(--font-pairing-boost)" site/app site/components site/lib --include="*.ts" --include="*.tsx" --include="*.css"`

Expected: Only matches inside `site/components/Teaser.tsx`, `site/components/fb-showcase/BrowserMockup.tsx`, and `site/components/fb-showcase/SystemArchitecture.tsx` (the representational components — fixed in Task 12). No matches in `bio-content.ts`, `typography.ts`, `globals.css`, or any other file.

- [ ] **Step 6: TypeScript check**

Automatic. Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add site/components/Marquee.tsx site/components/CaseStudyListRow.tsx site/components/CaseStudyList.tsx site/components/case-study/InlineTOC.tsx
git commit -m "Strip explicit font-family references on page chrome

Marquee, list row title, list header, and InlineTOC now inherit sans
from body. Also removes --font-pairing-boost from inline size calcs."
```

---

## Task 12: Switch representational components to system mono

**Files:**
- Modify: `site/components/fb-showcase/BrowserMockup.tsx`
- Modify: `site/components/fb-showcase/SystemArchitecture.tsx`
- Modify: `site/components/Teaser.tsx`

**Goal:** URL bar + diagram labels + teaser caption keep their mono aesthetic but use the system mono stack (`var(--font-mono-system)` = `ui-monospace, Menlo, Monaco, monospace`) so Departure Mono can be deleted.

- [ ] **Step 1: Update BrowserMockup.tsx**

In `site/components/fb-showcase/BrowserMockup.tsx`, line 46:

Before:
```tsx
fontFamily: "var(--font-mono)",
```

After:
```tsx
fontFamily: "var(--font-mono-system)",
```

- [ ] **Step 2: Update SystemArchitecture.tsx**

In `site/components/fb-showcase/SystemArchitecture.tsx`, replace all six occurrences of `var(--font-mono)` with `var(--font-mono-system)`.

Run: `grep -n "var(--font-mono)" site/components/fb-showcase/SystemArchitecture.tsx`

Expected: 6 matches (lines 172, 251, 267, 346, 415, 491 per the earlier audit). Update each.

- [ ] **Step 3: Update Teaser.tsx**

In `site/components/Teaser.tsx`:

Line 71:
Before:
```tsx
fontFamily: "'Departure Mono', var(--font-mono), monospace",
```

After:
```tsx
fontFamily: "var(--font-mono-system)",
```

Line 83:
Before:
```tsx
fontFamily: "var(--font-body), system-ui, sans-serif",
```

After:
```tsx
fontFamily: "var(--font-sans)",
```

- [ ] **Step 4: Grep final check**

Run: `grep -rn "var(--font-mono)\|var(--font-display)\|var(--font-heading)\|var(--font-body)\|var(--font-pairing-boost)\|Departure Mono\|PP Formula\|GT Cinetype\|PP Editorial\|Instrument Serif\|Instrument Sans\|GeistPixelSquare" site/app site/components site/lib --include="*.ts" --include="*.tsx" --include="*.css"`

Expected: Zero matches. Every reference to the old variables, font names, or font imports is gone.

- [ ] **Step 5: TypeScript check**

Automatic. Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add site/components/fb-showcase/BrowserMockup.tsx site/components/fb-showcase/SystemArchitecture.tsx site/components/Teaser.tsx
git commit -m "Switch URL bar, arch diagram, and teaser to system mono

These representational components keep a monospace aesthetic via the
ui-monospace/Menlo system stack — no font file dependency."
```

---

## Task 13: Pilot — visual QA on F&B Ordering

**Files:** None (verification only)

**Goal:** Confirm the new typography system looks right on the strongest case study before rolling out. Decide whether h2 sectionLabel needs adjustment.

- [ ] **Step 1: Load F&B Ordering case study**

Open http://localhost:3000/work/fb-ordering in browser.

Expected behaviors to verify:
- Hero h1 "Mobile ordering for hotels" renders in Geist Sans, weight 600, 28-32px — no mono
- Hero subtitle renders small (14px), sans
- First section heading "Problem" (or whatever the first h2 is) renders as a small 12px tertiary-color sentence-case label above the section content — reads as a category tag, not a competing heading
- Body prose reads smoothly, no unexpected font shifts
- QuickStats numbers are 24px sans weight 500 (bigger than the old 20px mono)
- PullQuote renders at weight 400 (was 300 — should look less thin)
- NextProject title renders 22px sans weight 500

- [ ] **Step 2: Decision gate — does h2 sectionLabel feel right?**

Scroll through the full F&B Ordering case study and evaluate whether the 12px tertiary-color labels provide enough section separation.

Two possible outcomes:
- **Works as designed:** Proceed to Task 14.
- **Too ambient (sections blur together):** Apply one of these adjustments in `site/lib/typography.ts`:
  - Bump `sectionLabel.fontSize` to `"14px"`
  - OR add a subtle top border: in `SectionHeading.tsx` h2 branch, change `className="mt-12 mb-3"` to `className="mt-12 mb-3 pt-6 border-t border-[var(--color-border)]"`

If an adjustment was applied, commit it:

```bash
git add site/lib/typography.ts site/components/case-study/SectionHeading.tsx
git commit -m "Tune case study h2 label treatment based on F&B pilot"
```

- [ ] **Step 3: Verify the other case studies automatically picked up the same treatment**

Open each briefly to confirm nothing looks broken:
- http://localhost:3000/work/compendium
- http://localhost:3000/work/upsells
- http://localhost:3000/work/checkin
- http://localhost:3000/work/general-task
- http://localhost:3000/work/design-system
- http://localhost:3000/work/ai-workflow

Each should have the same typographic rhythm as F&B. No dedicated commits unless something specific is broken.

---

## Task 14: Delete unused font files

**Files:**
- Delete: `site/public/fonts/*.woff2`

**Goal:** Remove the 9 font files that are no longer referenced.

- [ ] **Step 1: Confirm no references remain**

Run from project root:
```bash
grep -rn "PPEditorialNew\|PP-Formula\|GT-Cinetype\|DepartureMono" site/app site/components site/lib --include="*.ts" --include="*.tsx" --include="*.css"
```

Expected: Zero matches. If any match, stop and fix them first.

- [ ] **Step 2: List the font files to confirm what will be deleted**

Run: `ls -la "site/public/fonts"`

Expected files to delete:
- `PPEditorialNew-Regular.woff2`
- `PPEditorialNew-Italic.woff2`
- `PPEditorialNew-UltralightItalic.woff2`
- `PP-Formula-ExtraBold.woff2`
- `PP-Formula-SemiExtendedBold.woff2`
- `GT-Cinetype-Light.woff2`
- `GT-Cinetype-Regular.woff2`
- `GT-Cinetype-Bold.woff2`
- `DepartureMono-Regular.woff2`

- [ ] **Step 3: Delete the files**

Run from project root:
```bash
rm "site/public/fonts/PPEditorialNew-Regular.woff2" \
   "site/public/fonts/PPEditorialNew-Italic.woff2" \
   "site/public/fonts/PPEditorialNew-UltralightItalic.woff2" \
   "site/public/fonts/PP-Formula-ExtraBold.woff2" \
   "site/public/fonts/PP-Formula-SemiExtendedBold.woff2" \
   "site/public/fonts/GT-Cinetype-Light.woff2" \
   "site/public/fonts/GT-Cinetype-Regular.woff2" \
   "site/public/fonts/GT-Cinetype-Bold.woff2" \
   "site/public/fonts/DepartureMono-Regular.woff2"
```

- [ ] **Step 4: Confirm the directory is empty or only contains files that are still referenced**

Run: `ls "site/public/fonts"`

Expected: Either empty, or only files not in the deletion list (unlikely — all known font files should be gone).

- [ ] **Step 5: Record the new directory size**

Run: `du -sh "site/public/fonts" 2>/dev/null || echo "directory empty"`

Compare to the baseline recorded in Pre-Flight Step 2. Calculate the delta.

- [ ] **Step 6: Reload homepage and case study to verify nothing regressed**

Open http://localhost:3000/ and http://localhost:3000/work/fb-ordering. Open devtools Network tab and filter by "font" — confirm no 404s for deleted files.

Expected: No 404s. Geist Sans loads (served by next/font), no other font files requested.

- [ ] **Step 7: Commit**

```bash
git add -u site/public/fonts
git commit -m "Delete unused font files (9 woff2 files)

Removes PP Editorial New, PP Formula, GT Cinetype, and Departure Mono
woff2 files — all replaced by Geist Sans or system mono."
```

---

## Task 15: Final verification + record bundle win

**Files:** None (measurement)

**Goal:** Produce a before/after snapshot to paste into the PR description or commit notes.

- [ ] **Step 1: Build and check the fonts portion of the production bundle**

Run from `site/`: `npm run build`
Expected: Build succeeds.

- [ ] **Step 2: Record the deployed font footprint**

Compare:
- Baseline fonts dir size (from Pre-Flight Step 2)
- New fonts dir size (from Task 14 Step 5)
- Delta = before - after

Also note: external font downloads were reduced from 3 (Geist via `geist/font/sans`, Instrument Serif + Instrument Sans via `next/font/google`) to 1 (just Geist). The Instrument fonts were previously loaded on every page regardless of user selection.

- [ ] **Step 3: Manual smoke-check on all 7 case studies + homepage**

Final walk-through. Load each and spot-check:
- http://localhost:3000/
- http://localhost:3000/work/fb-ordering
- http://localhost:3000/work/compendium
- http://localhost:3000/work/upsells
- http://localhost:3000/work/checkin
- http://localhost:3000/work/general-task
- http://localhost:3000/work/design-system
- http://localhost:3000/work/ai-workflow
- http://localhost:3000/work (work collection page — card + list views)

For each: verify no mono anywhere on page chrome (acceptable mono only in URL bars, system architecture diagrams, and the teaser — which is gated off).

- [ ] **Step 4: Theme palette smoke test**

Click the theme palette button (sticky footer). Verify:
- Color swatches still work (click 2-3 different colors)
- Font size ± buttons still adjust text size
- No "Aa" font cards present
- Dynamic Bio toggle still works

- [ ] **Step 5: Clear and test intro**

DevTools → Application → Session Storage → delete `portfolio-intro-seen`. Reload homepage. Verify 5-phase intro still works (star1 → statement streams → star2 → bio streams → done).

- [ ] **Step 6: No commit needed for Step 1-5**

This task is pure verification. The bundle-size numbers can go in a follow-up PR description or session notes.

---

## Rollback Plan

If anything goes catastrophically wrong at any point:

```bash
git log --oneline -20
# Identify the last known-good commit before Task 1
git reset --hard <that-commit-sha>
```

Each task commits independently, so granular rollback is also possible:

```bash
git revert <specific-task-commit>
```

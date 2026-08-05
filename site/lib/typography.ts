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

/**
 * Body line-height as a unitless ratio. Originally 28/17 from the
 * 2026-08-05 OpenAI-blog-scale pass; body dropped to 15px later the same
 * day (Marco's call) and the RATIO was kept, so the reading rhythm carries
 * over — 15 × 1.647 ≈ 24.7px.
 *
 * Exported because any component that measures body text in pixels — e.g.
 * Testimonials' line-clamp — must derive from this rather than hard-code a
 * number that goes stale the next time the body scale moves. That is
 * exactly the bug that had Testimonials clamping at 4.8 lines.
 */
export const BODY_LINE_HEIGHT = 1.647;

export const typescale = {
  /** Case-study H1 — 2026-08-05 OpenAI-blog-scale pass: tops out at
   *  48px (Marco's softer call vs the reference's 64px), weight 500 to
   *  keep that size from going heavy. The homepage h1 keeps its own
   *  inline 16px spec — this scale is for study pages only. */
  display: {
    fontFamily: "var(--font-sans)",
    fontSize: scaledClamp("32px", "4vw", "48px"),
    fontWeight: 500,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
  } as CSSProperties,

  /** Case Study Hero title — same display scale as `display`
   *  (LockGate page placeholders share it). */
  caseStudyHero: {
    fontFamily: "var(--font-sans)",
    fontSize: scaledClamp("32px", "4vw", "48px"),
    fontWeight: 500,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
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
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: 1.4,
    color: "var(--color-fg-tertiary)",
  } as CSSProperties,

  /** H2 — case-study section heading (2026-08-05: real 30px heading,
   *  OpenAI blog scale — replaces the mono-uppercase label era, which
   *  lives on in `sectionLabel` and git history). */
  h2: {
    fontFamily: "var(--font-sans)",
    fontSize: scaled("30px"),
    fontWeight: 500,
    lineHeight: 1.32,
    letterSpacing: "-0.01em",
  } as CSSProperties,

  /** H3 — Subsections. 18px (Marco's call 2026-08-05, was 20px).
   *
   *  ⚠️ This is now IDENTICAL to `h4` — same size, same weight, same
   *  leading, same tracking. The two levels are currently told apart only
   *  by the margins `SectionHeading` applies (h3 `mt-16 mb-6`, h4 `mb-3`).
   *  On a page that nests h4 under h3 they will read as one level. See
   *  docs/TYPOGRAPHY-BACKLOG.md — flagged for Marco, not yet ruled. */
  h3: {
    fontFamily: "var(--font-sans)",
    fontSize: scaled("18px"),
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: "-0.01em",
  } as CSSProperties,

  /** H4 — Sub-subsections. See the ⚠️ on `h3` above: identical spec. */
  h4: {
    fontFamily: "var(--font-sans)",
    fontSize: scaled("18px"),
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: "-0.01em",
  } as CSSProperties,

  /** Case study body text — site-wide body standard. 15px at the tuned
   *  1.647 ratio (≈24.7px leading); was 17/28 from the OpenAI-blog-scale
   *  pass earlier on 2026-08-05, dropped to 15px the same day. Also
   *  inlined on the home bio (HomeLayout) — change the two together. The
   *  `body` element default in globals.css stays 14/1.6 (UI chrome
   *  inherits it), so body copy now sits just 1px above site chrome.
   *
   *  line-height is UNITLESS (`BODY_LINE_HEIGHT`) so it tracks the Theme
   *  Palette font-size slider. It was pinned at "28px" until 2026-08-05:
   *  because `fontSize` scales with --font-size-offset and a px
   *  line-height does not, the ratio collapsed 1.65 → 1.33 at the +4
   *  end of the slider and the prose went cramped. */
  body: {
    fontSize: scaled("15px"),
    lineHeight: BODY_LINE_HEIGHT,
    letterSpacing: "-0.01em",
  } as CSSProperties,

  /** Case study hero subtitle, NextProject description.
   *  Unitless for the same reason as `body` above — 26/16 exactly. */
  subtitle: {
    fontSize: scaled("16px"),
    lineHeight: 1.625,
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

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

/**
 * CONSOLIDATED 2026-08-05 (Marco's call: "I don't want a dozen styles").
 * 15 tokens → 8. Absorbed: `caseStudyHero` → `display` (was byte-identical),
 * `h4` → `h3` (was byte-identical), `pageTitle`/`statValue`/
 * `nextProjectTitle` → `title`. Deleted dead (0 consumers): `sectionLabel`,
 * `nav`, `navMobile` — the latter two orphaned when SiteHeader was
 * unmounted site-wide 2026-07-20. Before re-adding a token, check whether
 * an existing one plus a one-property override does the job.
 */
export const typescale = {
  /** Display — case-study H1s and the LockGate placeholder hero.
   *  Caps at 40px (Marco stepped the whole heading ramp down late
   *  2026-08-05; the OpenAI-pass 48 cap lasted a day, the reference's 64
   *  was never used). Mobile min stays 32 — only the desktop cap moved.
   *  Weight 500 keeps the size from going heavy. The homepage h1 keeps
   *  its own inline 16px spec — this scale is for study pages only. */
  display: {
    fontFamily: "var(--font-sans)",
    fontSize: scaledClamp("32px", "4vw", "40px"),
    fontWeight: 500,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
  } as CSSProperties,

  /** Mid-size titles — page titles (/writing), QuickStats values,
   *  NextProject link title. Merged from `pageTitle` + `statValue` +
   *  `nextProjectTitle` in the 2026-08-05 consolidation; stats gained
   *  slider scaling (per the same-day ruling) and NextProject stepped
   *  22 → 24. */
  title: {
    fontFamily: "var(--font-sans)",
    fontSize: scaled("24px"),
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
  } as CSSProperties,

  /** H2 — case-study section heading. 26px (Marco's late-2026-08-05
   *  ramp-down; the OpenAI-pass 30 lasted a day — the mono-uppercase
   *  label era lives in git history). */
  h2: {
    fontFamily: "var(--font-sans)",
    fontSize: scaled("26px"),
    fontWeight: 500,
    lineHeight: 1.32,
    letterSpacing: "-0.01em",
  } as CSSProperties,

  /** H3 — subsections AND sub-subsections. Deliberately only a WHISPER
   *  above body copy (Marco's spec, late 2026-08-05): body is 15/400,
   *  h3 is 16/500 — one point bigger, one weight step bolder, nothing
   *  more. Was 20 → 18 → 16 over the course of 2026-08-05. The separate
   *  `h4` token was absorbed here once the sizes converged;
   *  `SectionHeading` still renders a real `<h4>` element for `level={4}`
   *  (document outline unchanged), told apart by margin (h3 `mt-16 mb-6`,
   *  h4 `mb-3`). ⚠️ Nested h4-under-h3 reads as one level — see
   *  docs/TYPOGRAPHY-BACKLOG.md open question 1 (latent: every
   *  `level={4}` consumer is in LOCKED_SLUGS today).
   *  ⚠️ Also now equals `subtitle`'s 16px — different weight (500 vs
   *  400) and role; if subtitle ever gains weight, re-separate. */
  h3: {
    fontFamily: "var(--font-sans)",
    fontSize: scaled("16px"),
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

  /** PullQuote text */
  pullQuote: {
    fontFamily: "var(--font-sans)",
    fontSize: scaledClamp("18px", "2.5vw", "22px"),
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: "-0.01em",
  } as CSSProperties,

  /** Small sans label — year badges, card meta, list row details (replaces old mono label) */
  label: {
    fontFamily: "var(--font-sans)",
    fontSize: "11px",
    fontWeight: 400,
    letterSpacing: 0,
  } as CSSProperties,
} as const;

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
    fontSize: "14px",
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

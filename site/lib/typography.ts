import type { CSSProperties } from "react";

/**
 * Shared typescale for the portfolio.
 * All scalable sizes include var(--font-size-offset) and var(--font-pairing-boost)
 * so they respond to the Theme Palette font-size slider.
 */

const off = "var(--font-size-offset)";
const boost = "var(--font-pairing-boost)";

function scaled(base: string): string {
  return `calc(${base} + ${off} + ${boost})`;
}

function scaledClamp(min: string, preferred: string, max: string): string {
  return `clamp(calc(${min} + ${off} + ${boost}), calc(${preferred} + ${off} + ${boost}), calc(${max} + ${off} + ${boost}))`;
}

export const typescale = {
  /** Hero H1, DynamicBio H1 */
  display: {
    fontFamily: "var(--font-mono)",
    fontSize: scaled("40px"),
    lineHeight: 1.25,
  } as CSSProperties,

  /** Case Study Hero title */
  caseStudyHero: {
    fontFamily: "var(--font-display)",
    fontSize: scaledClamp("24px", "3vw", "28px"),
    fontStyle: "var(--font-heading-style)",
    lineHeight: 1.15,
  } as CSSProperties,

  /** Page titles — /work, /writing, /play */
  pageTitle: {
    fontFamily: "var(--font-heading)",
    fontSize: scaled("24px"),
    fontWeight: 700,
    lineHeight: 1.2,
  } as CSSProperties,

  /** H2 — Case study sections */
  h2: {
    fontFamily: "var(--font-mono)",
    fontSize: scaled("18px"),
    fontWeight: 400,
    lineHeight: 1.2,
  } as CSSProperties,

  /** H3 — Subsections */
  h3: {
    fontFamily: "var(--font-heading)",
    fontSize: scaled("18px"),
    fontWeight: 500,
    lineHeight: 1.3,
  } as CSSProperties,

  /** H4 — Sub-subsections (heading font differentiates from body) */
  h4: {
    fontFamily: "var(--font-heading)",
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

  /** QuickStats large number */
  statValue: {
    fontFamily: "var(--font-mono)",
    fontSize: "20px",
    fontWeight: 400,
    lineHeight: 1.1,
  } as CSSProperties,

  /** PullQuote text */
  pullQuote: {
    fontSize: scaledClamp("18px", "2.5vw", "22px"),
    fontWeight: 300,
    lineHeight: 1.4,
  } as CSSProperties,

  /** NextProject title */
  nextProjectTitle: {
    fontFamily: "var(--font-display)",
    fontSize: scaled("20px"),
    lineHeight: 1.2,
  } as CSSProperties,

  /** Mono label — year badges, card meta, filter pills, list row details */
  label: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    letterSpacing: "0.02em",
  } as CSSProperties,

  /** Nav links — desktop 16px, mobile 14px */
  nav: {
    fontFamily: "var(--font-mono)",
    fontWeight: 400,
    fontSize: "16px",
  } as CSSProperties,

  /** Nav links — mobile variant */
  navMobile: {
    fontFamily: "var(--font-mono)",
    fontWeight: 400,
    fontSize: "14px",
  } as CSSProperties,
} as const;

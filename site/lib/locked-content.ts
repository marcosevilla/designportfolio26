/**
 * Single source of truth for which slugs are gated behind the password
 * modal. Used by `<LockGate>` (cards + pages) and `<CaseStudyListRow>`
 * (list view). To unlock a piece of content permanently when it's
 * ready to ship publicly, remove its slug from this Set.
 */
export const LOCKED_SLUGS: ReadonlySet<string> = new Set([
  // Work case studies
  "canary-guest-hub", // re-locked 2026-07-27 (unlocked 2026-07-18, pulled back to in-progress)
  "knowledge-base",
  "canary-guest-upsells", // stays locked: 17 live ImagePlaceholders, incl. an 8-up gallery headed "The Work"
  // UNLOCKED 2026-08-05: checkin, general-task, design-system. All three have
  // ZERO placeholder boxes and passed the 2026-08-01 QA sweep, so the gate was
  // costing reach for nothing — 6 of 8 studies locked meant every hard revenue
  // number on the site sat behind the wall and positions 2–7 of the homepage
  // carousel were six consecutive locked cards. Readable studies: 2 → 5.
  // Re-lock by adding the slug back here AND re-checking the NextProject
  // dead-end hazard in .claude/rules/access-gating.md.
  // (Playground subpage entries removed 2026-07-18 — the /play subpages
  // were deleted in May and playground cards are pure-visual now, so
  // nothing consults these slugs.)
]);

export function isLocked(slug: string): boolean {
  return LOCKED_SLUGS.has(slug);
}

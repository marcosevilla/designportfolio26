/**
 * Single source of truth for which slugs are gated behind the password
 * modal. Used by `<LockGate>` (cards + pages) and `<CaseStudyListRow>`
 * (list view). To unlock a piece of content permanently when it's
 * ready to ship publicly, remove its slug from this Set.
 */
export const LOCKED_SLUGS: ReadonlySet<string> = new Set([
  // Work case studies
  // "compendium" unlocked 2026-07-18 after content pass
  "knowledge-base",
  "upsells",
  "checkin",
  "general-task",
  "design-system",
  // (Playground subpage entries removed 2026-07-18 — the /play subpages
  // were deleted in May and playground cards are pure-visual now, so
  // nothing consults these slugs.)
]);

export function isLocked(slug: string): boolean {
  return LOCKED_SLUGS.has(slug);
}

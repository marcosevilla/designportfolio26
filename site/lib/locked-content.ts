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
  // Playground subpages
  "six-degrees",
  "pajamagrams",
  "custom-wrapped",
]);

export function isLocked(slug: string): boolean {
  return LOCKED_SLUGS.has(slug);
}

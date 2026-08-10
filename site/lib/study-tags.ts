export const STUDY_TAGS: Record<string, string[]> = {
  "canary-food-and-beverage-ordering": ["0→1", "Mobile", "Desktop", "CMS", "Workflow"],
  "canary-guest-hub": ["Enterprise", "Desktop", "Mobile", "CMS", "Revenue Impact", "Design Systems"],
  "canary-guest-upsells": ["Enterprise", "Desktop", "Mobile", "Revenue Impact", "Workflow"],
  "canary-mobile-check-in": ["Enterprise", "Mobile", "Desktop", "Revenue Impact", "Workflow", "Design Systems"],
  "knowledge-base": ["Enterprise", "Desktop", "AI", "CMS"],
  "general-task": ["0→1", "Desktop", "Founding Designer"],
  "general-task-design-system": ["0→1", "Desktop", "Design Systems", "Founding Designer"],
  "ai-workflow": ["AI", "Workflow", "Desktop"],
};

/** All unique tags, sorted alphabetically. */
export const ALL_TAGS: string[] = Array.from(
  new Set(Object.values(STUDY_TAGS).flat())
).sort();

/** Return slugs matching ALL active tags (intersection). */
export function getMatchingSlugs(activeTags: string[]): Set<string> {
  if (activeTags.length === 0) return new Set(Object.keys(STUDY_TAGS));
  return new Set(
    Object.entries(STUDY_TAGS)
      .filter(([, tags]) => activeTags.every((t) => tags.includes(t)))
      .map(([slug]) => slug)
  );
}

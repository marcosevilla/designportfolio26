export const STUDY_TAGS: Record<string, string[]> = {
  "fb-ordering": ["0→1", "Mobile", "CMS", "Workflow"],
  "compendium": ["Enterprise", "Desktop", "Mobile", "CMS", "Revenue Impact", "Design Systems"],
  "upsells": ["Enterprise", "Desktop", "Mobile", "Revenue Impact", "Workflow"],
  "checkin": ["Enterprise", "Mobile", "Desktop", "Revenue Impact", "Workflow", "Design Systems"],
  "general-task": ["0→1", "Desktop", "Founding Designer"],
  "design-system": ["0→1", "Desktop", "Design Systems", "Founding Designer"],
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

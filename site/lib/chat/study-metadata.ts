// Single source of truth for case-study identity in the chat bar.
// Used by:
//   - the system prompt (server) to teach Claude valid slugs and study facts
//   - the client parser allowlist for [label](study:slug) markup
//   - the CaseStudyCardUnfurl client component for the gradient + metadata

export const STUDY_SLUGS = [
  "fb-ordering",
  "compendium",
  "upsells",
  "checkin",
  "general-task",
  "design-system",
  "ai-workflow",
] as const;

export type StudySlug = (typeof STUDY_SLUGS)[number];

export type StudyMeta = {
  slug: StudySlug;
  title: string;
  company: string;
  role: string;
  year: string;
  metric: string;
  /** Gradient stops for the unfurl card background. Mirrors CaseStudyHero values. */
  gradient: [string, string];
};

export const STUDY_METADATA: Record<StudySlug, StudyMeta> = {
  "fb-ordering": {
    slug: "fb-ordering",
    title: "Mobile ordering for hotels",
    company: "Canary",
    role: "Sole designer",
    year: "2025",
    metric: "0→1, 100% ownership",
    gradient: ["#EF5A3C", "#ED4F2F"],
  },
  compendium: {
    slug: "compendium",
    title: "Hotel guest hub",
    company: "Canary",
    role: "Product designer",
    year: "2024",
    metric: "$1M+ CARR",
    gradient: ["#2563EB", "#1D4ED8"],
  },
  upsells: {
    slug: "upsells",
    title: "Upsells Forms",
    company: "Canary Technologies",
    role: "Lead designer",
    year: "2025",
    metric: "$3.8M CARR",
    gradient: ["#0D9488", "#0F766E"],
  },
  checkin: {
    slug: "checkin",
    title: "Hotel Check-in",
    company: "Canary Technologies",
    role: "Product designer",
    year: "2024",
    metric: "4,500+ hotels",
    gradient: ["#6366F1", "#4F46E5"],
  },
  "general-task": {
    slug: "general-task",
    title: "Unified hub for knowledge work",
    company: "General Task",
    role: "Founding designer",
    year: "2022",
    metric: "0→1 product",
    gradient: ["#334155", "#1E293B"],
  },
  "design-system": {
    slug: "design-system",
    title: "Building a visual language 0→1",
    company: "General Task",
    role: "Founding designer",
    year: "2022",
    metric: "0→1 system",
    gradient: ["#8B5CF6", "#7C3AED"],
  },
  "ai-workflow": {
    slug: "ai-workflow",
    title: "How I Work with AI",
    company: "Personal",
    role: "Designer + builder",
    year: "2026",
    metric: "Daily AI practice",
    gradient: ["#0F172A", "#1E293B"],
  },
};

export function isStudySlug(value: string): value is StudySlug {
  return (STUDY_SLUGS as readonly string[]).includes(value);
}

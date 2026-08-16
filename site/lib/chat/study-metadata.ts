// Single source of truth for case-study identity in the chat bar.
// Used by:
//   - the system prompt (server) to teach Claude valid slugs and study facts
//   - the client parser allowlist for [label](study:slug) markup
//   - the CaseStudyCardUnfurl client component for the gradient + metadata

export const STUDY_SLUGS = [
  "canary-food-and-beverage-ordering",
  "canary-guest-hub",
  "canary-guest-upsells",
  "canary-mobile-check-in",
  "knowledge-base",
  "general-task",
  "general-task-design-system",
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
  "canary-food-and-beverage-ordering": {
    slug: "canary-food-and-beverage-ordering",
    title: "Canary Food & Beverage Ordering",
    company: "Canary Technologies",
    role: "Lead designer",
    year: "2025–2026",
    metric: "0→1, 100% ownership",
    gradient: ["#EF5A3C", "#ED4F2F"],
  },
  "canary-guest-hub": {
    slug: "canary-guest-hub",
    title: "Canary Guest Hub",
    company: "Canary",
    role: "Product designer",
    year: "2024–2025",
    metric: "$1.51M CARR · +230% YoY",
    gradient: ["#2563EB", "#1D4ED8"],
  },
  "canary-guest-upsells": {
    slug: "canary-guest-upsells",
    title: "Canary Guest Upsells",
    company: "Canary",
    role: "Lead designer",
    year: "2025",
    metric: "$6.94M CARR · +10% lift",
    gradient: ["#0D9488", "#0F766E"],
  },
  "canary-mobile-check-in": {
    slug: "canary-mobile-check-in",
    title: "Canary Mobile Check-in",
    company: "Canary",
    role: "Product designer",
    year: "2024",
    metric: "~6,000 Wyndham properties",
    gradient: ["#6366F1", "#4F46E5"],
  },
  "knowledge-base": {
    slug: "knowledge-base",
    title: "AI Knowledge Base",
    company: "Canary",
    role: "Product designer",
    year: "2024 · shipped 2026",
    metric: "2 AI products, one KB",
    gradient: ["#7C3AED", "#4F46E5"],
  },
  "general-task": {
    slug: "general-task",
    title: "General Task",
    company: "General Task",
    role: "Founding designer",
    year: "2022",
    metric: "0→1 product",
    gradient: ["#334155", "#1E293B"],
  },
  "general-task-design-system": {
    slug: "general-task-design-system",
    title: "General Task Design System",
    company: "General Task",
    role: "Founding designer",
    year: "2022",
    metric: "0→1 system",
    gradient: ["#8B5CF6", "#7C3AED"],
  },
  "ai-workflow": {
    slug: "ai-workflow",
    title: "Prototypes as the spec",
    company: "Personal",
    role: "Designer + builder",
    year: "2025–2026",
    metric: "~50 prototypes · 8-PR ship",
    gradient: ["#0F172A", "#1E293B"],
  },
};

export function isStudySlug(value: string): value is StudySlug {
  return (STUDY_SLUGS as readonly string[]).includes(value);
}

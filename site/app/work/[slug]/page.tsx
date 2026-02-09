import { notFound } from "next/navigation";
import { getCaseStudy, getAllSlugs } from "@/lib/content";
import CaseStudyPage from "./CaseStudyPage";

interface Props {
  params: { slug: string };
}

// These case studies have dedicated routes with custom React components
const DEDICATED_ROUTES = new Set(["fb-ordering", "compendium", "upsells", "checkin", "general-task", "design-system"]);

// Disable dynamic params since all current case studies have dedicated routes
export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = getAllSlugs().filter((slug) => !DEDICATED_ROUTES.has(slug));
  // Return at least a placeholder if all routes are dedicated (required for static export)
  if (slugs.length === 0) {
    return [{ slug: "_placeholder" }];
  }
  return slugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props) {
  const study = getCaseStudy(params.slug);
  if (!study) return {};

  return {
    title: `${study.title} — Marco Sevilla`,
    description: study.subtitle,
  };
}

export default function WorkPage({ params }: Props) {
  const study = getCaseStudy(params.slug);

  if (!study) {
    notFound();
  }

  return <CaseStudyPage study={study} />;
}

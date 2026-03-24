import { getCaseStudies } from "@/lib/content";
import WorkContent from "./WorkContent";

export const metadata = {
  title: "Work — Marco Sevilla",
  description:
    "Case studies in hospitality technology, productivity tools, and design systems. Product design work from Canary Technologies and General Task.",
};

export default function WorkPage() {
  const studies = getCaseStudies();

  return (
    <div className="max-w-content-lg mx-auto px-4 sm:px-8">
      <WorkContent studies={studies} />
    </div>
  );
}

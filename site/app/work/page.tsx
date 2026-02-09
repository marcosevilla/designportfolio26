import { getCaseStudies } from "@/lib/content";
import WorkContent from "./WorkContent";

export const metadata = {
  title: "Work — Marco Sevilla",
};

export default function WorkPage() {
  const studies = getCaseStudies();

  return (
    <div className="max-w-content-lg mx-auto px-4 sm:px-8">
      <WorkContent studies={studies} />
    </div>
  );
}

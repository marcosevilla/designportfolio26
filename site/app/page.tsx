import { Suspense } from "react";
import CaseStudyList from "@/components/CaseStudyList";
import HomeLayout from "@/components/HomeLayout";
import { getCaseStudies } from "@/lib/content";

export default function Home() {
  const studies = getCaseStudies();

  return (
    <Suspense fallback={null}>
      <HomeLayout work={<CaseStudyList studies={studies} />} />
    </Suspense>
  );
}

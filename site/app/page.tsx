import CaseStudyList from "@/components/CaseStudyList";
import HomeLayout from "@/components/HomeLayout";
import { getCaseStudies } from "@/lib/content";

export default function Home() {
  const studies = getCaseStudies();

  // No Suspense wrapper here — useSearchParams is isolated inside
  // HomeLayout's AboutParamWatcher so the homepage markup prerenders.
  return <HomeLayout work={<CaseStudyList studies={studies} />} />;
}

import CaseStudyList from "@/components/CaseStudyList";
import HomeLayout from "@/components/HomeLayout";
import { getCaseStudies } from "@/lib/content";

export default function Home() {
  const studies = getCaseStudies();

  return <HomeLayout work={<CaseStudyList studies={studies} />} />;
}

import CaseStudyList from "@/components/CaseStudyList";
import Marquee from "@/components/Marquee";
import HomeLayout from "@/components/HomeLayout";
import Teaser from "@/components/Teaser";
import { getCaseStudies } from "@/lib/content";

const TEASER_MODE = process.env.NEXT_PUBLIC_TEASER_MODE === "true";

export default function Home() {
  if (TEASER_MODE) {
    return <Teaser />;
  }

  const studies = getCaseStudies();

  return (
    <HomeLayout
      work={<CaseStudyList studies={studies} />}
      marquee={<Marquee />}
    />
  );
}

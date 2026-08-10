import type { Metadata } from "next";
import CheckinContent from "./CheckinContent";
import LockGate from "@/components/LockGate";
import { isLocked } from "@/lib/locked-content";
import { getStudyMeta } from "@/lib/content";

export const metadata: Metadata = {
  title: "Canary Mobile Check-in — Marco Sevilla",
  description:
    "Modernizing software for the world's largest global hotel chains. Designing seamless digital check-in, compendium, and omni-channel communication solutions.",
  openGraph: {
    title: "Canary Mobile Check-in — Marco Sevilla",
    description:
      "Modernizing software for the world's largest global hotel chains. Designing seamless digital check-in, compendium, and omni-channel communication solutions.",
    images: [
      {
        url: "/images/checkin/hero.webp",
        width: 1600,
        height: 676,
        alt: "Canary digital check-in flow on mobile",
      },
    ],
  },
};

export default function CheckinPage() {
  const meta = getStudyMeta("canary-mobile-check-in");

  return (
    <LockGate
      mode="page"
      locked={isLocked("canary-mobile-check-in")}
      title="Canary Mobile Check-in"
      subtitle="Modernizing software for the world's largest hotel chains"
      backHref="/#projects"
    >
      <div className="pb-20">
        <CheckinContent meta={meta} />
      </div>
    </LockGate>
  );
}

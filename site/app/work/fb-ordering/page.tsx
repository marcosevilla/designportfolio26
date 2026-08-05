import type { Metadata } from "next";
import FBOrderingContent from "./FBOrderingContent";
import LockGate from "@/components/LockGate";
import { isLocked } from "@/lib/locked-content";
import { getStudyMeta } from "@/lib/content";

export const metadata: Metadata = {
  title: "Modernizing food & beverage ordering for hotels — Marco Sevilla",
  description:
    "A mobile, app-less food and beverage ordering system that lets hotel guests browse menus and place room service orders from their phone.",
  openGraph: {
    title: "Modernizing food & beverage ordering for hotels — Marco Sevilla",
    description:
      "A mobile, app-less food and beverage ordering system that lets hotel guests browse menus and place room service orders from their phone.",
  },
};

export default function FBOrderingPage() {
  const meta = getStudyMeta("fb-ordering");

  return (
    <LockGate
      mode="page"
      locked={isLocked("fb-ordering")}
      title="Mobile ordering for hotels"
      subtitle="Designing a 0→1 mobile ordering system for hotels"
      backHref="/#projects"
    >
      <div className="pb-20">
        <FBOrderingContent meta={meta} />
      </div>
    </LockGate>
  );
}

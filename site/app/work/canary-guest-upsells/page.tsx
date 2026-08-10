import type { Metadata } from "next";
import UpsellsContent from "./UpsellsContent";
import LockGate from "@/components/LockGate";
import { isLocked } from "@/lib/locked-content";
import { getStudyMeta } from "@/lib/content";

export const metadata: Metadata = {
  title: "Canary Guest Upsells — Marco Sevilla",
  description:
    "A configurable form system that lets hotels collect custom guest information at the point of upsell purchase — turning simple add-ons into structured service requests.",
  openGraph: {
    title: "Canary Guest Upsells — Marco Sevilla",
    description:
      "A configurable form system that lets hotels collect custom guest information at the point of upsell purchase — turning simple add-ons into structured service requests.",
  },
};

export default function UpsellsPage() {
  const meta = getStudyMeta("canary-guest-upsells");

  return (
    <LockGate
      mode="page"
      locked={isLocked("canary-guest-upsells")}
      title="Canary Guest Upsells"
      subtitle="A configurable form system for hotel upsell purchases"
      backHref="/#projects"
    >
      <div className="pb-20">
        <UpsellsContent meta={meta} />
      </div>
    </LockGate>
  );
}

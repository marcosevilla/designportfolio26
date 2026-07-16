import type { Metadata } from "next";
import UpsellsContent from "./UpsellsContent";
import LockGate from "@/components/LockGate";
import { isLocked } from "@/lib/locked-content";

export const metadata: Metadata = {
  title: "Upsells Forms — Marco Sevilla",
  description:
    "A configurable form system that lets hotels collect custom guest information at the point of upsell purchase — turning simple add-ons into structured service requests.",
  openGraph: {
    title: "Upsells Forms — Marco Sevilla",
    description:
      "A configurable form system that lets hotels collect custom guest information at the point of upsell purchase — turning simple add-ons into structured service requests.",
  },
};

export default function UpsellsPage() {
  return (
    <LockGate
      mode="page"
      locked={isLocked("upsells")}
      title="Upsells"
      subtitle="A configurable form system for hotel upsell purchases"
      backHref="/work"
    >
      <div className="pb-20">
        <UpsellsContent />
      </div>
    </LockGate>
  );
}

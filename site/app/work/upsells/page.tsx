import type { Metadata } from "next";
import UpsellsContent from "./UpsellsContent";

export const metadata: Metadata = {
  title: "Upsells Forms — Marco Sevilla",
  description:
    "A configurable form system that lets hotels collect custom guest information at the point of upsell purchase — turning simple add-ons into structured service requests.",
};

export default function UpsellsPage() {
  return (
    <div className="-mt-24 lg:-mt-[18vh] pb-20">
      <UpsellsContent />
    </div>
  );
}

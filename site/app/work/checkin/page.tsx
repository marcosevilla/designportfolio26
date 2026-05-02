import type { Metadata } from "next";
import CheckinContent from "./CheckinContent";
import LockGate from "@/components/LockGate";
import { isLocked } from "@/lib/locked-content";

export const metadata: Metadata = {
  title: "Hotel Check-in — Marco Sevilla",
  description:
    "Modernizing software for the world's largest global hotel chains. Designing seamless digital check-in, compendium, and omni-channel communication solutions.",
  openGraph: {
    title: "Hotel Check-in — Marco Sevilla",
    description:
      "Modernizing software for the world's largest global hotel chains. Designing seamless digital check-in, compendium, and omni-channel communication solutions.",
  },
};

export default function CheckinPage() {
  return (
    <LockGate
      mode="page"
      locked={isLocked("checkin")}
      title="Hotel Check-in"
      subtitle="Modernizing software for the world's largest hotel chains"
      backHref="/work"
    >
      <div className="pb-20">
        <CheckinContent />
      </div>
    </LockGate>
  );
}

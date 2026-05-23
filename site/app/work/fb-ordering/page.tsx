import type { Metadata } from "next";
import FBOrderingContent from "./FBOrderingContent";
import LockGate from "@/components/LockGate";
import { isLocked } from "@/lib/locked-content";

export const metadata: Metadata = {
  title: "F&B Mobile Ordering — Marco Sevilla",
  description:
    "A mobile, app-less food and beverage ordering system that lets hotel guests browse menus and place room service orders from their phone.",
  openGraph: {
    title: "F&B Mobile Ordering — Marco Sevilla",
    description:
      "A mobile, app-less food and beverage ordering system that lets hotel guests browse menus and place room service orders from their phone.",
  },
};

export default function FBOrderingPage() {
  return (
    <LockGate
      mode="page"
      locked={isLocked("fb-ordering")}
      title="Mobile ordering for hotels"
      subtitle="Designing a 0→1 mobile ordering system for hotels"
      backHref="/work"
    >
      <div className="pb-20">
        <FBOrderingContent />
      </div>
    </LockGate>
  );
}

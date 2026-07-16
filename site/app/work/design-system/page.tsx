import type { Metadata } from "next";
import DesignSystemContent from "./DesignSystemContent";
import LockGate from "@/components/LockGate";
import { isLocked } from "@/lib/locked-content";

export const metadata: Metadata = {
  title: "Design System — Marco Sevilla",
  description:
    "Creating a design system for a productivity startup. Championing and executing a visual language overhaul to streamline product development.",
  openGraph: {
    title: "Design System — Marco Sevilla",
    description:
      "Creating a design system for a productivity startup. Championing and executing a visual language overhaul to streamline product development.",
  },
};

export default function DesignSystemPage() {
  return (
    <LockGate
      mode="page"
      locked={isLocked("design-system")}
      title="Building a visual language 0-1"
      subtitle="Creating a scalable design system for a productivity startup"
      backHref="/work"
    >
      <div className="pb-20">
        <DesignSystemContent />
      </div>
    </LockGate>
  );
}

import type { Metadata } from "next";
import DesignSystemContent from "./DesignSystemContent";
import LockGate from "@/components/LockGate";
import { isLocked } from "@/lib/locked-content";
import { getStudyMeta } from "@/lib/content";

export const metadata: Metadata = {
  title: "General Task Design System — Marco Sevilla",
  description:
    "Creating a design system for a productivity startup. Championing and executing a visual language overhaul to streamline product development.",
  openGraph: {
    title: "General Task Design System — Marco Sevilla",
    description:
      "Creating a design system for a productivity startup. Championing and executing a visual language overhaul to streamline product development.",
    images: [
      {
        url: "/images/design-system/hero.png",
        width: 2048,
        height: 1280,
        alt: "General Task design system component overview",
      },
    ],
  },
};

export default function DesignSystemPage() {
  const meta = getStudyMeta("general-task-design-system");

  return (
    <LockGate
      mode="page"
      locked={isLocked("general-task-design-system")}
      title="General Task Design System"
      subtitle="Creating a scalable design system for a productivity startup"
      backHref="/#projects"
    >
      <div className="pb-20">
        <DesignSystemContent meta={meta} />
      </div>
    </LockGate>
  );
}

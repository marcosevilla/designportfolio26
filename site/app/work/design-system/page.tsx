import type { Metadata } from "next";
import DesignSystemContent from "./DesignSystemContent";

export const metadata: Metadata = {
  title: "Design System — Marco Sevilla",
  description:
    "Creating a design system for a productivity startup. Championing and executing a visual language overhaul to streamline product development.",
};

export default function DesignSystemPage() {
  return (
    <div className="pb-20">
      <DesignSystemContent />
    </div>
  );
}

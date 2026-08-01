import type { Metadata } from "next";
import AIWorkflowContent from "./AIWorkflowContent";

export const metadata: Metadata = {
  title: "Prototypes as the Spec — Marco Sevilla",
  description:
    "How working prototypes replaced Figma as the engineering handoff spec — ~50 shipped, an 8-PR production slice, and a 24-hour CEO demo.",
  openGraph: {
    title: "Prototypes as the Spec — Marco Sevilla",
    description:
      "How working prototypes replaced Figma as the engineering handoff spec — ~50 shipped, an 8-PR production slice, and a 24-hour CEO demo.",
  },
};

export default function AIWorkflowPage() {
  return (
    <div className="pb-20">
      <AIWorkflowContent />
    </div>
  );
}

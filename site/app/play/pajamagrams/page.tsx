import type { Metadata } from "next";
import PajamagramsContent from "./PajamagramsContent";

export const metadata: Metadata = {
  title: "Pajamagrams — Marco Sevilla",
  description:
    "A mobile-first Bananagrams-inspired puzzle gift. Designed in Figma, built with React + framer-motion via the Figma MCP workflow.",
  openGraph: {
    title: "Pajamagrams — Marco Sevilla",
    description:
      "A mobile-first Bananagrams-inspired puzzle gift, built via the Figma MCP workflow.",
  },
};

export default function PajamagramsPage() {
  return (
    <div className="pb-20">
      <PajamagramsContent />
    </div>
  );
}

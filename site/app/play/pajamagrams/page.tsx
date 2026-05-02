import type { Metadata } from "next";
import PajamagramsContent from "./PajamagramsContent";
import LockGate from "@/components/LockGate";
import { isLocked } from "@/lib/locked-content";

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
    <LockGate
      mode="page"
      locked={isLocked("pajamagrams")}
      title="Pajamagrams"
      subtitle="A mobile-first puzzle gift inspired by Bananagrams"
      backHref="/play"
    >
      <div className="pb-20">
        <PajamagramsContent />
      </div>
    </LockGate>
  );
}

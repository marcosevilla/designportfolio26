import type { Metadata } from "next";
import SixDegreesContent from "./SixDegreesContent";
import LockGate from "@/components/LockGate";
import { isLocked } from "@/lib/locked-content";

export const metadata: Metadata = {
  title: "Six Degrees — Marco Sevilla",
  description:
    "A movie-graph puzzle game that started as a roadtrip car game with friends. Built with Next.js, TMDb, and synthesized Web Audio.",
  openGraph: {
    title: "Six Degrees — Marco Sevilla",
    description:
      "A movie-graph puzzle game that started as a roadtrip car game with friends.",
  },
};

export default function SixDegreesPage() {
  return (
    <LockGate
      mode="page"
      locked={isLocked("six-degrees")}
      title="Six Degrees"
      subtitle="Movie-graph puzzle game built with Next.js, TMDb, and Web Audio"
      backHref="/play"
    >
      <div className="pb-20">
        <SixDegreesContent />
      </div>
    </LockGate>
  );
}

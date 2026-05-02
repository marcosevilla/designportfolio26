import type { Metadata } from "next";
import SixDegreesContent from "./SixDegreesContent";

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
    <div className="pb-20">
      <SixDegreesContent />
    </div>
  );
}

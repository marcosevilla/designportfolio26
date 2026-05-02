import type { Metadata } from "next";
import CustomWrappedContent from "./CustomWrappedContent";

export const metadata: Metadata = {
  title: "Custom Wrapped — Marco Sevilla",
  description:
    "A year-in-review experience built like Spotify Wrapped — vertical swipe carousel, GSAP timelines, stop-motion animation, sourced from a year of personal data.",
  openGraph: {
    title: "Custom Wrapped — Marco Sevilla",
    description:
      "A year-in-review experience built like Spotify Wrapped, sourced from a year of personal data.",
  },
};

export default function CustomWrappedPage() {
  return (
    <div className="pb-20">
      <CustomWrappedContent />
    </div>
  );
}

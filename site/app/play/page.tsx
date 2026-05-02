import type { Metadata } from "next";
import FadeIn from "@/components/FadeIn";
import Playground from "@/components/Playground";
import { typescale } from "@/lib/typography";

export const metadata: Metadata = {
  title: "Play — Marco Sevilla",
  description:
    "Personal experiments and projects leveraging AI tooling.",
  openGraph: {
    title: "Play — Marco Sevilla",
    description:
      "Personal experiments and projects leveraging AI tooling.",
  },
};

export default function PlayPage() {
  return (
    <div className="max-w-content mx-auto px-4 sm:px-8 pb-20">
      <FadeIn>
        <h1 className="tracking-tight" style={typescale.pageTitle}>
          Play
        </h1>
      </FadeIn>
      <FadeIn delay={0.05}>
        <p
          className="mt-4"
          style={{
            ...typescale.body,
            color: "var(--color-fg-secondary)",
            maxWidth: "560px",
          }}
        >
          Personal experiments and projects leveraging AI tooling.
        </p>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mt-16">
          <Playground hideHeader />
        </div>
      </FadeIn>
    </div>
  );
}

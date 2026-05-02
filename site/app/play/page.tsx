import type { Metadata } from "next";
import FadeIn from "@/components/FadeIn";
import Playground from "@/components/Playground";
import { typescale } from "@/lib/typography";

export const metadata: Metadata = {
  title: "Play — Marco Sevilla",
  description:
    "Personal experiments and gifts. Software as a love language; AI as the way I get the ideas in my head out into the world.",
  openGraph: {
    title: "Play — Marco Sevilla",
    description:
      "Personal experiments and gifts. Software as a love language; AI as the way I get the ideas in my head out into the world.",
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
          Personal experiments and gifts. Software as a love language; AI as the
          way I get the ideas in my head out into the world.
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

import FadeIn from "@/components/FadeIn";
import { typescale } from "@/lib/typography";

export const metadata = {
  title: "Play — Marco Sevilla",
};

export default function PlayPage() {
  return (
    <div className="max-w-content mx-auto px-4 sm:px-8">
      <FadeIn>
        <h1 className="tracking-tight" style={typescale.pageTitle}>
          Play
        </h1>
      </FadeIn>
      <FadeIn delay={0.1}>
        <p className="mt-4 text-[var(--color-fg-secondary)]">Coming soon.</p>
      </FadeIn>
    </div>
  );
}

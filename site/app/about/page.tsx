import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import { RenderParagraph } from "@/components/StreamingText";
import { PARAGRAPHS, PROMPTS } from "@/lib/bio-content";
import { typescale } from "@/lib/typography";

export const metadata = {
  title: "About — Marco Sevilla",
  description:
    "Product designer in San Francisco. Currently at Canary Technologies, designing hospitality platforms for major hotel brands.",
};

export default function AboutPage() {
  return (
    <div className="max-w-content mx-auto px-4 sm:px-8">
      <FadeIn>
        <h1 className="tracking-tight" style={typescale.pageTitle}>
          About
        </h1>
      </FadeIn>

      <div className="mt-10 text-[var(--color-fg-secondary)] leading-[28px]" style={{ fontSize: "calc(14px + var(--font-size-offset))" }}>
        {PARAGRAPHS.map((para, i) => {
          // PROMPTS aligns with paragraphs 2..6 (PROMPTS[i-1] for i >= 1)
          const label = i > 0 ? PROMPTS[i - 1] : null;
          return (
            <FadeIn key={i} delay={0.05 + i * 0.05}>
              <section className={i === 0 ? "" : "mt-10"}>
                {label && (
                  <h2 className="mb-3" style={typescale.sectionLabel}>
                    {label}
                  </h2>
                )}
                <p>
                  <RenderParagraph para={para} />
                </p>
              </section>
            </FadeIn>
          );
        })}
      </div>

      <FadeIn delay={0.05 + PARAGRAPHS.length * 0.05}>
        <p className="mt-12">
          <Link href="/" className="dotted-link dotted-link--inline">
            <span className="dotted-link-arrow">←</span> Back home
          </Link>
        </p>
      </FadeIn>
    </div>
  );
}

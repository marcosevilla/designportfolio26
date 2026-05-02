"use client";

import CaseStudyShell from "@/components/case-study/CaseStudyShell";
import FadeIn from "@/components/case-study/FadeIn";
import SectionHeading from "@/components/case-study/SectionHeading";
import ImagePlaceholder from "@/components/case-study/ImagePlaceholder";
import NextProject from "@/components/case-study/NextProject";
import TwoCol from "@/components/TwoCol";
import { typescale } from "@/lib/typography";

const TOC_ITEMS = [
  { id: "idea", label: "The idea" },
  { id: "spine", label: "Spine" },
  { id: "identity", label: "Visual identity" },
  { id: "data", label: "Personal data" },
  { id: "proves", label: "What it proves" },
];

export default function CustomWrappedContent() {
  return (
    <CaseStudyShell tocItems={TOC_ITEMS} backHref="/play">
      {/* Header */}
      <div>
        <p
          className="mb-3 text-(--color-fg-tertiary)"
          style={{
            fontFamily:
              "var(--font-geist-mono), ui-monospace, Menlo, monospace",
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Playground · Nov 2025
        </p>
        <h1
          className="tracking-tight text-(--color-fg)"
          style={typescale.display}
        >
          Custom Wrapped
        </h1>
        <p
          className="mt-3 text-(--color-fg-secondary)"
          style={{ ...typescale.subtitle, maxWidth: "66%" }}
        >
          A year-in-review experience built like Spotify Wrapped — vertical
          swipe carousel, GSAP timelines, stop-motion animation, and a year of
          personal data as the source material.
        </p>
      </div>

      {/* Hero video */}
      <FadeIn className="mt-10">
        <div
          className="mx-auto rounded-[10px] overflow-hidden bg-(--color-surface-raised) border border-(--color-border)"
          style={{ aspectRatio: "648 / 1080", maxWidth: "320px" }}
        >
          <video
            src="/videos/playground/custom-wrapped.mp4"
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            aria-label="Custom Wrapped slide carousel"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      </FadeIn>

      {/* Idea */}
      <FadeIn as="section" className="scroll-mt-24 pt-24">
        <TwoCol>
          <TwoCol.Left>
            <SectionHeading id="idea">The idea</SectionHeading>
            <p className="mb-5">
              Spotify Wrapped is well-trodden territory now — every product team
              makes one. The interesting question wasn&rsquo;t whether to make
              another, but whether I could make one that felt like <em>mine</em>
              : visually distinct, sourced from my actual year, and intentional
              enough that someone close would feel seen by it.
            </p>
            <p>
              I built it as a gift. The thesis underneath it — and the reason I
              keep coming back to projects like this one — is that AI is the
              tool that finally lets a vault of half-formed creative ideas
              become real things you can hand to someone.
            </p>
          </TwoCol.Left>
        </TwoCol>
      </FadeIn>

      {/* Spine */}
      <FadeIn as="section" className="scroll-mt-24 pt-32">
        <TwoCol>
          <TwoCol.Left>
            <SectionHeading id="spine">Building the spine</SectionHeading>
            <p className="mb-5">
              The whole project is fundamentally scroll-storytelling: sequenced
              timelines, choreographed reveals, multiple elements moving in
              sync, slide by slide. That shape of work is GSAP&rsquo;s natural
              home, so GSAP runs the choreography. embla-carousel handles the
              iOS-feeling vertical swipe — native momentum, snap, and
              direction-aware velocity, hooked into GSAP so each slide change
              triggers its own scripted reveal. Background color interpolates
              between slides during the swipe so the discrete vignettes feel
              continuous.
            </p>
            <p>
              Each slide is its own React component with its own timeline. The
              container orchestrates; the slides perform.
            </p>
          </TwoCol.Left>
        </TwoCol>
      </FadeIn>

      <FadeIn className="mt-10">
        <ImagePlaceholder
          description="Slide map — every slide in the carousel as a strip"
          aspectRatio="16/9"
        />
      </FadeIn>

      {/* Identity */}
      <FadeIn as="section" className="scroll-mt-24 pt-32">
        <TwoCol>
          <TwoCol.Left>
            <SectionHeading id="identity">The visual identity</SectionHeading>
            <p className="mb-5">
              The motion is deliberately not-smooth. Animations step through
              discrete frames at chunky intervals — DIY, vintage-video-game
              cadence rather than the over-tweened feel typical of polished web
              product. The decision was creative direction, not a constraint. I
              wanted vintage with modern elements; I designed the visual concept
              in Figma first; I then articulated the motion principles to Claude
              carefully enough that the implementation could intuit how every
              button, transition, and element should behave.
            </p>
            <p className="mb-8">
              Articulating motion intent succinctly enough for an LLM to
              translate it faithfully is becoming a quiet thread across these
              projects. This one pushed it the furthest.
            </p>
            <p className="mb-5 font-medium text-(--color-fg)">
              Three font voices, each scoped to a role:
            </p>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="text-(--color-accent) shrink-0 font-medium">
                  VT323
                </span>
                <span>
                  the throughline. 8-bit pixel terminal, vintage-game identity,
                  present on every slide.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-(--color-accent) shrink-0 font-medium">
                  Geist Sans
                </span>
                <span>
                  the loud beats. Big numbers, slide titles, callouts.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-(--color-accent) shrink-0 font-medium">
                  Caveat
                </span>
                <span>
                  the intimate beats. The wedding slide reads like a thank-you
                  card from real wedding stationery; the rest of the slide
                  doesn&rsquo;t need to.
                </span>
              </li>
            </ul>
          </TwoCol.Left>
        </TwoCol>
      </FadeIn>

      <FadeIn className="mt-10">
        <ImagePlaceholder
          description="Type specimen — VT323, Geist, Caveat side-by-side with example slides"
          aspectRatio="16/9"
        />
      </FadeIn>

      {/* Data */}
      <FadeIn as="section" className="scroll-mt-24 pt-32">
        <TwoCol>
          <TwoCol.Left>
            <SectionHeading id="data">
              The real unlock: personal data as source material
            </SectionHeading>
            <p className="mb-5">
              The thing that makes Custom Wrapped <em>mine</em> — and not a
              Wrapped template with new colors — is the data underneath it.
            </p>
            <p className="mb-5">
              Each slide is sourced from my actual year. Two examples that felt
              especially good to build: a vacation count derived from scraping
              flight events out of my calendar across 2025, and a year-in-movies
              surface that cross-references my Letterboxd watchlist with my
              movie-theater visits to reconstruct every theater session I had.
            </p>
            <p>
              The result is a gift that&rsquo;s full of details only the
              recipient would catch — which was the point. A personalized
              digital experience, not a template. AI made the mining cheap; my
              year made it specific; the design made it land.
            </p>
          </TwoCol.Left>
        </TwoCol>
      </FadeIn>

      <FadeIn className="mt-10">
        <ImagePlaceholder
          description="Two example data slides — vacations from calendar, theater visits from Letterboxd"
          aspectRatio="16/9"
        />
      </FadeIn>

      {/* Proves */}
      <FadeIn as="section" className="scroll-mt-24 pt-32">
        <TwoCol>
          <TwoCol.Left>
            <SectionHeading id="proves">What this proves to me</SectionHeading>
            <p>
              That a designer who can direct AI well can produce small,
              personal, finished things at a quality bar that used to require a
              team. The vault of ideas becomes a queue.
            </p>
          </TwoCol.Left>
        </TwoCol>
      </FadeIn>

      <NextProject
        title="Six Degrees"
        subtitle="A movie-graph puzzle game that started as a roadtrip car game."
        href="/play/six-degrees"
      />
    </CaseStudyShell>
  );
}

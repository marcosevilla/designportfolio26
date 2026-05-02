"use client";

import CaseStudyShell from "@/components/case-study/CaseStudyShell";
import FadeIn from "@/components/case-study/FadeIn";
import SectionHeading from "@/components/case-study/SectionHeading";
import ImagePlaceholder from "@/components/case-study/ImagePlaceholder";
import NextProject from "@/components/case-study/NextProject";
import TwoCol from "@/components/TwoCol";
import { typescale } from "@/lib/typography";

const TOC_ITEMS = [
  { id: "gift-and-test", label: "Gift & test" },
  { id: "workflow", label: "Workflow" },
  { id: "snap", label: "Tile snap" },
  { id: "shipped", label: "Shipped" },
];

export default function PajamagramsContent() {
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
          Playground · Jan 2026
        </p>
        <h1
          className="tracking-tight text-(--color-fg)"
          style={typescale.display}
        >
          Pajamagrams
        </h1>
        <p
          className="mt-3 text-(--color-fg-secondary)"
          style={{ ...typescale.subtitle, maxWidth: "66%" }}
        >
          A mobile-first puzzle gift inspired by Bananagrams — drag tiles,
          clue-based rounds, and a deliberate stress test of how high-fidelity a
          Figma-MCP workflow could really get.
        </p>
      </div>

      {/* Hero video */}
      <FadeIn className="mt-10">
        <div
          className="mx-auto rounded-[10px] overflow-hidden bg-(--color-surface-raised) border border-(--color-border)"
          style={{ aspectRatio: "628 / 1080", maxWidth: "320px" }}
        >
          <video
            src="/videos/playground/pajamagrams.mp4"
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            aria-label="Pajamagrams gameplay loop"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      </FadeIn>

      {/* Gift & test */}
      <FadeIn as="section" className="scroll-mt-24 pt-24">
        <TwoCol>
          <TwoCol.Left>
            <SectionHeading id="gift-and-test">
              A gift, and a stress test
            </SectionHeading>
            <p className="mb-5">
              Pajamagrams started as a personal gift — a single-player puzzle
              game built for someone close, with clue-based rounds grounded in
              shared inside jokes. It was small, intimate, and intentionally
              scoped: phone-shaped, no auth, no backend, no roadmap.
            </p>
            <p>
              It was also a deliberate stress test of the Figma-MCP workflow at
              the time. I wanted to know how high-fidelity the design-to-code
              translation could actually get when every letter, every state, and
              every edge case lived in Figma first.
            </p>
          </TwoCol.Left>
        </TwoCol>
      </FadeIn>

      {/* Workflow */}
      <FadeIn as="section" className="scroll-mt-24 pt-32">
        <TwoCol>
          <TwoCol.Left>
            <SectionHeading id="workflow">The workflow</SectionHeading>
            <p className="mb-5">
              Every screen and every tile state was designed in Figma. The full
              visual system was nailed before any code was written. The
              mechanics, the interaction intent, and the <em>desired feel</em>{" "}
              were then handed to Claude alongside the Figma file via MCP.
            </p>
            <p>
              The build became an exercise in calibrating the seams. Claude
              would translate, the result wouldn&rsquo;t quite feel right,
              I&rsquo;d refine the prompt or the reference, repeat. The deeper
              lesson — the one that&rsquo;s stuck with me — was figuring out{" "}
              <strong>how much spec fidelity an LLM actually needs</strong> to
              make something feel as intended. Too vague and it hallucinates the
              feel. Over-specified and the iteration loop crawls. Pajamagrams
              was where I started to find that line.
            </p>
          </TwoCol.Left>
        </TwoCol>
      </FadeIn>

      <FadeIn className="mt-10">
        <ImagePlaceholder
          description="Figma source — letter tile system, screen states, edge cases"
          aspectRatio="16/9"
        />
      </FadeIn>

      {/* Snap */}
      <FadeIn as="section" className="scroll-mt-24 pt-32">
        <TwoCol>
          <TwoCol.Left>
            <SectionHeading id="snap">The hard part: tile snap</SectionHeading>
            <p className="mb-5">
              The mechanic isn&rsquo;t hard. The <em>feel</em> is.
            </p>
            <p className="mb-5">
              A user drags a tile toward a placeholder. They let go. The tile
              either snaps satisfyingly into place — communicating &ldquo;this
              knows where I want it&rdquo; — or refuses to commit, communicating
              &ldquo;this is frustrating.&rdquo; The actual difference between
              those two states is a few pixels of forgiveness in the snap
              threshold.
            </p>
            <p>
              Getting it right was less a coding problem than a translation
              problem: how do you describe &ldquo;feels good&rdquo; to a model
              in granular enough terms that it lands in numbers? That
              articulation work was the actual craft.
            </p>
          </TwoCol.Left>
        </TwoCol>
      </FadeIn>

      <FadeIn className="mt-10">
        <ImagePlaceholder
          description="Snap zones + tolerance diagram, or short clip of the snap feel"
          aspectRatio="4/3"
        />
      </FadeIn>

      {/* Shipped */}
      <FadeIn as="section" className="scroll-mt-24 pt-32">
        <TwoCol>
          <TwoCol.Left>
            <SectionHeading id="shipped">What it shipped as</SectionHeading>
            <p>
              A small, finished thing. Tactile tiles, clue-based rounds, the
              kind of object that&rsquo;s meant to be opened on a phone in
              private and smiled at. It served its purpose. The lessons about
              spec fidelity and motion articulation folded forward into the next
              project.
            </p>
          </TwoCol.Left>
        </TwoCol>
      </FadeIn>

      <NextProject
        title="Custom Wrapped"
        subtitle="A year-in-review experience built like Spotify Wrapped."
        href="/play/custom-wrapped"
      />
    </CaseStudyShell>
  );
}

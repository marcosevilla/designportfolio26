"use client";

import CaseStudyShell from "@/components/case-study/CaseStudyShell";
import FadeIn from "@/components/case-study/FadeIn";
import SectionHeading from "@/components/case-study/SectionHeading";
import ImagePlaceholder from "@/components/case-study/ImagePlaceholder";
import NextProject from "@/components/case-study/NextProject";
import TwoCol from "@/components/TwoCol";
import { typescale } from "@/lib/typography";

const TOC_ITEMS = [
  { id: "origin", label: "Origin" },
  { id: "build", label: "Build" },
  { id: "difficulty", label: "Difficulty" },
  { id: "audio", label: "Audio" },
  { id: "craft", label: "Craft" },
];

export default function SixDegreesContent() {
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
          Playground · Feb 2026 →
        </p>
        <h1
          className="tracking-tight text-(--color-fg)"
          style={typescale.display}
        >
          Six Degrees
        </h1>
        <p
          className="mt-3 text-(--color-fg-secondary)"
          style={{ ...typescale.subtitle, maxWidth: "66%" }}
        >
          A movie-graph puzzle game that started as a roadtrip car game with
          friends. Built as a stress test for AI-paired product work — and
          tuned, slowly, into something my movie-savvy friends still play.
        </p>
      </div>

      {/* Hero video */}
      <FadeIn className="mt-10">
        <div
          className="w-full rounded-[10px] overflow-hidden bg-(--color-surface-raised) border border-(--color-border)"
          style={{ aspectRatio: "1756 / 1080" }}
        >
          <video
            src="/videos/playground/six-degrees.mp4"
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            aria-label="Six Degrees gameplay loop"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      </FadeIn>

      {/* Origin */}
      <FadeIn as="section" className="scroll-mt-24 pt-24">
        <TwoCol>
          <TwoCol.Left>
            <SectionHeading id="origin">Origin</SectionHeading>
            <p className="mb-5">
              Long before it was a website, Six Degrees was a verbal game played
              on roadtrips with friends who love movies — connect any two actors
              through the films and shows they&rsquo;ve shared, fewest hops
              wins. The mechanic was already proven socially. The only question
              was whether it would survive being translated into a single-player
              web experience that strangers and friends would both want to come
              back to.
            </p>
            <p>
              I built it as a deliberate stress test: how far could I push
              Claude Code on a real, shippable product, with my product
              instincts as the steering wheel?
            </p>
          </TwoCol.Left>
        </TwoCol>
      </FadeIn>

      {/* Build */}
      <FadeIn as="section" className="scroll-mt-24 pt-32">
        <TwoCol>
          <TwoCol.Left>
            <SectionHeading id="build">Building it</SectionHeading>
            <p className="mb-5">
              Next.js 16 on Vercel, TypeScript, Tailwind v4, no external state
              library — just <code>useReducer</code> plus Context. The
              interesting work isn&rsquo;t the framing; it&rsquo;s behind the
              API.
            </p>
            <p className="mb-5">
              Actors come from TMDb, but TMDb&rsquo;s &ldquo;popular
              people&rdquo; endpoint is noisy. So the pool is filtered down to
              roughly 200 candidates that meet a real-mainstream-career bar: at
              least two English-language credits with 3,000+ votes apiece. The
              pool is built once, cached server-side for 24 hours, and re-pulled
              on deploy. Every TMDb call lives behind a <code>/api/tmdb/*</code>{" "}
              proxy so the API key stays on the server.
            </p>
            <p>That part is tablestakes. The next part is what I cared about.</p>
          </TwoCol.Left>
        </TwoCol>
      </FadeIn>

      <FadeIn className="mt-10">
        <ImagePlaceholder
          description="Architecture diagram — TMDb proxy, actor pool, 24h cache, verify-pair BFS"
          aspectRatio="16/9"
        />
      </FadeIn>

      {/* Difficulty */}
      <FadeIn as="section" className="scroll-mt-24 pt-32">
        <TwoCol>
          <TwoCol.Left>
            <SectionHeading id="difficulty">
              The graph as the difficulty oracle
            </SectionHeading>
            <p className="mb-5">
              Difficulty isn&rsquo;t tagged onto actors. It&rsquo;s computed
              live from the TMDb graph itself.
            </p>
            <p className="mb-5">
              When the player picks Easy, Medium, or Hard, the reveal screen
              pulls a random pair, runs a quick two-step BFS through their
              filmographies, and only commits the pair if the result matches the
              requested tier:
            </p>
            <ul className="space-y-3 mb-5">
              <li className="flex gap-3">
                <span className="text-(--color-accent) shrink-0 font-medium">
                  Easy
                </span>
                <span>they share a movie</span>
              </li>
              <li className="flex gap-3">
                <span className="text-(--color-accent) shrink-0 font-medium">
                  Medium
                </span>
                <span>one actor between them</span>
              </li>
              <li className="flex gap-3">
                <span className="text-(--color-accent) shrink-0 font-medium">
                  Hard
                </span>
                <span>no obvious 2-hop connection</span>
              </li>
            </ul>
            <p>
              Up to eight retries until something fits. No precomputed
              difficulty table. No manual tagging. The graph stays accurate as
              TMDb data evolves, and the system stays small enough to live in a
              single API route.
            </p>
          </TwoCol.Left>
        </TwoCol>
      </FadeIn>

      <FadeIn className="mt-10">
        <ImagePlaceholder
          description="Difficulty selector + reveal screen — easy/medium/hard color states"
          aspectRatio="16/9"
        />
      </FadeIn>

      {/* Audio */}
      <FadeIn as="section" className="scroll-mt-24 pt-32">
        <TwoCol>
          <TwoCol.Left>
            <SectionHeading id="audio">Sculpting the chimes</SectionHeading>
            <p className="mb-5">
              There are no audio files in the repo. Every sound — the soft chime
              when you add a card, the descending thud and crumple when you
              remove one, the whoosh when an actor card flips — is generated in
              the browser at runtime via Web Audio. Sine waves, triangle waves,
              exponential gain ramps, short bursts of white noise shaped by
              hand.
            </p>
            <p>
              I went this route to control the sound itself. Frequency,
              envelope, noise content — all numbers I could tune like a button
              radius. No asset pipeline, no licensing, and a tiny, custom sonic
              identity that I could iterate on alongside the visual reveals.
            </p>
          </TwoCol.Left>
        </TwoCol>
      </FadeIn>

      {/* Craft */}
      <FadeIn as="section" className="scroll-mt-24 pt-32">
        <TwoCol>
          <TwoCol.Left>
            <SectionHeading id="craft">
              The hard part: humane difficulty
            </SectionHeading>
            <p className="mb-5">
              The architecture is the easy part. The craft was in making it{" "}
              <em>feel good</em>.
            </p>
            <p className="mb-5">
              Early prototypes were technically correct and emotionally
              exhausting. Queries were slow, the reveal felt sluggish, the snap
              was off, and even the most cinephile friends I tested with hit
              pairs they couldn&rsquo;t connect — the kind of moment that ends a
              game session for good.
            </p>
            <p>
              Most of the work after the first working build went into tuning
              the parts that don&rsquo;t show up in a code diff: snap timing,
              reveal pacing, sonic feedback, and difficulty thresholds set just
              past &ldquo;challenging&rdquo; but a long way short of
              &ldquo;rage-quit.&rdquo; It plays well in the wild now, with the
              same friends who inspired it.
            </p>
          </TwoCol.Left>
        </TwoCol>
      </FadeIn>

      <NextProject
        title="Pajamagrams"
        subtitle="A mobile-first puzzle gift inspired by Bananagrams."
        href="/play/pajamagrams"
      />
    </CaseStudyShell>
  );
}

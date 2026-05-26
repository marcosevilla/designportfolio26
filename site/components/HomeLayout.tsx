"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Hero from "./Hero";
import LoadingOverlay from "./LoadingOverlay";
import Playground from "./Playground";
import AskMeAnythingButton from "./AskMeAnythingButton";
import SocialLinks from "./SocialLinks";

const BLUR_EASE = [0.22, 1, 0.36, 1] as const;

export default function HomeLayout({
  work,
}: {
  work: React.ReactNode;
}) {
  const [aboutMeOpen, setAboutMeOpen] = useState(false);
  // Gates Hero's blur-in animation. Flipped to true either when the
  // LoadingOverlay starts fading (first-time visit) or immediately when
  // the overlay is skipped (repeat visit).
  const [heroReady, setHeroReady] = useState(false);
  // While true, the LoadingOverlay owns `layoutId="hero-star"`. The
  // wordmark's PlaygroundStar reserves the slot but doesn't render the
  // glyph, so when the loader releases the layoutId framer-motion has
  // exactly one destination element to morph into.
  const [loaderOwnsStar, setLoaderOwnsStar] = useState(true);
  const wordmarkElRef = useRef<HTMLDivElement | null>(null);
  const aboutMeHeaderElRef = useRef<HTMLHeadingElement | null>(null);

  // Consume `?about=1` whenever it appears in the URL — chat-bar
  // [About me](about) links route here via router.push, so we have to
  // observe the search params (not just read window.location once on
  // mount) for soft navigations to take effect.
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams?.get("about") === "1") {
      setAboutMeOpen(true);
      // Clean the URL so refreshing doesn't re-trigger.
      if (typeof window !== "undefined") {
        const next = window.location.pathname;
        window.history.replaceState(null, "", next);
      }
    }
  }, [searchParams]);

  // Callback refs Hero still consumes — kept as no-ops now that the
  // side-nav alignment logic is gone.
  const setWordmarkRef = useCallback((el: HTMLDivElement | null) => {
    wordmarkElRef.current = el;
  }, []);

  const setAboutMeHeaderRef = useCallback((el: HTMLHeadingElement | null) => {
    aboutMeHeaderElRef.current = el;
  }, []);

  // Reset scroll position when navigating between home and About-me so
  // each page starts at the top.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [aboutMeOpen]);

  // Wordmark click in SiteHeader dispatches `home:return` — close About
  // and scroll to the top, regardless of section state.
  useEffect(() => {
    const handler = () => {
      setAboutMeOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("home:return", handler);
    return () => window.removeEventListener("home:return", handler);
  }, []);


  return (
    <>
    <LoadingOverlay
      onFade={() => {
        // First-time visitors: the loader has released the star and is
        // beginning its bg fade-out. Flip heroReady here so the cascade
        // is guaranteed to play even if the layoutId morph callback
        // never fires (reduced-motion, no layout delta, etc).
        setHeroReady(true);
      }}
      onDone={() => {
        // Repeat visitors skip the loader entirely, so there's no morph
        // to wait for — flip ready immediately so Hero can blur in.
        setHeroReady(true);
        setLoaderOwnsStar(false);
      }}
      onStarReleased={() => setLoaderOwnsStar(false)}
    />
    <div id="home">
      {/* Toolbar + wordmark now live in the global SiteHeader (top-left
          name, top-right controls) — mounted in app/layout.tsx so they
          appear on every route, including this one. */}

      {/* Section nav is no longer always-visible. It now lives behind
          the hamburger button in SiteHeader, revealed via NavOverlay. */}

      {/* Single centered column layout. At xl+ the wrapper escapes
          <main>'s 960px constraint so the column can sit at 800px
          centered in the viewport. About mode reverts to a single
          650px column for the bio read.
          paddingTop = SiteHeader height (~38) + breathing room. */}
      <div
        className={
          aboutMeOpen
            ? "max-w-[650px] mx-auto px-4 sm:px-8 flex flex-col"
            : "max-w-[1400px] mx-auto px-4 sm:px-8 " +
              "xl:block xl:max-w-none xl:w-screen " +
              "xl:mx-[calc(50%-50vw)] xl:px-0"
        }
        style={{
          paddingTop: "clamp(96px, 12vh, 144px)",
        }}
      >
        {aboutMeOpen && (
          <div>
            <Hero
              aboutMeOpen={aboutMeOpen}
              onAboutMeChange={setAboutMeOpen}
              wordmarkRef={setWordmarkRef}
              aboutMeHeaderRef={setAboutMeHeaderRef}
              ready={heroReady}
              hideStarForLoader={loaderOwnsStar}
              onStarMorphComplete={() => setHeroReady(true)}
            />
          </div>
        )}

        {/* Right column — only renders in home mode.
            At xl+ this column centers in the viewport at max-w 1000px,
            independent of the fixed left nav. At lg it inherits its
            slot from the parent grid. */}
        {!aboutMeOpen && (
          <div className="flex flex-col max-w-[800px] mx-auto w-full xl:px-4">
            {/* Page heading — Marco's name as the bio block's opening
                title. Larger than the body to read as a primary heading,
                kept tight on tracking so it still feels close to the
                wordmark family. */}
            <motion.h1
              className="mb-2"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                color: "var(--color-fg)",
              }}
              initial={{ opacity: 0, filter: "blur(12px)" }}
              animate={{
                opacity: heroReady ? 1 : 0,
                filter: heroReady ? "blur(0px)" : "blur(12px)",
              }}
              transition={{ duration: 0.9, ease: BLUR_EASE, delay: 0.1 }}
            >
              Marco Sevilla
            </motion.h1>

            {/* Tagline — same size as bio body, secondary color, sits on
                its own line right below the heading. Extracted from the
                original first sentence so the main bio focuses on what
                drives the work rather than the location lead-in. */}
            <motion.p
              className="text-(--color-fg-secondary) leading-[26px] mb-6"
              style={{ fontSize: "calc(14px + var(--font-size-offset))" }}
              initial={{ opacity: 0, filter: "blur(12px)" }}
              animate={{
                opacity: heroReady ? 1 : 0,
                filter: heroReady ? "blur(0px)" : "blur(12px)",
              }}
              transition={{ duration: 0.9, ease: BLUR_EASE, delay: 0.15 }}
            >
              Senior product designer based in San Francisco.
            </motion.p>

            {/* Bio block — sits at the top of the right column, above the first
                project card. Multi-paragraph intro that doubles as a
                positioning statement for the work below. */}
            <motion.div
              className="text-(--color-fg) leading-[26px] mb-8 flex flex-col gap-4"
              style={{ fontSize: "calc(14px + var(--font-size-offset))" }}
              initial={{ opacity: 0, filter: "blur(12px)" }}
              animate={{
                opacity: heroReady ? 1 : 0,
                filter: heroReady ? "blur(0px)" : "blur(12px)",
              }}
              transition={{ duration: 0.9, ease: BLUR_EASE, delay: 0.2 }}
            >
              <p>
                Currently at Canary Technologies. I&apos;m fascinated by the
                interplay of human behavior, culture, and the tools we
                use that augment the way we work and create. Outside of
                work, you&apos;ll find me shooting concert photography,
                discussing music and movie, or exploring various other
                creative side projects.
              </p>
            </motion.div>

            {/* Action row. Ask-me-anything chat trigger flush-left, then
                a tighter cluster of outlined text-only social links to
                its right. The larger gap (gap-6) between the chat
                trigger and the social cluster keeps each as its own
                affordance group; gap-1.5 inside the social cluster
                tightens those into a single visual unit. */}
            <motion.div
              className="mb-24 flex flex-wrap items-center gap-6"
              initial={{ opacity: 0, filter: "blur(12px)" }}
              animate={{
                opacity: heroReady ? 1 : 0,
                filter: heroReady ? "blur(0px)" : "blur(12px)",
              }}
              transition={{ duration: 0.9, ease: BLUR_EASE, delay: 0.28 }}
            >
              <AskMeAnythingButton />
              <SocialLinks />
            </motion.div>

            <section id="projects" className="pt-0">
              {/* Work content participates in the cascade — last in the
                  chain so the eye lands on Hero first, then sweeps down. */}
              <motion.div
                initial={{ opacity: 0, filter: "blur(12px)" }}
                animate={{
                  opacity: heroReady ? 1 : 0,
                  filter: heroReady ? "blur(0px)" : "blur(12px)",
                }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.32 }}
              >
                {work}
              </motion.div>
            </section>
            <section id="playground" className="pt-48 pb-48">
              {/* Mirrors the Work section's cascade so Playground blurs in
                  alongside the rest of the page once the loader releases. */}
              <motion.div
                initial={{ opacity: 0, filter: "blur(12px)" }}
                animate={{
                  opacity: heroReady ? 1 : 0,
                  filter: heroReady ? "blur(0px)" : "blur(12px)",
                }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              >
                <Playground />
              </motion.div>
            </section>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

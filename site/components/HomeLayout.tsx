"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Hero from "./Hero";
import HomeNav from "./HomeNav";
import HeroToolbar from "./HeroToolbar";
import LedMatrix from "./LedMatrix";
import LedMatrixUI from "./music/LedMatrixUI";
import LoadingOverlay from "./LoadingOverlay";
import Playground from "./Playground";

const BLUR_EASE = [0.22, 1, 0.36, 1] as const;

/* The page-level visualizer. Single instance — the previous sticky-toolbar
   variant rendered a second LED inside its chrome; that variant is gone. */
function MatrixArea() {
  return (
    <div className="relative">
      <LedMatrix />
      <LedMatrixUI />
    </div>
  );
}

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
  const navRef = useRef<HTMLElement>(null);
  const aboutMeOpenRef = useRef(aboutMeOpen);
  // Keep a ref-mirror of state so the callback ref handlers can read the
  // latest value without being recreated on every render.
  useEffect(() => {
    aboutMeOpenRef.current = aboutMeOpen;
  }, [aboutMeOpen]);

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

  // Update the side-nav's top to align with the current visual anchor —
  // the wordmark on the home page, or the "About me" h1 when the About-me
  // page is open. Stable so callback refs can call it on element changes.
  const updateNavTop = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const target = aboutMeOpenRef.current
      ? aboutMeHeaderElRef.current
      : wordmarkElRef.current;
    if (!target || !document.body.contains(target)) return;
    const top = target.getBoundingClientRect().top + window.scrollY;
    nav.style.top = `${top}px`;
    nav.style.transform = "none";
  }, []);

  // Callback refs for nav anchors — fire on mount/unmount so we can
  // re-align the nav when AnimatePresence swaps the page.
  const setWordmarkRef = useCallback((el: HTMLDivElement | null) => {
    wordmarkElRef.current = el;
    updateNavTop();
  }, [updateNavTop]);

  const setAboutMeHeaderRef = useCallback((el: HTMLHeadingElement | null) => {
    aboutMeHeaderElRef.current = el;
    updateNavTop();
  }, [updateNavTop]);

  // Re-align nav when state flips (catches the "about-me header about to
  // mount" case where the callback ref hasn't fired yet).
  useLayoutEffect(() => {
    updateNavTop();
  }, [aboutMeOpen, updateNavTop]);

  // Resize / font-load triggers.
  useLayoutEffect(() => {
    const ro = new ResizeObserver(updateNavTop);
    if (wordmarkElRef.current) ro.observe(wordmarkElRef.current);
    if (aboutMeHeaderElRef.current) ro.observe(aboutMeHeaderElRef.current);
    ro.observe(document.body);
    window.addEventListener("resize", updateNavTop);
    if (typeof document !== "undefined" && (document as Document & { fonts?: FontFaceSet }).fonts) {
      (document as Document & { fonts: FontFaceSet }).fonts.ready.then(updateNavTop).catch(() => {});
    }
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateNavTop);
    };
  }, [updateNavTop, aboutMeOpen]);

  // Reset scroll position when navigating between home and About-me so
  // each page starts at the top, and so HeroToolbar's intersection-based
  // sticky variant doesn't latch active because of leftover scroll.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [aboutMeOpen]);


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
      <HomeNav
        navRef={navRef}
        aboutMeOpen={aboutMeOpen}
        onAboutMeClose={() => setAboutMeOpen(false)}
        ready={heroReady}
      />
      {/* Hero toolbar — system chrome pinned to top:0 of the viewport.
          Spans full window width, frosted background, ~36px tall. CSS
          owns position. Body content scrolls under it; bio column below
          gets enough top padding so the wordmark sits comfortably under
          the toolbar. */}
      <motion.div
        className="hero-toolbar-host"
        initial={{ opacity: 0, filter: "blur(12px)" }}
        animate={{
          opacity: heroReady ? 1 : 0,
          filter: heroReady ? "blur(0px)" : "blur(12px)",
        }}
        transition={{ duration: 0.9, ease: BLUR_EASE, delay: 0.08 }}
      >
        <HeroToolbar />
      </motion.div>

      {/* Hero column: paddingTop = toolbar height (36) + breathing room. */}
      <div
        className="max-w-[650px] mx-auto px-4 sm:px-8 flex flex-col"
        style={{
          paddingTop: "clamp(96px, 12vh, 144px)",
          minHeight: "clamp(560px, 78vh, 880px)",
        }}
      >
        <Hero
          matrix={<MatrixArea />}
          aboutMeOpen={aboutMeOpen}
          onAboutMeChange={setAboutMeOpen}
          wordmarkRef={setWordmarkRef}
          aboutMeHeaderRef={setAboutMeHeaderRef}
          ready={heroReady}
          hideStarForLoader={loaderOwnsStar}
          onStarMorphComplete={() => setHeroReady(true)}
        />
      </div>
      <section
        id="projects"
        className="max-w-[650px] mx-auto px-4 sm:px-8 min-h-screen pt-32"
        style={aboutMeOpen ? { display: "none" } : undefined}
      >
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
      <section
        id="playground"
        className="max-w-[650px] mx-auto px-4 sm:px-8 min-h-screen pt-32 pb-48"
        style={aboutMeOpen ? { display: "none" } : undefined}
      >
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
    </>
  );
}

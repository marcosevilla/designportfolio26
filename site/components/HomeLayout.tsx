"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Hero from "./Hero";
import HomeNav from "./HomeNav";
import LedMatrix from "./LedMatrix";
import LedMatrixUI from "./music/LedMatrixUI";
import LoadingOverlay from "./LoadingOverlay";
import { StickyToolbarContext } from "@/lib/StickyToolbarContext";

function MatrixArea({ sentinelRef }: { sentinelRef: React.Ref<HTMLDivElement> }) {
  return (
    <div>
      <div className="relative">
        <LedMatrix />
        <LedMatrixUI />
      </div>
      {/* Sentinel placed directly below the matrix; once it scrolls out of
          view the floating sticky toolbar variant is allowed to appear, so
          the page never shows two visualizers at once. */}
      <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />
    </div>
  );
}

export default function HomeLayout({
  work,
}: {
  work: React.ReactNode;
}) {
  const [aboutMeOpen, setAboutMeOpen] = useState(false);
  const [pastMatrix, setPastMatrix] = useState(false);
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
  const matrixSentinelElRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const aboutMeOpenRef = useRef(aboutMeOpen);
  // Keep a ref-mirror of state so the callback ref handlers can read the
  // latest value without being recreated on every render.
  useEffect(() => {
    aboutMeOpenRef.current = aboutMeOpen;
  }, [aboutMeOpen]);

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

  // Sticky-toolbar gate: tracks whether the LED matrix has scrolled out
  // of view. Stable so the callback ref can re-attach the IO when the
  // matrix sentinel remounts after AnimatePresence transitions.
  const setMatrixSentinelRef = useCallback((el: HTMLDivElement | null) => {
    matrixSentinelElRef.current = el;
    if (!el) {
      // Sentinel detached — reset gate so the sticky toolbar doesn't
      // leak across navigations.
      setPastMatrix(false);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => setPastMatrix(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px" }
    );
    obs.observe(el);
    // Disconnect when the element changes again.
    const cleanup = () => obs.disconnect();
    (el as unknown as { __cleanup?: () => void }).__cleanup = cleanup;
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
    <StickyToolbarContext.Provider value={pastMatrix}>
    <LoadingOverlay
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
      {/* Hero column: small top inset, height capped so the next section
          peeks from the bottom of the viewport. clamp() keeps the peek
          consistent across short and tall viewports. */}
      <div
        className="max-w-[650px] mx-auto px-4 sm:px-8 flex flex-col"
        style={{
          paddingTop: "clamp(48px, 6vh, 96px)",
          minHeight: "clamp(560px, 78vh, 880px)",
        }}
      >
        <Hero
          matrix={<MatrixArea sentinelRef={setMatrixSentinelRef} />}
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
        className="max-w-[650px] mx-auto px-4 sm:px-8 min-h-screen pt-12 lg:pt-12"
        style={aboutMeOpen ? { display: "none" } : undefined}
      >
        {/* Placeholder for now — anchor target for the Playground nav item. */}
      </section>
    </div>
    </StickyToolbarContext.Provider>
  );
}

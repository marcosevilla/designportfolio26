"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Hero from "./Hero";
import HomeNav from "./HomeNav";
import MobileSectionNav from "./MobileSectionNav";
import LoadingOverlay from "./LoadingOverlay";
import Playground from "./Playground";

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
      {/* Toolbar + wordmark now live in the global SiteHeader (top-left
          name, top-right controls) — mounted in app/layout.tsx so they
          appear on every route, including this one. */}

      {/* Mobile-only bottom section nav. Hidden at lg+ where the desktop
          HomeNav in the left column takes over. */}
      <MobileSectionNav
        aboutMeOpen={aboutMeOpen}
        onAboutMeOpen={() => setAboutMeOpen(true)}
        onAboutMeClose={() => setAboutMeOpen(false)}
      />

      {/* Two-column home layout.
          - <lg: stacked.
          - lg (1024-1279): two-col grid where the left col pushes the
            right col rightward (today's behavior).
          - xl+ (1280+): the wrapper breaks out of <main>'s 960px width
            so the right column can center in the viewport at max-w 1000px,
            and the left nav becomes position:fixed flush-left of the
            viewport.
          About mode reverts to a single 650px column so the bio reads
          full-width.
          paddingTop = SiteHeader height (~38) + breathing room. */}
      <div
        className={
          aboutMeOpen
            ? "max-w-[650px] mx-auto px-4 sm:px-8 flex flex-col"
            : "max-w-[1400px] mx-auto px-4 sm:px-8 " +
              "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:gap-x-16 " +
              // Escape <main>'s 960px constraint at xl+ via a margin-only
              // trick (no `transform`). A transformed ancestor would
              // become the containing block for any fixed-position
              // descendants — which would re-anchor the fixed nav to the
              // scrolling wrapper and break sticky behavior.
              "xl:block xl:max-w-none xl:w-screen " +
              "xl:mx-[calc(50%-50vw)] xl:px-0"
        }
        style={{
          paddingTop: "clamp(96px, 12vh, 144px)",
        }}
      >
        <div
          className={
            aboutMeOpen
              ? ""
              : "lg:sticky lg:top-32 lg:self-start " +
                // At xl+ the nav is fixed-position flush-left of the
                // viewport (no longer in the grid flow). Top matches
                // the wrapper's paddingTop so the nav's first link
                // top-aligns with the bio's first text line.
                "xl:fixed xl:top-[clamp(96px,12vh,144px)] xl:left-6 " +
                "xl:self-auto xl:z-[40]"
          }
        >
          {/* About mode renders the full Hero (back button + about copy +
              resume button + LED matrix). Home mode skips Hero entirely —
              the wordmark moved to the right column header row. */}
          {aboutMeOpen && (
            <Hero
              aboutMeOpen={aboutMeOpen}
              onAboutMeChange={setAboutMeOpen}
              wordmarkRef={setWordmarkRef}
              aboutMeHeaderRef={setAboutMeHeaderRef}
              ready={heroReady}
              hideStarForLoader={loaderOwnsStar}
              onStarMorphComplete={() => setHeroReady(true)}
            />
          )}
          {/* Primary section nav lives in the left sticky column on home.
              Hidden in About mode — the back-button inside the About view
              owns the navigation there. */}
          {!aboutMeOpen && (
            <HomeNav
              navRef={navRef}
              aboutMeOpen={aboutMeOpen}
              onAboutMeOpen={() => setAboutMeOpen(true)}
              onAboutMeClose={() => setAboutMeOpen(false)}
              ready={heroReady}
            />
          )}
        </div>

        {/* Right column — only renders in home mode.
            At xl+ this column centers in the viewport at max-w 1000px,
            independent of the fixed left nav. At lg it inherits its
            slot from the parent grid. */}
        {!aboutMeOpen && (
          <div className="flex flex-col xl:max-w-[800px] xl:mx-auto xl:px-4 xl:w-full">
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
                Senior product designer based in San Francisco. Currently
                at Canary Technologies. I&apos;m fascinated by the
                interplay of human behavior, culture, and the tools we
                use that augment the way we work and create.
              </p>
              <p>
                Outside of work, you&apos;ll find me shooting concert
                photography, discussing music and movie, or exploring
                various other creative side projects.
              </p>
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
            <section id="playground" className="pt-32 pb-48">
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

"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Hero from "./Hero";
import LoadingOverlay from "./LoadingOverlay";
import { BackgroundTexture } from "./BackgroundTexture";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Grid, { Col } from "@/components/layout/Grid";
import { RESUME_URL } from "@/lib/resume-content";

const BLUR_EASE = [0.22, 1, 0.36, 1] as const;

const BASKERVILLE = "var(--font-geist-sans), system-ui, sans-serif";

/** Emphasis for inline links and key phrases inside body text — Geist
 *  at body weight, upright (fontStyle normal also cancels the browser's
 *  default italic on the <em> branch). Links wear the theme's accent via
 *  .dotted-link--inline: dotted underline at rest, dashed accent
 *  underline draws in on hover. Plain emphasis stays fg-ink, no
 *  underline. */
function Em({ href, children }: { href?: string; children: React.ReactNode }) {
  const base: React.CSSProperties = {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    fontStyle: "normal",
    fontWeight: 400,
  };
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="dotted-link--inline"
        style={base}
      >
        {children}
      </a>
    );
  }
  return <em style={{ ...base, color: "var(--color-fg)" }}>{children}</em>;
}

/** Isolates useSearchParams in a null-rendering leaf with its own Suspense
 *  boundary (see render below) so the hook's client-side deopt doesn't
 *  swallow the whole homepage — with it inline, `/` prerendered as an empty
 *  shell. Chat-bar [About me](about) links route here via router.push, so we
 *  have to observe the params reactively, not read window.location once. */
function AboutParamWatcher({ onAbout }: { onAbout: () => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams?.get("about") === "1") {
      onAbout();
      // Clean the URL so refreshing doesn't re-trigger.
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams, onAbout]);
  return null;
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

  const openAbout = useCallback(() => setAboutMeOpen(true), []);

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
    <Suspense fallback={null}>
      <AboutParamWatcher onAbout={openAbout} />
    </Suspense>
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
    <BackgroundTexture />
    <div id="home">
      {/* Toolbar + wordmark now live in the global SiteHeader (top-left
          name, top-right controls) — mounted in app/layout.tsx so they
          appear on every route, including this one. */}

      {/* Section nav is no longer always-visible. It now lives behind
          the hamburger button in SiteHeader, revealed via NavOverlay. */}

      {/* Single centered column layout. Home is a 600px column (see
          inner wrapper); About mode is a 650px column for the bio read.
          paddingTop = SiteHeader height (~38) + breathing room. */}
      <div
        className={
          aboutMeOpen
            ? "max-w-[650px] mx-auto px-4 sm:px-8 flex flex-col"
            : "mx-auto"
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

        {/* Home content — editorial grid canvas. Intro sits on the
            intro-rail preset (bio cols 1–7, contact rail 9–12); the
            Select work section spans the canvas and lays its cells on
            the same 12-col grid. See docs/LAYOUT-REFERENCE.html */}
        {!aboutMeOpen && (
          <div className="max-w-(--grid-max) mx-auto w-full px-4 sm:px-8 pb-48">
            <Grid preset="intro-rail" className="mt-8">
            <Col>
            <div className="flex flex-col gap-6">
              {/* Page heading — body-size, bold; reads as a label above
                  the bio rather than a display heading. */}
              <motion.h1
                style={{
                  fontFamily: BASKERVILLE,
                  fontSize: "calc(16px + var(--font-size-offset))",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  lineHeight: "24px",
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

              {/* Intro bio — body text; opens with the role/location line
                  (formerly the standalone tagline). (CyclingGreeting is
                  parked in components/CyclingGreeting.tsx.) */}
              <motion.div
                className="flex flex-col gap-8"
                style={{
                  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                  // Site-wide body standard: 14/22.4 (matches typescale.body
                  // and the globals.css body default).
                  fontSize: "calc(14px + var(--font-size-offset))",
                  lineHeight: "22.4px",
                  letterSpacing: "-0.02em",
                  // Body reads secondary; Em emphasis + titles keep
                  // primary ink.
                  color: "var(--color-fg-secondary)",
                }}
                initial={{ opacity: 0, filter: "blur(12px)" }}
                animate={{
                  opacity: heroReady ? 1 : 0,
                  filter: heroReady ? "blur(0px)" : "blur(12px)",
                }}
                transition={{ duration: 0.9, ease: BLUR_EASE, delay: 0.15 }}
              >
                <p>
                  Product Designer based in San Francisco, California.
                  Currently at{" "}
                  <Em href="https://www.canarytechnologies.com/">
                    Canary Technologies
                  </Em>
                  , building software for the{" "}
                  <TooltipProvider delay={100}>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <a
                            href="https://www.canarytechnologies.com/hotel-groups"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="dotted-link--inline"
                            style={{
                              fontFamily:
                                "var(--font-geist-sans), system-ui, sans-serif",
                              fontStyle: "normal",
                              fontWeight: 400,
                            }}
                          />
                        }
                      >
                        world&apos;s largest enterprises in hospitality
                      </TooltipTrigger>
                      <TooltipContent
                        sideOffset={8}
                        className="block max-w-[340px] px-4 py-3 text-left text-sm leading-relaxed"
                      >
                        Our enterprise customers include Marriott, Wyndham, and
                        IHG. I&apos;ve led design for several 0→1 products
                        along the way. These include a guest experience
                        platform, a hotel CMS, mobile food and beverage
                        ordering, and the knowledge base that powers our
                        AI-native products.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  .
                </p>
                <p>
                  In the past, I built scalable brand systems as a marketing
                  designer at <Em href="https://www.vivino.com/">Vivino</Em>{" "}
                  and <Em href="https://www.vyond.com/">Vyond</Em>, and founded
                  product design at{" "}
                  <Em href="https://www.generaltask.com/">General Task</Em>,
                  where we built productivity tooling for knowledge workers.
                </p>
                <p>
                  I&apos;m an AI-native designer driven by curiosity, quality
                  craft, and (of course) caffeine. Outside of work,
                  you&apos;ll find me{" "}
                  <Em href="https://www.marcosevilla.photo">
                    dabbling in music photography
                  </Em>
                  , developing websites, or tinkering on various design
                  side projects.
                </p>

                {/* Contact links — same dotted-underline treatment as the
                    inline bio links; email opens in the same tab (mailto). */}
                <div className="flex items-center gap-5">
                  <a
                    href={RESUME_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dotted-link--inline"
                    style={{ fontStyle: "normal", fontWeight: 400 }}
                  >
                    Resume
                  </a>
                  <a
                    href="https://www.linkedin.com/in/marcogsevilla/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dotted-link--inline"
                    style={{ fontStyle: "normal", fontWeight: 400 }}
                  >
                    LinkedIn
                  </a>
                  <a
                    href="mailto:marcogsevilla@gmail.com"
                    className="dotted-link--inline"
                    style={{ fontStyle: "normal", fontWeight: 400 }}
                  >
                    Email
                  </a>
                </div>
              </motion.div>

            </div>
            </Col>
            {/* Contact rail removed 2026-07-15 — View resume + socials
                moved to SiteHeader's left cluster; Ask me anything is the
                floating ChatFab beside the music dock. */}
            </Grid>

            {/* Select work — full canvas; ProjectGrid places cells on
                the shared 12-col grid (featured first cell, 2-up after). */}
            <section id="projects" className="mt-[100px]">
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
          </div>
        )}
      </div>
    </div>
    </>
  );
}

"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Hero from "./Hero";
import LoadingOverlay from "./LoadingOverlay";
import AskMeAnythingButton from "./AskMeAnythingButton";
import SocialLinks from "./SocialLinks";
import TextureDivider from "./TextureDivider";
import { RESUME_URL } from "@/lib/resume-content";

const BLUR_EASE = [0.22, 1, 0.36, 1] as const;

const BASKERVILLE = "var(--font-baskerville), Georgia, serif";

/** Decorative serif emphasis — Libre Baskerville italic, used for
 *  inline links and emphasized phrases inside body text. Renders an
 *  <a> when href is provided, plain <em> otherwise. */
function Em({ href, children }: { href?: string; children: React.ReactNode }) {
  const style: React.CSSProperties = {
    fontFamily: BASKERVILLE,
    fontStyle: "italic",
    fontWeight: 400,
    color: "var(--color-fg)",
    textDecoration: "none",
  };
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={style}>
        {children}
      </a>
    );
  }
  return <em style={style}>{children}</em>;
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

        {/* Home content — 2026-07 single-page redesign. One centered
            600px column: intro bio with contact row, then the one-column
            Select work list. Everything lives on the home page now. */}
        {!aboutMeOpen && (
          <div className="max-w-[600px] mx-auto w-full px-4 sm:px-8 pb-48">
            <div className="mt-8 flex flex-col gap-6">
              {/* Page heading — Libre Baskerville, the site's new serif. */}
              <motion.h1
                style={{
                  fontFamily: BASKERVILLE,
                  fontSize: 32,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  lineHeight: 1.2,
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

              {/* Tagline — serif italic, full-ink. */}
              <motion.p
                style={{
                  fontFamily: BASKERVILLE,
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: 18,
                  lineHeight: "26px",
                  letterSpacing: "0.02em",
                  color: "var(--color-fg)",
                }}
                initial={{ opacity: 0, filter: "blur(12px)" }}
                animate={{
                  opacity: heroReady ? 1 : 0,
                  filter: heroReady ? "blur(0px)" : "blur(12px)",
                }}
                transition={{ duration: 0.9, ease: BLUR_EASE, delay: 0.15 }}
              >
                Product Designer based in San Francisco, California
              </motion.p>

              <motion.div
                initial={{ opacity: 0, filter: "blur(12px)" }}
                animate={{
                  opacity: heroReady ? 1 : 0,
                  filter: heroReady ? "blur(0px)" : "blur(12px)",
                }}
                transition={{ duration: 0.9, ease: BLUR_EASE, delay: 0.18 }}
              >
                <TextureDivider />
              </motion.div>

              {/* Intro bio — 16px/2 body with Baskerville-italic emphasis
                  for links and key phrases. */}
              <motion.div
                className="flex flex-col gap-8"
                style={{
                  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                  fontSize: "calc(16px + var(--font-size-offset))",
                  lineHeight: 2,
                  letterSpacing: "-0.02em",
                  color: "var(--color-fg)",
                }}
                initial={{ opacity: 0, filter: "blur(12px)" }}
                animate={{
                  opacity: heroReady ? 1 : 0,
                  filter: heroReady ? "blur(0px)" : "blur(12px)",
                }}
                transition={{ duration: 0.9, ease: BLUR_EASE, delay: 0.2 }}
              >
                <p>
                  I&apos;m an AI-native designer driven by curiosity, quality
                  craft, and caffeine. My goal is to produce work that expands
                  the ways humans work and create.
                </p>
                <p>
                  Currently, I&apos;m at{" "}
                  <Em href="https://www.canarytechnologies.com/">
                    Canary Technologies
                  </Em>
                  , exploring how agentic workflows can help hotel operators at
                  the <Em>world&apos;s largest hospitality enterprises –</Em>{" "}
                  Marriott, Wyndham, and IHG. I&apos;ve led design for several
                  0-1 products: a guest experience platform, a hotel CMS,
                  mobile food and beverage ordering, and the knowledge base
                  that powers our AI-native products.
                </p>
                <p>
                  Seven years in, I&apos;m a design generalist who thrives in
                  startups. My work ranges from building scalable brand systems
                  as a marketing designer at{" "}
                  <Em href="https://www.vivino.com/">Vivino</Em> and{" "}
                  <Em href="https://www.vyond.com/">Vyond</Em>, to founding
                  product design at{" "}
                  <Em href="https://www.generaltask.com/">General Task</Em>,
                  where we built productivity tooling for knowledge workers.
                </p>
                <p>
                  Outside of work, you&apos;ll find me{" "}
                  <Em>dabbling in music photography,</Em> developing websites,
                  or tinkering on various design sidequests.
                </p>
              </motion.div>

              {/* Contact row — social icons flush-left; View resume +
                  Ask me anything outlined CTAs flush-right. */}
              <motion.div
                className="flex flex-wrap items-center justify-between gap-4"
                initial={{ opacity: 0, filter: "blur(12px)" }}
                animate={{
                  opacity: heroReady ? 1 : 0,
                  filter: heroReady ? "blur(0px)" : "blur(12px)",
                }}
                transition={{ duration: 0.9, ease: BLUR_EASE, delay: 0.24 }}
              >
                <SocialLinks />
                <div className="flex items-center gap-3">
                  <a
                    href={RESUME_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="outlined-cta inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
                    style={{
                      height: 32,
                      padding: "0 8px",
                      fontFamily:
                        "var(--font-geist-mono), ui-monospace, Menlo, monospace",
                      fontSize: 11,
                      fontWeight: 500,
                      lineHeight: 1,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    View resume
                  </a>
                  <AskMeAnythingButton />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, filter: "blur(12px)" }}
                animate={{
                  opacity: heroReady ? 1 : 0,
                  filter: heroReady ? "blur(0px)" : "blur(12px)",
                }}
                transition={{ duration: 0.9, ease: BLUR_EASE, delay: 0.26 }}
              >
                <TextureDivider />
              </motion.div>
            </div>

            {/* Select work — one column, same 600px width. */}
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

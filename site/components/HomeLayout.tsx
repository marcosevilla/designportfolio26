"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Hero from "./Hero";
import HomeNav from "./HomeNav";
import LedMatrix from "./LedMatrix";
import LedMatrixUI from "./music/LedMatrixUI";

function MatrixArea() {
  return (
    <div>
      <div className="relative">
        <LedMatrix />
        <LedMatrixUI />
      </div>
    </div>
  );
}

export default function HomeLayout({
  work,
}: {
  work: React.ReactNode;
}) {
  const [aboutMeOpen, setAboutMeOpen] = useState(false);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Pin the side nav's top to the wordmark's top so they share the same
  // baseline on first load. Re-measures on resize, font load, and content
  // height changes (toolbar reveal, About me carousel, etc.).
  useLayoutEffect(() => {
    const wm = wordmarkRef.current;
    const nav = navRef.current;
    if (!wm || !nav) return;

    const update = () => {
      const top = wm.getBoundingClientRect().top + window.scrollY;
      nav.style.top = `${top}px`;
      nav.style.transform = "none";
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(wm);
    ro.observe(document.body);
    window.addEventListener("resize", update);
    if (typeof document !== "undefined" && (document as Document & { fonts?: FontFaceSet }).fonts) {
      (document as Document & { fonts: FontFaceSet }).fonts.ready.then(update).catch(() => {});
    }
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);


  return (
    <div id="home">
      <HomeNav
        navRef={navRef}
        aboutMeOpen={aboutMeOpen}
        onAboutMeClose={() => setAboutMeOpen(false)}
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
          matrix={<MatrixArea />}
          aboutMeOpen={aboutMeOpen}
          onAboutMeChange={setAboutMeOpen}
          wordmarkRef={wordmarkRef}
        />
      </div>
      <section
        id="projects"
        className="max-w-[650px] mx-auto px-4 sm:px-8 min-h-screen pt-12 lg:pt-12"
        style={aboutMeOpen ? { display: "none" } : undefined}
      >
        {work}
      </section>
      <section
        id="playground"
        className="max-w-[650px] mx-auto px-4 sm:px-8 min-h-screen pt-12 lg:pt-12"
        style={aboutMeOpen ? { display: "none" } : undefined}
      >
        {/* Placeholder for now — anchor target for the Playground nav item. */}
      </section>
    </div>
  );
}

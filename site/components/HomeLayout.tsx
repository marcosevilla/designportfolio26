"use client";

import { useEffect, useRef } from "react";
import Hero from "./Hero";
import BackgroundTexture from "./BackgroundTexture";
import { setActivePanel } from "./SectionSnapContext";

export default function HomeLayout({
  work,
  marquee,
}: {
  work: React.ReactNode;
  marquee: React.ReactNode;
}) {
  const workRef = useRef<HTMLDivElement>(null);

  // Drive sidebar nav state via IntersectionObserver
  useEffect(() => {
    const el = workRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setActivePanel(entry.isIntersecting ? "work" : "bio");
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <BackgroundTexture />
      <section>
        <Hero />
      </section>
      <section ref={workRef} className="mt-28">
        {work}
      </section>
      {marquee}
    </>
  );
}

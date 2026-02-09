"use client";

import { useEffect, useRef } from "react";
import Hero from "./Hero";
import BackgroundTexture from "./BackgroundTexture";
import DesktopSidebar from "./DesktopSidebar";
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
    <div className="lg:flex lg:gap-10">
      <DesktopSidebar />
      <div className="flex-1 min-w-0">
        <BackgroundTexture />
        <section className="lg:-translate-x-[120px]">
          <Hero />
        </section>
        <section ref={workRef} className="mt-28 lg:-translate-x-[120px]">
          {work}
        </section>
        {marquee}
      </div>
    </div>
  );
}

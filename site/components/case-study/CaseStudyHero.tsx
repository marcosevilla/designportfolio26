"use client";

import { motion } from "framer-motion";
import { typescale } from "@/lib/typography";

interface CaseStudyHeroProps {
  title: string;
  subtitle: string;
  gradient: [string, string];
  heroImageDescription?: string;
}

export default function CaseStudyHero({
  title,
  subtitle,
  gradient,
  heroImageDescription,
}: CaseStudyHeroProps) {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div
        className="w-full pt-16 md:pt-24"
        style={{
          background: `linear-gradient(180deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
        }}
      >
        {/* Split layout: title left, subtitle right */}
        <div className="max-w-content-lg mx-auto px-6 sm:px-10">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 lg:gap-12 pb-12">
            <h1
              className="text-white tracking-tight max-w-[700px]"
              style={{ ...typescale.caseStudyHero, fontFamily: "var(--font-geist-pixel-square)", fontWeight: 700 }}
            >
              {title}
            </h1>
            <p className="text-white/80 max-w-[450px] lg:pt-2" style={typescale.subtitle}>
              {subtitle}
            </p>
          </div>
        </div>

        {/* Mockup placeholder at bottom of color block */}
        {heroImageDescription && (
          <div className="max-w-content-lg mx-auto px-6 sm:px-10">
            <div
              className="rounded-t-2xl bg-[var(--color-bg)] border border-b-0 border-black/10 overflow-hidden"
              style={{ aspectRatio: "16 / 9" }}
            >
              <div className="w-full h-full flex items-center justify-center px-6">
                <p className="text-sm text-[var(--color-fg-tertiary)] text-center">
                  {heroImageDescription}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
}

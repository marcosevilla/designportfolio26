"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EmailIcon, LinkedInIcon, XIcon } from "./Icons";

const EMAIL = "marcogsevilla@gmail.com";
const HOVER_SPRING = { type: "spring" as const, stiffness: 500, damping: 38 };

type LinkItem = {
  key: string;
  href: string;
  label: string;
  icon: (props: { size?: number }) => React.ReactElement;
  external?: boolean;
};

const LINKS: LinkItem[] = [
  { key: "x", href: "https://twitter.com/marcowitss", label: "X (@marcowitss)", icon: XIcon, external: true },
  { key: "linkedin", href: "https://www.linkedin.com/in/marcogsevilla/", label: "LinkedIn", icon: LinkedInIcon, external: true },
  { key: "email", href: `mailto:${EMAIL}`, label: `Email ${EMAIL}`, icon: EmailIcon },
];

/**
 * Bio "Let's connect" row. Each link is a 32×32 circular icon button styled
 * to match the toolbar's HeroActions row above — same sliding hover pill
 * (shared `layoutId`), same accent-tint color treatment.
 */
export default function ConnectLinks() {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  return (
    <div
      className="mt-6 flex items-center gap-1"
      onMouseLeave={() => setHoveredKey(null)}
    >
      {LINKS.map((l) => {
        const Icon = l.icon;
        const isHovered = hoveredKey === l.key;
        return (
          <a
            key={l.key}
            href={l.href}
            aria-label={l.label}
            onMouseEnter={() => setHoveredKey(l.key)}
            onFocus={() => setHoveredKey(l.key)}
            target={l.external ? "_blank" : undefined}
            rel={l.external ? "noopener noreferrer" : undefined}
            className="relative flex items-center justify-center w-8 h-8 rounded-full transition-colors text-(--color-fg-secondary) hover:text-(--color-accent) focus-visible:text-(--color-accent) focus:outline-none"
          >
            {isHovered && (
              <motion.span
                layoutId="connect-links-hover"
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 8%, transparent)" }}
                transition={HOVER_SPRING}
              />
            )}
            <span className="relative">
              <Icon size={16} />
            </span>
          </a>
        );
      })}
    </div>
  );
}

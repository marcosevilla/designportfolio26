"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const EMAIL = "marcogsevilla@gmail.com";

function LinkedInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5l8.5 6 8.5-6" />
    </svg>
  );
}

type SocialLink = {
  key: string;
  label: string;
  tooltip: string;
  href: string;
  external?: boolean;
  icon: React.ReactNode;
};

const LINKS: SocialLink[] = [
  {
    key: "linkedin",
    label: "LinkedIn",
    tooltip: "LinkedIn",
    href: "https://www.linkedin.com/in/marcogsevilla/",
    external: true,
    icon: <LinkedInIcon />,
  },
  {
    key: "email",
    label: "Email",
    tooltip: EMAIL,
    href: `mailto:${EMAIL}`,
    icon: <MailIcon />,
  },
];

/** Cluster of icon buttons (LinkedIn, Email) wrapped in shadcn tooltips.
 *  Lives in SiteHeader's left cluster beside the View resume CTA. */
export default function SocialLinks() {
  return (
    <TooltipProvider delay={100}>
      <div className="inline-flex items-center gap-1.5">
        {LINKS.map((l) => (
          <Tooltip key={l.key}>
            <TooltipTrigger
              render={
                <a
                  href={l.href}
                  target={l.external ? "_blank" : undefined}
                  rel={l.external ? "noopener noreferrer" : undefined}
                  aria-label={l.label}
                  className="bio-toolbar-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
                />
              }
            >
              {l.icon}
            </TooltipTrigger>
            <TooltipContent>{l.tooltip}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

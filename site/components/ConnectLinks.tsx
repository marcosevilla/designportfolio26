"use client";

import { EmailIcon, LinkedInIcon, XIcon } from "./Icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const EMAIL = "marcogsevilla@gmail.com";
const TWITTER_HANDLE = "@marcowitss";

type LinkItem = {
  key: string;
  href: string;
  label: string;
  tooltip: string;
  icon: (props: { size?: number }) => React.ReactElement;
  external?: boolean;
};

const LINKS: LinkItem[] = [
  {
    key: "x",
    href: "https://twitter.com/marcowitss",
    label: "X (Twitter)",
    tooltip: TWITTER_HANDLE,
    icon: XIcon,
    external: true,
  },
  {
    key: "linkedin",
    href: "https://www.linkedin.com/in/marcogsevilla/",
    label: "LinkedIn",
    tooltip: "LinkedIn",
    icon: LinkedInIcon,
    external: true,
  },
  {
    key: "email",
    href: `mailto:${EMAIL}`,
    label: "Email",
    tooltip: EMAIL,
    icon: EmailIcon,
  },
];

/**
 * "Let's connect" cluster — three icon buttons sharing the `.bio-toolbar-btn`
 * chrome with the rest of the site's icon-button family (header toolbar,
 * homepage social cluster). Tooltips surface the actual contact details
 * (X handle, email address) on hover.
 */
export default function ConnectLinks() {
  return (
    <TooltipProvider delay={100}>
      <div className="mt-6 flex items-center gap-1">
        {LINKS.map((l) => {
          const Icon = l.icon;
          return (
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
                <Icon size={16} />
              </TooltipTrigger>
              <TooltipContent>{l.tooltip}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

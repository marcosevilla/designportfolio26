"use client";

const EMAIL = "marcogsevilla@gmail.com";

const LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/marcogsevilla/", external: true },
  { label: "Twitter", href: "https://twitter.com/marcowitss", external: true },
  { label: "Email", href: `mailto:${EMAIL}` },
];

/** Outlined text-only social links. Mirrors AskMeAnythingButton's
 *  chrome (0.5px stroke, secondary text, 4px radius, hover lifts to
 *  accent) so the cluster reads as a coherent group of secondary CTAs. */
export default function SocialLinks() {
  return (
    <div className="inline-flex items-center gap-1.5">
      {LINKS.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target={l.external ? "_blank" : undefined}
          rel={l.external ? "noopener noreferrer" : undefined}
          className="inline-flex items-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) cursor-pointer hover:text-(--color-accent) hover:border-(--color-accent)"
          style={{
            height: 36,
            padding: "0 10px",
            background: "transparent",
            color: "var(--color-fg-secondary)",
            border: "0.5px solid var(--color-border)",
            borderRadius: 4,
            fontFamily:
              "var(--font-geist-mono), ui-monospace, Menlo, monospace",
            fontSize: 11,
            fontWeight: 500,
            lineHeight: 1,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}

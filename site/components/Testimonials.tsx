"use client";

import { useEffect, useId, useRef, useState } from "react";
import { TESTIMONIALS, type Testimonial } from "@/lib/testimonials";
import { BODY_LINE_HEIGHT, typescale } from "@/lib/typography";

/** Collapsed cards show this many lines of the quote. The recommendations
 *  range from ~55 to ~200 words, so without a clamp the block would run
 *  several screens; six lines is enough to carry a full thought and keeps
 *  every long card resting at an identical height. */
const COLLAPSED_LINES = 6;

/** Collapsed height, in `em`, so it resolves against the card's own
 *  font-size (`typescale.body` = calc(17px + --font-size-offset)) and
 *  stays exactly COLLAPSED_LINES lines at every slider setting.
 *
 *  This was a hard-coded `22.4` until 2026-08-05 — a leftover from the
 *  14/22.4 body era. Body moved to 17/28 on 2026-08-05 and this constant
 *  didn't, so the clamp was cutting at 134.4px ≈ 4.8 lines and clipping
 *  the sixth line through its middle. Derive from BODY_LINE_HEIGHT, never
 *  restate the number. */
const COLLAPSED_EM = COLLAPSED_LINES * BODY_LINE_HEIGHT;

/** Small mono meta chrome — matches the city labels in Hero's experience
 *  list and the marquee's COMPANY • YEAR row. */
const META: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
  fontSize: "11px",
  lineHeight: 1.4,
  letterSpacing: "0.02em",
  color: "var(--color-fg-tertiary)",
};

function TestimonialCard({ t }: { t: Testimonial }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const quoteRef = useRef<HTMLDivElement | null>(null);
  const quoteId = useId();

  // Whether a quote needs "Read more" can't be decided from word count at
  // authoring time: the Theme Palette's font-size offset (±4px) and the
  // column width both change how many lines the text wraps into. Measure
  // the clamped element instead, and re-measure whenever its box changes.
  useEffect(() => {
    const el = quoteRef.current;
    if (!el) return;

    // Only meaningful while collapsed — an expanded card has no clamp to
    // overflow, so we leave the last collapsed verdict standing and the
    // "Read less" affordance stays put.
    if (expanded) return;

    const measure = () => {
      if (!el.isConnected) return;
      setOverflows(el.scrollHeight - el.clientHeight > 1);
    };

    measure();

    // Geist's metrics differ from the fallback face, so the first
    // measurement can be off by a line until webfonts land.
    document.fonts?.ready.then(measure).catch(() => {});

    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, [expanded]);

  const lastIndex = t.paragraphs.length - 1;

  return (
    <div
      className="p-6"
      style={{
        border: "0.5px solid var(--color-border)",
        borderRadius: 4,
      }}
    >
      <div
        ref={quoteRef}
        id={quoteId}
        className="flex flex-col gap-4"
        style={{
          ...typescale.body,
          color: "var(--color-fg-secondary)",
          overflow: "hidden",
          maxHeight: expanded ? undefined : `${COLLAPSED_EM}em`,
          // Fade the clipped edge so a quote cut mid-sentence reads as
          // truncated rather than broken. This masks the TEXT, not the
          // backdrop, so it needs no fill to blend into — which matters
          // because the cards are unfilled and the page's dot-grid shows
          // straight through them.
          ...(!expanded && overflows
            ? {
                maskImage:
                  "linear-gradient(to bottom, #000 72%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, #000 72%, transparent 100%)",
              }
            : null),
        }}
      >
        {t.paragraphs.map((paragraph, i) => (
          // Open quote on the first paragraph, close only on the last —
          // the convention for quoting multi-paragraph prose.
          <p key={i}>
            {i === 0 && "“"}
            {paragraph}
            {i === lastIndex && "”"}
          </p>
        ))}
      </div>

      {overflows && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={quoteId}
          className="mt-4 cursor-pointer transition-colors hover:text-(--color-accent) focus-visible:text-(--color-accent) focus:outline-none"
          style={{
            ...META,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            background: "none",
            border: 0,
            padding: 0,
          }}
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}

      <div className="mt-5">
        <p style={{ ...typescale.body, color: "var(--color-fg-secondary)" }}>
          —{" "}
          {t.href ? (
            <a
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              className="dotted-link--inline"
            >
              {t.author}
            </a>
          ) : (
            t.author
          )}
        </p>
        {t.org && (
          <p className="mt-1" style={META}>
            {t.org}
          </p>
        )}
      </div>
    </div>
  );
}

/** Colleague recommendations, seated under the bio on the About surface.
 *  Renders as a plain stack with no <Grid>/<Col> wrapper of its own — it
 *  inherits whatever column its parent sits in, which is how it stays
 *  locked to the bio's exact measure (Marco 2026-08-03).
 *
 *  No section heading, per the 2026-07-15 call: the bordered cells read
 *  as their own organized band. */
export default function Testimonials() {
  return (
    <div className="flex flex-col gap-6">
      {TESTIMONIALS.map((t) => (
        <TestimonialCard key={t.author} t={t} />
      ))}
    </div>
  );
}

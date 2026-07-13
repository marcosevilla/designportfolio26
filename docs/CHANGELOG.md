# Changelog

A milestone log of what's been built on this portfolio — grouped by month, newest first.
Curated from 340 commits (Feb 9 – Jun 4, 2026). Each entry is a feature or system, not an individual commit.

---

## June 2026

- **Work-history widget** — added a work-history surface to the homepage, plus a theme toggle in the toolbar and a thinner, unified icon set.

## May 2026

- **Ask Marco — AI chat bar.** Shipped a full conversational chat surface: a server route streaming responses from Claude over SSE, system prompt assembled from bio + resume + case-study metadata, Upstash rate-limiting and spend caps, inline link grammar in replies, and a live case-study card "unfurl." Started as a floating "Ask me anything" CTA, grew into a persistent panel, then a full-screen overlay. Later hardened with privacy guardrails.
- **Locked-content gating.** A WIP-courtesy gate over select case studies and Playground pages — `LockGate` (card + page modes), an env-hashed unlock code, a global unlock modal, and email / LinkedIn CTAs. Copy evolved from "Wax on. Wax off." to "Under construction."
- **Unified toolbar.** Replaced the old split chrome (separate actions, sticky footer, standalone palette button) with a single fixed-top system bar — palette popover, music expand, LED scene toggles, and a time/weather cluster. Rolled out in four phases.
- **B&W asterisk rebrand.** Swapped the heavy `✸` star and `✦` marquee separator for Geist Sans `*` across every surface (hero, nav, loader, chat, music, marquee), and made the pure-neutral `mono` palette the default theme.
- **Full-screen music overlay.** A dedicated music surface with the LED matrix, always-on transport, a Spotify-style player row, and direction-aware track-change animation. The mini widget mirrors its chrome.
- **Mobile toolbar.** Consolidated four floating pills into one wide unified glass pill, sticky-top, that compacts on scroll.
- **Resume.** Standalone `/resume` page plus a headless-Chrome script that generates the PDF.
- **Hanging-star nav** with an About link and resume button.

## April 2026

- **LED matrix audio visualizer.** A canvas-based audio player rendered as an LED dot-matrix — custom bitmap dot-font, multiple reactive scenes (drumhead, lissajous, bass-reactive sparkles, lava-lamp idle field), full transport, scrubber, track-change crossfade, and a complete keyboard/ARIA accessibility pass.
- **Typography consolidation.** Collapsed multiple font families (GeistPixel, Instrument Serif/Sans, GT-Cinetype-Mono) down to a single Geist Sans family with a 3-weight typescale. Removed the font-pairing picker; restructured the hero into a static name label + streaming statement.
- **Hero toolbar redesign** with a sticky floating variant, cycling greeting, and section labels.
- **First-load intro sequence** — star blink with cursor, type-out "Welcome," and a cascading blur-in.
- **Password gate** added ahead of the site going live publicly.
- **Gallery mode + Playground.** Gallery card view, project blurbs, recruiter-share toggles, and a Playground section with autoplay video cards.
- **Carousel view** explored and merged on a feature branch.

## March 2026

- **"How I Work with AI" page** added; experimental teaser mode disabled.
- **Paper dithering shader teaser** — an interstitial page with a Paper shader and DialKit tuning controls.
- **SEO, accessibility, and content-accuracy pass** across the portfolio.

## February 2026

- **Initial portfolio launch.** Next.js 14 site (App Router, static export) with 6 case studies.
- **Navigation system.** Sticky footer, inline table-of-contents, homepage-only sidebar.
- **Two-column editorial layout** for case studies, with the F&B card preview and typography pass.
- **F&B Ordering case study build-out** — roadmap timeline, mobile showcase, card-preview polish.
- **Real imagery** replacing 21 placeholders across 4 case studies.
- **Dev-only inline content editor** for editing case-study copy in place.
- **DialKit controls** for tuning the F&B card hover animation.

---

*This log tracks feature-level milestones. For the full commit history, see `git log`.*

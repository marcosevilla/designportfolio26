# Performance Backlog — verified 2026-08-01

Every item below was re-verified against the tree on 2026-08-01 (not
recited from old notes). Ordered by impact. Items marked **DECISION**
need Marco's call; the rest are mechanical once decided.

## A. Media weight — the big wins

1. **guest-experience-dash.mp4 — 15MB, loads on the HOMEPAGE.**
   Referenced by the Compendium marquee card (lib/gallery-content.ts)
   and the Compendium page. Biggest single win on the site: a re-export
   at fb-guest-ordering's bitrate (~2.7MB for similar content) would cut
   homepage weight ~12MB. **DECISION:** Marco re-exports (screen-only,
   lower bitrate); drop-in replace, no code change.

2. **fb-mobile.mp4 — 16MB, full-canvas on the F&B page.**
   Same re-export need, plus: bake a neutral/dark-friendly background —
   in dark mode it currently renders as a big white slab (see
   QA-FINDINGS). One re-export fixes both. **DECISION:** Marco exports.

3. **~18MB of unreferenced gallery PNGs (12 files, 0 code refs).**
   `public/images/gallery/{fb-ordering,compendium,upsells}/*.png` —
   fb-overview, food-bg, food-prep-bg, guest-experience-app/-mobile,
   menu-management(+.raw), mobile-guest, order-management(×3),
   upsells.png. Superseded by the 07-18 WebP pass; never requested by
   any page, but bloat every deploy and clone. Recoverable from git.
   **DECISION:** delete all 12? (Was already "pending delete call" on
   07-18.)

4. **photography-portfolio.mp4 — 7.6MB playground card on the homepage.**
   Same re-export treatment as #1 if Marco wants the homepage lean.

## B. Video behavior — mostly fine already, two gaps

- Already good (don't redo): `AutoplayVideo` uses `preload="metadata"`
  and IO-gated play/pause, so offscreen videos don't fully download.
- 5. **No posters anywhere.** AutoplayVideo accepts `poster` but no call
  site passes one — until a video is in view + playing, its frame can
  paint blank. Mechanical: export 1 JPG per video, wire `poster`.
- 6. **DitherBackdrop: 6 always-animating WebGL canvases on the
  homepage.** Perf was "accepted" on 07-20 with IO speed-0 pause named
  as the follow-up if needed. Mechanical to add; low risk.

## C. Framework/config

- 7. **`images.unoptimized: true` in next.config.mjs** — leftover from
  the static-export era; the site is a Vercel *server* deployment now,
  so Next image optimization (responsive sizes, AVIF/WebP negotiation)
  is available but switched off. Full benefit requires moving raw
  `<img>` tags to `next/image` on the media-heavy pages. **DECISION:**
  worth the migration? (Case-study images are already WebP ≤1600w, so
  the win is responsive sizing on mobile, not format.)
- 8. **framer-motion → LazyMotion migration** — bundle-size item from
  the 2026-07-18 audit, still open. Mechanical but touches many files.

## Already done — don't re-flag

- 20 case-study PNGs → WebP ≤1600w (~41MB, 07-18, script at
  site/scripts/optimize-images.mjs)
- fb-guest-flow.mp4 deleted (07-19); videos IO offscreen-pause (07-18)
- BackgroundTexture DPR cap 1.5 + reduced-motion; /dev labs 404 in prod

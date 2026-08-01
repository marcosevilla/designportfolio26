# QA Findings — visual sweep loop

Found-but-not-fixed items from the contact-sheet QA loop (started 2026-08-01).
Each entry: route, what's wrong, evidence, why it wasn't fixed in the loop,
and the suggested fix if Marco wants it actioned.

## /work/fb-ordering

### ViewportFade dims the case-study title at rest (desktop)
At 1440×900 and 1920×~900 (common laptop sizes), the hero dashboard +
`lg:pt-[18vh]` put the h1 right at the fold, so "ordering for hotels"
(the h1's second line) sits inside `components/ViewportFade.tsx` — the
fixed 120px bottom-of-viewport fade — and reads at ~half opacity on
first paint, in both light and dark. Any scroll resolves it, but it's
the first thing a recruiter sees. Verified live (not a capture
artifact): headless Chrome at 1440×900, scrollY=0.

**Why not fixed:** same phenomenon class as the 07-26 critique item
("F&B intro para-3 scroll-fade reads half-opacity in static
captures") which Marco saw and chose not to action. This instance is
worse (it hits the title), so re-raising for a ruling.

**Options if actioned:** (a) shorten the hero band so the h1 clears
the fold at 900px-tall viewports, (b) reduce ViewportFade height/
terminal opacity, (c) mount ViewportFade only after first scroll.

### fb-mobile.mp4 reads as a large white slab in dark mode
The guest mobile-flow video (4:3, full canvas between intro and the
dashboard crops) has its light background baked into the pixels, so in
dark mode it's a big white rectangle against the dark page. The
dashboard PNips/webp exports on `FB_PANEL_BG` adapt correctly; only
the video can't.

**Why not fixed:** needs a media re-export (transparent/neutral bg or
a dark-aware variant). Already adjacent to the queued task to re-export
fb-mobile.mp4 at a lower bitrate (it's still the 16MB original) — fold
the background decision into that re-export.

### ObjectFlowDiagram has no scroll affordance below ~820px
At 390 the diagram is a horizontal scroll strip (`overflow-x-auto`,
`min-w-[820px]`) — functional, but the only hint that Menus/Outlets
columns exist is the mid-word cut of the Modifier-group column.
Low priority; a right-edge fade or partial-column peek would make the
scroll discoverable.

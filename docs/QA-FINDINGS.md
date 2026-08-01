# QA Findings — visual sweep loop

Found-but-not-fixed items from the contact-sheet QA loop (started 2026-08-01).
Each entry: route, what's wrong, evidence, why it wasn't fixed in the loop,
and the suggested fix if Marco wants it actioned.

## /work/fb-ordering

### ViewportFade dims the case-study title at rest (desktop) — site-wide class
At 1440×900 and 1920×~900 (common laptop sizes), the hero dashboard +
`lg:pt-[18vh]` put the h1 right at the fold, so "ordering for hotels"
(the h1's second line) sits inside `components/ViewportFade.tsx` — the
fixed 120px bottom-of-viewport fade — and reads at ~half opacity on
first paint, in both light and dark. Any scroll resolves it, but it's
the first thing a recruiter sees. Verified live (not a capture
artifact): headless Chrome at 1440×900, scrollY=0.

Not fb-specific: the same fade dims whatever text crosses the fold on
every page at lg+ (checkin's Overview second paragraph, ai-workflow's
section intros). Worst on fb-ordering because it's the *title* there.
The fade's terminal stop is 100% `--color-bg`, so text at the very
bottom edge is fully erased rather than softened — a lighter terminal
stop (~80–85%) would keep the soft-edge intent without hiding copy.

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

## /work/upsells

### Structurally clean — placeholder wall is the only visual gap
Sweep at all 5 widths × both modes (2026-08-01): refreshed stats render
correctly in both layouts, TwoCol band centers, Reflection/quotes fine
in dark. The page's only visual problem is the known ~17
ImagePlaceholder frames awaiting Figma exports (the reason it's still
locked) — media work, not a code defect. No action from the QA loop.

## /work/checkin

### Clean pass
Sweep at all 5 widths × both modes (2026-08-01): refreshed stats
(~6,000 Wyndham portfolio), Wenjun Zhao PullQuote, and all five image
panels render correctly; collapsed mobile sections are the intended
pattern. Only recurring item is the site-wide ViewportFade fold-dim
(see the fb-ordering entry). Omni-channel + International sections
remain text-only — known content thinness, not a rendering defect.

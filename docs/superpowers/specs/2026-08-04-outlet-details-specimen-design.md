# Specimen #4 — Outlet Details Editor (F&B staff side)

**Date:** 2026-08-04
**Status:** Approved by Marco (frame, loop story, tall shell, email fix — all ruled in session)
**Source frame:** `57:8145` in Canary Polished Visuals (`OclYC5ytIQc9HAuJMRXUaz`) — the outlet
editor ("The Lodge Restaurant") with a live guest-phone preview panel. Confirmed by Marco via
node URL. This is NOT the prototype's EditItemPage.

## What it is

Fourth DemoStage specimen on `/work/fb-ordering`, mounted in
`site/app/work/fb-ordering/FBOrderingContent.tsx` directly below `ItemLibrarySpecimen`.
The staff-side outlet-details CMS screen: a form column that edits an F&B outlet, with a live
guest-phone preview that mirrors every edit in real time. The live mirroring is the whole show.

## Files

- **New:** `site/components/fb-showcase/OutletDetailsSpecimen.tsx` — self-contained component
  that wraps itself in DemoStage (mount the specimen, never DemoStage directly).
- **New:** `site/components/fb-showcase/outlet-details-data.ts` — form copy + preview copy.
- **Reused:** `canary-polished-tokens.ts` (import, don't re-transcribe), `admin-shell.tsx`
  (Sidebar / WindowChrome — the frame's sidebar is pixel-identical to the shared shell; active
  item stays "F&B Ordering"), `mdi-icons.ts` (new glyphs fetched from
  Templarian/MaterialDesign-SVG, never hand-authored).
- **Asset:** reuses `public/images/fb-ordering/specimen/info-hero.webp` (900×460) as the
  "uploaded" photo — no new assets. Continues the approved izakaya-reuse deviation.

## Layout (adapted from the frame's 1512px canvas to the shared 1177px shell)

- Shell: `APP_W = 1177`, sidebar 216, content column 961. Shell height ~1000px ("full form,
  tall shell" — Marco's ruling): every section visible, no internal scrolling, because the
  demo script cannot scroll. Exact height derived at build time from real token metrics.
- Top bar: breadcrumb "Home / The Lodge Restaurant" left; "Translate" text link + solid
  `primary[500]` "Publish" button right.
- Form column (~480px): Title (EN chip), Type, Description (EN chip + `n/500` counter),
  Address, Website, Phone (flag + `+1` prefix), Manage Hours card ("Add Hours" link),
  Photos card (dashed-border upload dropzone).
- Preview panel (~310px, right): phone-shaped card — hero area (starts as gray
  "No image available"), outlet title, black "Order Food" CTA, description, phone row,
  email row, "English" selector, Privacy/Terms + "Powered by Canary Technologies" footer.
- All copy verbatim from the frame, with ONE deviation (Marco's ruling): the preview email
  `dining@savannahsunset.com` is a leftover from a different property — ship
  `dining@thelodgeresort.com` instead, logged in the component's deviation comment.

## Demo loop (~15s)

1. **Type:** cursor taps Description → types the closing sentence
   "Complimentary breakfast included with your stay." The field STARTS without it, so the
   resting final state matches the frame's 186/500 exactly. Preview description mirrors
   keystroke-by-keystroke; the counter ticks live.
2. **Photo:** cursor taps the Photos dropzone → `info-hero.webp` animates in as a thumbnail
   in the Photos card AND the preview hero crossfades from gray to the photo.
3. **Publish:** cursor taps Publish → ~700ms loading beat on the button → success toast
   (same toast pattern as #3) → hold → loop key-remount resets everything.

## DemoStage change (shared infra — re-verify ALL three existing specimens)

`typeInto` currently replaces the value from scratch (`text.slice(0, i)`), which would retype
all 186 chars. Two backwards-compatible tweaks:

1. **Prefix-aware start:** if the element's current value is a prefix of the step's `text`,
   typing starts after it. No-op for empty fields (cart's room "412" is unaffected).
2. **Optional `charMs` on the `type` step** (default 120) so the 48-char sentence lands in
   ~3.5s instead of ~5.8s.

## Interactivity (takeover mode)

- All six text fields are real controlled inputs, each mirrored live into the preview.
- Dropzone click toggles the photo on/off.
- Publish re-fires loading + toast.
- Inert (out of scope, same stance as #3's tabs): sidebar, breadcrumb, Translate, Add Hours,
  language selector, footer links.
- Standard specimen constraints apply: all state local (`useState`/`useRef`) for key-remount,
  fixed pixel geometry matching `stageWidth`/`stageHeight`, no `position: fixed`, no `.focus()`
  outside DemoStage's script-focus flag.

## Riding along (batched shell chores from specimen #3's final review)

Do while touching the shared shell, then re-verify BOTH staff specimens:

1. Export `CHROME_H = 36` from `admin-shell.tsx` (currently triplicated as literals).
2. Aria-labels on #3's icon-only controls (checkbox / switch / trash).
3. Wire `ICONS.imageOff` as thumbnail `onError` fallback in #3.
4. Note the plain-`<img>`-not-next/image rationale in #3's deviation comment.

## Verification bar

The standard specimen bar: `tsc --noEmit` clean; two full demo loops with `dY: 0` and 0 console
errors at 1440; dark mode (panel follows site theme, product interior stays light); 390px (no
page overflow, both pan edges reachable); fullscreen at true 1:1 with Esc/scrim/X close.
PLUS: #1 (cart — typing regression), #2, and #3 non-interference/non-regression after the
DemoStage + admin-shell edits.

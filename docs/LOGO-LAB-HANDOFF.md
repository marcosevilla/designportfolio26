# Logo Lab — Handoff (2026-07-17)

Initiative: build an interactive 3D logo for the portfolio, modeled on the one at
https://www.opensoftware.co/ (drag-to-tumble glossy extruded mark in the hero).
This doc carries everything a fresh session needs — the reverse-engineering
findings, the recipe, and the guardrails. Read it fully before writing code.

## What the reference does (verified by inspection, 2026-07-17)

Investigated live with a browser + bundle analysis. Findings:

- **Stack:** Three.js via React Three Fiber + drei (the canvas wrapper divs are
  R3F's `<Canvas>` signature; drei code is in the bundle). No 3D model files are
  fetched — geometry is procedural.
- **Geometry:** flat 2D logo outline (rounded corners via `quadraticCurveTo`)
  run through `ExtrudeGeometry` with `depth: 1`, `steps: 1`, and bevels — the
  beveled edges are what catch the light.
- **Material:** drei's `MeshTransmissionMaterial` — translucent "hard candy"
  glass/gel look. Observed params in their bundle: `transmission: 1`,
  `thickness: 1.6`, plus roughness + clearcoat. This material is the whole
  premium feel; a plain MeshStandardMaterial reads as cheap plastic.
- **Lighting:** `Environment` map (studio HDRI → the long soft reflections) +
  spot/directional/ambient lights + soft shadow under the object.
- **Interaction:** drag-to-tumble with inertia. pointerdown/move → mouse delta
  becomes an **angular velocity** applied to the mesh quaternion, damped every
  frame (`slerp`/`damp` in their code). Released → keeps spinning and settles.
  ~30 lines, no physics engine. (Their canvas also shows a product caption on
  hover — not needed for ours.)
- **Cost observed:** their 3D chunk alone is ~980KB. Budget ~1MB of JS for
  three + fiber + drei.

## Recipe for ours

1. `npm i three @react-three/fiber @react-three/drei` (in `site/`).
2. Get the mark as an SVG with a closed outline. Candidates: the Geist `*`
   brand asterisk (see CLAUDE.md "Brand mark") or a custom shape — ASK MARCO
   which mark before building geometry.
3. drei `SVGLoader` → shapes → `<Extrude>` with bevel
   (`bevelEnabled, bevelThickness ~0.1, bevelSize ~0.1, bevelSegments ~8`).
4. `<MeshTransmissionMaterial transmission={1} thickness={1.5} roughness={0.15}
   clearcoat={1} color=... />` — color should track the site theme
   (`--color-accent`; mono theme = near-black/white, so test a colored theme too).
5. `<Environment preset="studio" />` + drei `<ContactShadows />`.
6. Interaction: drei `<PresentationControls>` for spring-back rotate, OR copy
   the reference's free-tumble (angular velocity + per-frame damping) for the
   flick feel. Start with PresentationControls; upgrade if it feels stiff.

## How to build it (project conventions)

- **Prototype as `/dev/logo-lab`** — same pattern as `/dev/effects-lab` and
  `/dev/type-lab` (see `site/app/dev/effects-lab/` for the panel/slider idiom;
  its `EffectsLab.tsx` has a reusable Slider component to copy). Everything in
  `site/app/dev/logo-lab/`, nothing touches live pages until Marco approves.
- Expose material/light/bevel params as sliders — tuning IS the work here.
- A "copy settings JSON" button (effects-lab has one) so tuned values can be
  handed back and baked in.
- **Repo rules that bite here:** three.js is a new animation-library-class
  dependency — Marco already green-lit exploring it via this handoff, but keep
  it scoped to the lab page (dynamic import / client-only so the ~1MB never
  loads on real pages). Verify `npm run dev` still works after install
  (framer-motion corruption gotcha in CLAUDE.md). tsc runs via PostToolUse hook.
- `/dev` routes ship in prod builds (not NODE_ENV-gated) — fine for now,
  flagged in CLAUDE.md Current State.

## Open decisions for Marco (ask before/while building)

1. Which mark? (Geist `*` vs custom shape vs something new)
2. Where would it eventually live? (hero? loader? about page?) — affects how
   much perf work matters.
3. Free-tumble with inertia (reference behavior) vs spring-back-to-rest.

## Status

- **BUILT 2026-07-17** — `/dev/logo-lab` is live (site/app/dev/logo-lab/:
  page + LogoLab panel + LogoScene canvas + params + glyph). Decisions made:
  Geist `*` mark, destined for the homepage hero, free-tumble with inertia.
- Stack notes: fiber v9 + drei v10 (`--legacy-peer-deps` — Next 16's App
  Router runs vendored React 19 internals, so fiber v8's React-18 reconciler
  crashes with `ReactCurrentOwner` undefined; package.json's react 18 pin is
  irrelevant at runtime). three 0.185. Glyph outline pre-extracted from
  Geist-Medium.ttf into glyph.ts — no font parsing at runtime.
- Next: Marco tunes in the lab → paste settings JSON back → bake values +
  plan the hero integration (perf: self-host the HDRI, lazy-load the chunk).
- Effects-lab session (2026-07-17, commit 135de51) established the lab-page
  pattern this follows.

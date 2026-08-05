# /build-demo — skill design

**Date:** 2026-08-04
**Status:** Approved design, awaiting spec review
**Goal:** Make the Figma → interactive case-study demo workflow (the process that produced
the four F&B demos) repeatable by Opus-level sessions, without Fable, by codifying the
sequencing and judgment calls as a project skill. Marco's eye remains the quality gate.

## Naming

- User-facing term everywhere in the skill: **demo** ("interactive demo", "the compendium demo").
- The codebase's internal vocabulary is unchanged: `.claude/rules/specimens.md`,
  `XSpecimen.tsx` component names, `data-demo` attributes. The skill maps the two
  ("a demo is what the codebase calls a specimen") once, at the top, and never leans on
  the internal term again.

## Packaging

- One file: `.claude/skills/build-demo/SKILL.md`, checked into this repo. No scaffolding
  code, no templates, no new components.
- It is a **process skill**: it sequences phases and points at existing sources of truth.
  It must NOT duplicate the content of `.claude/rules/specimens.md` — that rule auto-loads
  when the session touches `site/components/fb-showcase/**` or `DemoStage.tsx`, and
  duplication would create drift. The skill may *name* a rule ("script grammar is
  tap/type/wait only — see specimens rule") but the rule file owns the detail.
- Description/trigger phrases: "build the next demo", "build a demo for X", "demo #N",
  "recreate this Figma screen as an interactive demo".

## Process the skill encodes

### Phase 0 — Intake (one batched question round)

Collect in a single AskUserQuestion/message, never piecemeal:

1. **Figma source** — frame URL or node ID.
2. **Interaction story** — what the ~15s auto-loop shows off, in one or two sentences.
3. **Donor** — closest existing demo to copy structure from. Defaults offered:
   `ItemLibrarySpecimen` for staff-shell (1177px) screens, `FnbCartSpecimen` for
   guest-phone (390pt) screens.
4. **Real vs. invented** — which copy, data, URLs, and assets must be real, and what
   flavor invented data should have (e.g. the izakaya menu). Anything Figma can't answer
   about product behavior gets asked here — never guessed (no-fabrication rule).

### Phase A — Static recreation → Marco's fidelity gate

1. Pull the frame via Figma MCP (`get_design_context` + `get_screenshot`), honoring the
   mandatory `figma:figma-design-to-code` skill prerequisite.
2. Copy the donor's structure; restyle exclusively from `canary-polished-tokens.ts`;
   fetch any new icons from Templarian/MaterialDesign-SVG into `mdi-icons.ts`.
3. Build at fixed pixel size matching the stage dimensions; shared staff-shell edits
   (`admin-shell.tsx`, `mdi-icons.ts`) trigger re-verification of all demos that use them.
4. Self-check before showing Marco: rendered screenshot vs. Figma export side-by-side.
5. **Commit, then stop.** Marco reviews in the browser and art-directs. No choreography
   until he clears it.

### Phase B — Choreography → Marco's taste gate

1. Add `data-demo` attributes; wrap the component in DemoStage (the component wraps
   itself; pages mount the component, never DemoStage directly).
2. Script grammar: `tap` / `type` / `wait` only. Timing defaults from shipped demos:
   `charMs` 70–120, ~2600ms end hold, 12–20s total loop.
3. Self-check: watch two full loops via browser automation before presenting.
4. **Commit, then stop.** Marco reviews the feel.

### Phase C — Mechanical verification + docs sync

1. Run the verification bar from the specimens rule verbatim: tsc clean, 0 console
   errors, two loops with `dY: 0`, dark mode, 390px viewport (no page overflow, both pan
   edges reachable), fullscreen at true 1:1.
2. Docs sync: new entry at the top of `docs/CURRENT-STATE.md`; add the demo to the
   existing-demos list in `.claude/rules/specimens.md`; commit.

## Tripwires (stated inline in the skill)

- 2 consecutive failed fixes on the same issue → stop and reassess, don't spiral.
- "Stalled" demo → measure IntersectionObserver ratio FIRST; it's usually a drifted
  scroll anchor, not a bug.
- Hide `[data-agentation-root]` before any browser-automation screenshots.
- Never hand-author MDI glyph paths; never call `.focus()` outside a user gesture; no
  `position: fixed` inside the demo; all state local (the loop is a key-remount).

## Non-goals

- No codebase rename away from "specimen" — internal names stay.
- No scaffold generator (revisit only if Opus fumbles boilerplate in practice).
- No multi-agent orchestration.
- Not a general-purpose pipeline for other repos — this skill is portfolio-specific.

## Success criteria

An Opus session, given a Figma frame and the skill, produces a demo that passes the
verification bar and Marco's two gates with no Fable involvement, at quality
indistinguishable from the four shipped demos.

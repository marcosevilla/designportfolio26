---
name: build-demo
description: Build an interactive case-study demo from a Figma frame — the pipeline that produced the four F&B demos. Use when the user says "build the next demo", "build a demo for X", "demo #N", or "recreate this Figma screen as an interactive demo".
---

# Build an interactive demo

Turn a Figma frame into an auto-playing interactive demo embedded in a case study.

**Terminology (read once, then drop it):** a *demo* is what the codebase calls a *specimen*. Internal names stay as-is — `.claude/rules/specimens.md`, `ItemLibrarySpecimen.tsx`, `data-demo` attributes. To Marco, the word is always "demo".

**Source of truth:** `.claude/rules/specimens.md` owns every technical detail — the DemoStage contract, tokens, shells, hard-won gotchas, and the verification bar. It auto-loads when you touch `site/components/fb-showcase/**` or `DemoStage.tsx`. This skill only sequences the work; when it names a rule, the rule file has the detail. Never restate rule content from memory — read it.

Marco's eye is the quality gate. There are two hard stops below — never run past one.

## Phase 0 — Intake (one batched question round)

Collect everything in a single AskUserQuestion/message, never piecemeal:

1. **Figma source** — frame URL or node ID.
2. **Interaction story** — what the ~15s auto-loop shows off, in one or two sentences.
3. **Donor** — closest existing demo to copy structure from. Offer defaults: `ItemLibrarySpecimen` for staff-shell (1177px) screens, `FnbCartSpecimen` for guest-phone (390pt) screens.
4. **Real vs. invented** — which copy, data, URLs, and assets must be real, and what flavor invented data should have (e.g. the izakaya menu). Anything Figma can't answer about product behavior gets asked here — never guessed.

## Phase A — Static recreation → Marco's fidelity gate

1. Invoke `figma:figma-design-to-code` (mandatory prerequisite), then pull the frame via Figma MCP (`get_design_context` + `get_screenshot`).
2. Copy the donor's structure. Restyle exclusively from `canary-polished-tokens.ts` — import it, don't re-transcribe. New icons: fetch from Templarian/MaterialDesign-SVG into `mdi-icons.ts`.
3. Build at fixed pixel size matching the stage dimensions. Editing shared staff-shell files (`admin-shell.tsx`, `mdi-icons.ts`) triggers re-verification of every demo that uses them.
4. Self-check before showing Marco: rendered screenshot vs. Figma export, side by side.
5. **Commit, then STOP.** Marco reviews in the browser and art-directs. No choreography until he clears it.

## Phase B — Choreography → Marco's taste gate

1. Add `data-demo` attributes; wrap the component in DemoStage — the component wraps *itself*; pages mount the component, never DemoStage directly.
2. Script grammar is `tap` / `type` / `wait` only. Timing defaults from shipped demos: `charMs` 70–120, ~2600ms end hold, 12–20s total loop.
3. Self-check: watch two full loops via browser automation before presenting.
4. **Commit, then STOP.** Marco reviews the feel.

## Phase C — Mechanical verification + docs sync

1. Run the verification bar from `.claude/rules/specimens.md` verbatim: tsc clean, 0 console errors, two full loops with `dY: 0`, dark mode, 390px viewport (no page overflow, both pan edges reachable), fullscreen at true 1:1.
2. Docs sync: new entry at the top of `docs/CURRENT-STATE.md`; add the demo to the existing-demos list in `.claude/rules/specimens.md`. Commit.

## Tripwires

- 2 consecutive failed fixes on the same issue → stop and reassess, don't spiral.
- "Stalled" demo → measure the IntersectionObserver ratio FIRST; it's usually a drifted scroll anchor, not a bug.
- Hide `[data-agentation-root]` before any browser-automation screenshots.
- Never hand-author MDI glyph paths; never call `.focus()` outside a user gesture; no `position: fixed` inside the demo; all state local (the loop is a key-remount).

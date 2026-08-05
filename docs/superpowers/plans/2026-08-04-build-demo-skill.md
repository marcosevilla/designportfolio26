# /build-demo Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `.claude/skills/build-demo/SKILL.md` — a process skill that makes the Figma → interactive case-study demo workflow repeatable by Opus-level sessions.

**Architecture:** One markdown file, no code. The skill sequences four phases (intake → static recreation → choreography → verification/docs) with two hard Marco-review gates, and delegates all technical detail to `.claude/rules/specimens.md`, which auto-loads when demo files are touched.

**Tech Stack:** Claude Code project skill (SKILL.md with YAML frontmatter). No dependencies, no build step.

## Global Constraints

- Exactly one deliverable file: `.claude/skills/build-demo/SKILL.md`. No scaffolding code, no templates, no new components.
- The skill must NOT duplicate content from `.claude/rules/specimens.md` — it may *name* a rule; the rule file owns the detail.
- User-facing word is **"demo"**, never "specimen". Internal names (`.claude/rules/specimens.md`, `ItemLibrarySpecimen`, `data-demo`) stay as-is; the skill maps the two terms once, at the top.
- The spec at `docs/superpowers/specs/2026-08-04-build-demo-skill-design.md` is approved — content below implements it verbatim; do not redesign during execution.
- Load `superpowers:writing-skills` before authoring (it governs skill authoring). On any conflict between its generic advice and the approved content below, the content below wins.

---

### Task 1: Author `.claude/skills/build-demo/SKILL.md`

**Files:**
- Create: `.claude/skills/build-demo/SKILL.md` (directory `.claude/skills/` does not exist yet — create it)

**Interfaces:**
- Consumes: `docs/superpowers/specs/2026-08-04-build-demo-skill-design.md` (approved spec), `.claude/rules/specimens.md` (referenced, never duplicated)
- Produces: the skill file, discoverable by future sessions via its frontmatter `description` trigger phrases

- [ ] **Step 1: Invoke `superpowers:writing-skills`**, then write the file with exactly this content:

````markdown
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
````

- [ ] **Step 2: Verify the "demo not specimen" rule**

Run: `grep -n -i specimen .claude/skills/build-demo/SKILL.md`
Expected matches ONLY: the terminology line, file-path/component-name references (`.claude/rules/specimens.md`, `ItemLibrarySpecimen`, `FnbCartSpecimen`). Any other prose use of "specimen" is a failure — fix it.

- [ ] **Step 3: Verify every referenced path exists**

Run:
```bash
ls .claude/rules/specimens.md docs/CURRENT-STATE.md \
   site/components/DemoStage.tsx \
   site/components/fb-showcase/canary-polished-tokens.ts \
   site/components/fb-showcase/admin-shell.tsx \
   site/components/fb-showcase/mdi-icons.ts \
   site/components/fb-showcase/ItemLibrarySpecimen.tsx \
   site/components/fb-showcase/FnbCartSpecimen.tsx
```
Expected: all listed, no "No such file". If a path differs, fix the skill text to the real path — do not invent.

- [ ] **Step 4: Verify frontmatter parses**

Run: `head -5 .claude/skills/build-demo/SKILL.md`
Expected: opening `---`, `name: build-demo`, `description:` containing all four trigger phrases from the spec.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/build-demo/SKILL.md
git commit -m "feat: /build-demo project skill — Figma → interactive demo pipeline"
```

### Task 2: Docs sync

**Files:**
- Modify: `docs/CURRENT-STATE.md` (new entry at top of the list)
- Add: `docs/superpowers/plans/2026-08-04-build-demo-skill.md` (this plan, already written)

**Interfaces:**
- Consumes: Task 1's committed skill file
- Produces: session-history entry per project CLAUDE.md session-end rules

- [ ] **Step 1: Add entry at the top of `docs/CURRENT-STATE.md`:**

```markdown
## 2026-08-04 — /build-demo skill shipped
- Wrote `.claude/skills/build-demo/SKILL.md` from the approved spec
  (`docs/superpowers/specs/2026-08-04-build-demo-skill-design.md`); plan at
  `docs/superpowers/plans/2026-08-04-build-demo-skill.md`.
- Process skill only — sequences intake → static recreation (fidelity gate) →
  choreography (taste gate) → verification/docs; all technical detail stays in
  `.claude/rules/specimens.md`. User-facing word is "demo".
- Needs a session restart to become invocable; untested against a real Figma frame —
  first real use is the acceptance test.
```

(Match the existing entry format in the file — if entries use a different heading style, follow the file, keeping this content.)

- [ ] **Step 2: Commit**

```bash
git add docs/CURRENT-STATE.md docs/superpowers/plans/2026-08-04-build-demo-skill.md
git commit -m "docs: session entry + plan for /build-demo skill"
```

- [ ] **Step 3: Tell Marco a session restart is needed** before `/build-demo` shows up as an invocable skill (per project CLAUDE.md config-change rule).

# Pajamagrams — Project Outline

> Internal context document. Raw notes for portfolio + future iteration. Public-facing case study lives in `pajamagrams.md`.

---

## At a glance
- **Title:** Pajamagrams
- **Date:** Jan 2026
- **Type:** Personal project / mobile-first web puzzle / personal gift
- **Status:** Shipped, given as a gift
- **Repo:** `~/claude-projects/pajamagrams`
- **AI-paired ratio:** ~95% Claude-coded, 5% hand-coded.

---

## Origin
A personal gift built around a Bananagrams-style word puzzle, scoped down to a single-player mobile experience with clue-based rounds. Designed for someone close — playful, intimate, meant to be opened on a phone. Doubled as a deliberate stress test of the Figma-MCP workflow at the time: how high-fidelity could the design-to-code translation actually get when every screen, every letter, and every state was sourced from Figma?

---

## Concept
- Drag-and-drop letter tiles, Bananagrams-shaped: tactile, satisfying, fat-finger resilient
- Clue-based rounds — each puzzle is a short prompt grounded in shared inside jokes and memories
- Single-player, no auth, no backend
- Mobile-first — built and tuned for iPhone Safari and Chrome on iOS/Android

---

## Tech stack
- **Build:** Vite
- **Framework:** React 19
- **Animation / drag:** framer-motion (drag, snap, momentum, gesture)
- **State:** zustand
- **Language:** TypeScript

---

## Architecture
- Single SPA (Vite) — no SSR, no routing layer
- Game state in a single zustand store (current puzzle, tile positions, completion state, round progression)
- Drag mechanics handled by framer-motion's `drag` props with custom snap-zone logic
- Gift/reveal "Banana" system layered on top — section called out in the repo README as a feature (animated reveal flourish that ties the puzzles to the larger gift narrative)

---

## Figma-MCP workflow (the unlock)
- Every letter, every state, and most edge cases were designed in Figma first
- Full creative direction nailed in Figma before opening the code editor
- Game mechanics + interaction intent + desired feel handed to Claude alongside the Figma file via MCP
- The build became an exercise in **back-and-forth at the seams**: Claude would translate, the result wouldn't quite feel right, Marco would refine the prompt or the Figma reference, repeat

The deeper lesson: figuring out **how much spec fidelity an LLM actually needs** to produce work at the quality bar Marco wanted. Too vague and it hallucinates the feel; over-specified and the iteration loop slows to a crawl. Pajamagrams was where that calibration happened.

---

## Tile snap (the hardest interaction)
The mechanic isn't hard. The *feel* is.

A user drags a tile toward a placeholder. They let go. The tile either snaps satisfyingly into place — communicating "this knows where I want it" — or refuses to commit, communicating "this is frustrating."

The actual difference between those two states is a few pixels of forgiveness in the snap threshold and tolerance values. Getting it right was less a coding problem than a translation problem: how do you describe "feels good" to a model in granular enough terms that it can land it in numbers?

That articulation work was the actual craft.

---

## Visual style
- Pixel-perfect translation from Figma — the visual style guide is sourced from the file, not improvised
- Tactile tile aesthetic — meant to evoke physical Bananagrams pieces
- Mobile-optimized typography and touch targets
- Light, warm, gift-shaped

---

## What was hard
- Tile snap thresholds (above)
- Drag feel + momentum on touch — framer-motion handled most of the physics, but tuning the snap-back animation and the lift-on-press was iterative
- Articulating motion/interaction intent to Claude in language that produced the right output without a dozen rounds of tweaks

---

## AI workflow notes
- ~95% Claude-coded
- Figma MCP was the primary handoff surface — the codebase essentially translated the Figma file
- This project sharpened a generalizable skill: **specifying interaction feel with enough granularity that an LLM can implement it**

---

## Status / next
- Shipped, given as a personal gift
- No active roadmap — the project served its purpose
- Lessons folded forward into Custom Wrapped (next month's project)

# Pajamagrams

> Personal project · Jan 2026
>
> A mobile-first puzzle gift inspired by Bananagrams — drag tiles, clue-based rounds, given to someone close.

---

## A gift, and a stress test

Pajamagrams started as a personal gift — a single-player puzzle game built for someone close, with clue-based rounds grounded in shared inside jokes. It was small, intimate, and intentionally scoped: phone-shaped, no auth, no backend, no roadmap.

It was also a deliberate stress test of the Figma-MCP workflow at the time. I wanted to know how high-fidelity the design-to-code translation could actually get when every letter, every state, and every edge case lived in Figma first.

---

## The workflow

Every screen and every tile state was designed in Figma. The full visual system was nailed before any code was written. The mechanics, the interaction intent, and the *desired feel* were then handed to Claude alongside the Figma file via MCP.

The build became an exercise in calibrating the seams. Claude would translate, the result wouldn't quite feel right, I'd refine the prompt or the reference, repeat. The deeper lesson — the one that's stuck with me — was figuring out **how much spec fidelity an LLM actually needs** to make something feel as intended. Too vague and it hallucinates the feel. Over-specified and the iteration loop crawls. Pajamagrams was where I started to find that line.

---

## The hard part: tile snap

The mechanic isn't hard. The *feel* is.

A user drags a tile toward a placeholder. They let go. The tile either snaps satisfyingly into place — communicating "this knows where I want it" — or refuses to commit, communicating "this is frustrating." The actual difference between those two states is a few pixels of forgiveness in the snap threshold.

Getting it right was less a coding problem than a translation problem: how do you describe "feels good" to a model in granular enough terms that it lands in numbers? That articulation work was the actual craft.

---

## What it shipped as

A small, finished thing. Tactile tiles, clue-based rounds, the kind of object that's meant to be opened on a phone in private and smiled at. It served its purpose. The lessons about spec fidelity and motion articulation folded forward into the next project.

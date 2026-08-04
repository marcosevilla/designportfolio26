---
description: The dev-only inline content editor, its save/publish loop, and source-matching rules
paths:
  - "site/components/dev/**"
  - "site/lib/editor-types.ts"
  - "site/lib/InlineEditorContext.tsx"
  - "site/scripts/dev-editor-server.mjs"
  - "site/scripts/build-bio.mjs"
  - "site/content/bio.md"
  - "site/lib/bio-content.ts"
---

# Dev inline content editor

NODE_ENV-gated, dev-only. Components in `site/components/dev/` (`EditableOverlay`, `FloatingToolbar`, `SectionReorder`); server at `site/scripts/dev-editor-server.mjs`.

## The loop
Edit in-browser → Cmd+S (save) → **Publish** button = commit + push → Vercel deploys.

- `GET /status?file=` returns dirty + ahead count; `POST /publish` does git add/commit **pathspec-scoped to the one edited file** (other dirty/staged files never ride along), then `git push` only if ahead.
- `InlineEditorContext` tracks `unpublished` (checked via `/status` on landing on a case study, set after save) + `publishState`. FloatingToolbar shows Publish when unpublished, disabled until unsaved edits are saved, "Live in ~1 min" flash on success.
- **Caveat by design:** push ships ALL local commits on main, so keep main shippable.

## Text-run editing (homepage intro + About bio)
Click any text stretch inside a `data-editable-source` container (HomeLayout intro div, `HighlightableBio`) and only that DOM text node becomes editable — links/tooltips around it survive, and link *labels* are editable too (matched inside `[label](url)` / `<Em>` markup).

- Saves resolve per-node source files (`EditEntry.file`), matched with `flexSourcePattern` in `editor-types.ts` (whitespace runs ≈ newlines/indent/`{" "}` joins; entity-alternation for `&apos;` etc).
- **`bio.md` writes auto-run `build-bio.mjs`** so `lib/bio-content.ts` hot-reloads; publish of `bio.md` always commits the generated file with it.
- `/status` + `/publish` are multi-file. Homepage editor state covers `HOME_SOURCE_FILES` (HomeLayout.tsx + content/bio.md). FloatingToolbar shows on `/`.
- Case-study flow is whole-element editing, unchanged.

## Bio source chain
`content/bio.md` → `scripts/build-bio.mjs` → `lib/bio-content.ts`. **HomeLayout has a hardcoded copy of the intro — edit both.** The About-page bio does NOT open with the role/location line that the homepage intro does; mirror manually if wanted.

## Automation hazard
The Agentation toolbar (dev-only, bottom-right) intercepts clicks on the music dock in that corner during browser automation — hide `[data-agentation-root]` when testing.

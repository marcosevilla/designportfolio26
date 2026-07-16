# Dead Code & Hidden Features Audit — 2026-07-15

Full inventory of unused, hidden, parked, and archived code, traced from the import graph
(every entry point under `site/app/`) plus a hidden-surface sweep. Branch at time of audit:
`feat/object-flow-dual-view`. Nothing has been deleted — this is the decision list.

---

## 1. The phantom case studies (biggest finding — data bug, not just clutter)

The routes `/work/upsells`, `/work/checkin`, `/work/general-task`, `/work/design-system`
(and `/play/six-degrees`, `/play/pajamagrams`, `/play/custom-wrapped`) were **deleted from
source** during the July redesign. Only `fb-ordering`, `compendium`, `knowledge-base`, and
`ai-workflow` exist as routes today. But the deleted studies still live in the data layer:

| Where | What's stale |
|---|---|
| `lib/locked-content.ts` `LOCKED_SLUGS` | all 4 dead study slugs + 3 dead playground slugs |
| `components/CaseStudyList.tsx` `HIDDEN_SLUGS` | `upsells`, `design-system` |
| `lib/chat/study-metadata.ts` `STUDY_SLUGS`/`STUDY_METADATA` | full entries for all 4 phantom studies — **the chat tells recruiters about studies with no page.** Unfurl cards degrade to `/#projects` (hardcoded in `CaseStudyCardUnfurl.tsx:24`) so no 404s, but links are misleading |
| `lib/chat` | **`knowledge-base` is MISSING** — a real live route the chat can't link to (inverse bug) |
| `lib/editor-types.ts` `SLUG_TO_FILE` | maps phantom slugs → deleted `Content.tsx` files |
| `content/*.mdx` | metadata for routeless studies |

**Do not delete the content** — the markdown drafts in `case-studies/` (upsells-forms,
hotel-checkin, general-task, design-system) are exactly what the ungating/content-pass work
needs. The fix is reconciling the slug sets, and deciding: restore these routes eventually,
or purge the entries until then. Adding `knowledge-base` to chat metadata is a quick win.

## 2. Fully dead code (~5,000+ lines, ~28 files, zero live imports)

Verified: no `next/dynamic`, `React.lazy`, `require()`, or string-based references anywhere —
nothing below is resurrected dynamically.

**Old homepage chrome (replaced by SiteHeader/HeaderToolbar + MusicMiniWidget/ChatFab):**
- `components/HeroToolbar.tsx` (~372) + `components/MobileToolbar.tsx` (~528)
- `components/music/HomeMiniPlayer.tsx` (~330) + `components/music/SeekBar.tsx` (~143) — dead chain under the toolbars (`InsetScrubber` is the live scrubber)
- `components/music/LedMatrixUI.tsx` (~268) + `lib/dot-font.ts` (~172) — old LED transport UI (live path is `LedMatrix.tsx` + `MusicMiniWidget`)
- `components/NavOverlay.tsx` (~275) — full-screen nav overlay
- `components/Marquee.tsx` (~141) — marquee bar
- ⚠️ `MarqueeProvider` and `NavOverlayProvider` are **still mounted in `app/layout.tsx`** but their only consumers are the dead components above — unmount when deleting

**Old work-grid iterations (replaced by CaseStudyList grid cells):**
- `components/CaseStudyCard.tsx` (~151), `components/CaseStudyListRow.tsx` (~91)
- `components/CaseStudyCarousel.tsx` (~431) + `lib/carousel-transition.ts` (~44) — the abandoned carousel view
- `components/fb-showcase/FBCardPreview.tsx` (~107) → `BrowserMockup.tsx` (~71) — dead chain under CaseStudyCard

**F&B showcase iterations (only `ObjectFlowDiagram` is live):**
- `components/fb-showcase/RoadmapEvolution.tsx` (~606)
- `components/fb-showcase/SystemArchitecture.tsx` (~523)
- `components/fb-showcase/MobileShowcase.tsx` (~93)
- Salvage note: substantial finished interactive diagrams — possibly reusable for the locked-study content passes before deleting

**Resume/work-history island:**
- `components/WorkHistory.tsx` (~121) + `components/case-study/ProjectDetails.tsx` (~96) — both fully orphaned (CLAUDE.md's "ProjectDetails still used by WorkHistory" is wrong; WorkHistory itself is rendered nowhere). Would render fine if mounted — candidate for `/resume` or About
- `lib/_archive/` — 4 old resume iterations (2026-05-09, 2026-05-12 1-page), archived by design

**Misc orphans:**
- `components/Playground.tsx` (~214) — old playground grid; homepage playground cards render via CaseStudyList now, and `/play` is a redirect stub
- `components/chat/ChatOverlay.tsx` (~31) — superseded by ChatFab/ChatPanel
- `components/InlineChip.tsx` (~82), `components/MobileSectionNav.tsx` (~116), `components/TextureDivider.tsx` (~24)
- `components/ui/button.tsx` (~58), `components/ui/slider.tsx` (~58) — `ui/tooltip.tsx` IS live, keep it
- `hooks/useMediaQuery.ts` (~23) — `usePrefersReducedMotion` is live, keep it
- `site/out/` — stale May 1 static export; contains all the deleted routes; archived artifact, not ground truth

**Verified LIVE (do not delete):** `Resume.tsx`, `lib/resume-content.ts`, `lib/gallery-content.ts`,
`PhotoStack`, `HighlightableBio`/`HighlighterContext`, `HamburgerMenu`, `ConnectLinks`, `MobileNav`,
`HeaderToolbar`, `ObjectFlowDiagram`, `ui/tooltip.tsx`. `GalleryMode.tsx` is already gone from disk.

## 3. Unused npm dependencies

- `lucide-react` — zero imports
- `next-mdx-remote` — zero imports (content pipeline is gray-matter + custom parsing)
- `class-variance-authority` — only the dead `ui/button.tsx`
- `dialkit` — only the dead `CaseStudyCarousel.tsx`

## 4. Hidden but reachable surfaces

- **`/dev/type-lab` ships in the production build.** Route obscurity only — no NODE_ENV gate
  (unlike `components/dev/` editor + Agentation, which are properly dev-gated in `layout.tsx`).
  Either gate it or accept it as an easter egg.
- **`/writing`** — fully built "Coming soon" shell, linked from nothing.
- **`/resume`** — working in-app resume page (print-ready, forces light theme), but every
  visible Resume link points at the Google Drive PDF (`resume-content.ts:17` `RESUME_URL`).
  Reachable only by typing the URL. Decide: surface it or keep the PDF.
- `/work` and `/play` — redirect stubs to homepage anchors. Intentional; keep.
- `lib/editor-types.ts` `EDITOR_SERVER_URL` points at localhost:3002 (dev editor server).

## 5. Parked — one line to revive

- `CellCaption` in `CaseStudyList.tsx` (~58 lines, defined but never called) — card captions
  from the 2026-07-15 pure-visual pass; copy still lives in study metadata + `playground-cards.ts`
- Tag-filter dropdown in `CaseStudyList.tsx` (~lines 78–160) — built, rendered disabled

## 6. Branches, stash, unpushed work

- **`feat/object-flow-dual-view`** (current, pushed): 13 commits ahead of main — dual-view
  diagram + pure-visual cards + DeviceShell specimen system. NOT merged. Open: caption copy
  is placeholder; fb-mobile.mp4 needs a screen-only re-export.
- **`main` is 2 commits ahead of `origin/main`** (b0f1ef2, 14d5758 — diagram work). Unpushed.
- **`feature/carousel-view`** (local): all commits already contained in main's history; the
  carousel itself was never wired. Branch deletable.
- **`origin/feature/visual-rebrand-bw-asterisk`** (remote only): the asterisk rebrand is live
  in prod via main; branch is a stale snapshot. Deletable.
- **`stash@{0}`** "WIP: chat-bar (extracted from feature/locked-content)" — chat bar shipped
  properly since; stash almost certainly obsolete. Peek (`git stash show -p`) then drop.

## 7. Stale docs

- `docs/superpowers/{specs,plans}/2026-04-18-pixel-jellyfish*` + `2026-04-19-jellyfish-ascii-variant*` —
  jellyfish visualizer that never shipped (superseded by LED matrix)
- `.../2026-04-26-carousel-view*` — abandoned carousel
- `.../2026-05-06-chat-bar-privacy-guardrails-design.md` — spec with **no plan and no implementation**.
  Worth a read before pruning: the chat is recruiter-facing in prod
- `docs/TEXTURE_FEATURE_NOTES.md` — parked BackgroundTexture work
- `CLAUDE.md` itself is stale in places: Project Structure lists the deleted routes/dirs
  (upsells, checkin, general-task, design-system pages; /play subpages; MDX [slug] route;
  GalleryMode), the "untracked files" note (fb-gallery + benji draft are tracked now), and
  the WorkHistory/ProjectDetails claim

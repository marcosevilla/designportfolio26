# Multi-agent maintenance session — change log

**Date:** 2026-08-05
**Baseline tag:** `pre-multiagent-audit` (commit `0b22c2d`)
**Revert everything:** `git reset --hard pre-multiagent-audit`

Every change below is listed with its own revert instruction so individual pieces can
be backed out without losing the rest.

Audit reports produced this session live alongside this file in `docs/audits/`:

| Report | Contents |
|--------|----------|
| `2026-08-05-technical-audit.md` | Technical + performance findings |
| `2026-08-05-design-token-audit.md` | Type/color/spacing token coverage |
| `2026-08-05-token-swaps-applied.md` | Which token swaps were executed |
| `2026-08-05-ux-design-audit.md` | UX findings + future design opportunities |
| `2026-08-05-carousel-plan.md` | Carousel diagnosis + implementation plan |

---

## 1. Work-marquee carousel — scroll-snap removed (smooth free scrolling)

**Ask:** "make the project card carousel smooth scrolling on desktop and mobile. remove
the one-by-one jagged scrolling that snaps to the nearest card."

### What was wrong

The carousel used CSS scroll-snap (`scroll-snap-type: x mandatory` plus
`scroll-snap-stop: always` on each cell). There was no JavaScript involved — no wheel
hijacking, no momentum simulation.

Mandatory snap re-targets the nearest card on *every* scroll delta. A trackpad gesture
arrives as many small deltas rather than one large one, so each fragment re-aimed at the
nearest card and the strip fought itself. Measured before the fix, at 1440px, sampling
`scrollLeft` every frame:

- Trackpad gesture (10 × 60px): `110 → 137 → 127 → 184 → 163 → 130 → 183 → 48 → 0`
  — **net zero travel with a visible wobble.**
- One 120px wheel notch: `0 → 118 → 80 → 23 → 0` — sprang back to the start.

### What changed

`site/app/globals.css`
- `.work-marquee`: deleted `scroll-snap-type: x mandatory`, added
  `overscroll-behavior-x: contain`.
  - X-axis only on purpose: `overflow-x: auto` computes `overflow-y` to `auto` too, so an
    unqualified `overscroll-behavior: contain` would also trap vertical swipe chaining and
    stop the page scrolling when a touch gesture starts on a card.
- `.work-marquee-cell`: the whole rule (`scroll-snap-align: start` +
  `scroll-snap-stop: always`) deleted. The class remains in the markup as the layout hook.
- `scroll-padding-inline: var(--mq-inset)` **kept** — with snap gone it still governs
  focus and `scrollIntoView`, which is what lands a keyboard-tabbed card on the slot.
- Header comment rewritten to record why snap must not be reintroduced.

`site/components/CaseStudyList.tsx` (`StudyMarquee`)
- The scroll handler previously ran `querySelector` + `offsetWidth` on **every scroll
  event**, forcing a synchronous layout each time. Snap kept gestures short so this was
  cheap; free scrolling emits long 60–120Hz event trains on a page that already runs nine
  always-on WebGL backdrops.
- Cell stride is now measured once and cached in a ref, refreshed by a `ResizeObserver`.
- Scroll events are coalesced to one read per frame via `requestAnimationFrame`, with the
  pending frame cancelled on unmount.

### Verified (measured in a real browser, not eyeballed)

At 1440×900, dispatching real wheel events over the marquee and sampling `scrollLeft`
per frame:

| Gesture | Result | Backsteps |
|---|---|---|
| Trackpad, 10 × 60px | `0 → 60 → 120 → … → 600`, holds at 600 | 0 |
| Single 120px wheel notch | `0 → 120`, holds | 0 |
| Fling, 6 × 200px | `0 → 1200` monotonic | 0 |

"Backsteps" counts any frame where the strip travelled backwards more than 1px — i.e. the
spring-back signature of the old behaviour. Zero in all three cases.

Also confirmed:
- Computed styles: `scroll-snap-type: none`, `scroll-snap-align: none`,
  `overscroll-behavior-x: contain`, `overscroll-behavior-y: auto` (vertical page-scroll
  chaining preserved).
- Focused-card tracking still works — at slot positions 0/544/1088/1632/2176 the
  highlighted card is index 0/1/2/3/4 respectively.
- At 390px: no page-level horizontal overflow (`scrollWidth` 390 = viewport 390),
  `touch-action: auto` so native touch scrolling applies, strip reaches its end.
- 0 console errors, 0 console warnings.
- `npx tsc --noEmit` clean.

### Behaviour change worth knowing

Keyboard-tabbing to a card no longer pixel-aligns it to the slot — the browser now scrolls
the minimum amount to bring it into view (measured 78px off the slot). The **correct card
still receives the focused/expanded state**, which is the functional requirement. This is a
consequence of removing snap and is judged acceptable; restoring exact alignment would need
JS `scrollIntoView` on focus.

### Revert

```
git checkout pre-multiagent-audit -- site/app/globals.css site/components/CaseStudyList.tsx
```
(reverts the token swaps in those two files as well — see section 2)

### Pre-existing quirk, unchanged

The 8th card can never quite reach the slot (max scroll 3652 vs. 3808 required) because
the track's mirrored right padding is smaller than `clientWidth − cellWidth`. This was true
under snap and is still true now. Not introduced or fixed here.

---

## 2. Design token binding

See `2026-08-05-token-swaps-applied.md` for the executed list and the values that still
need a design decision.

---

## 3. Technical and performance fixes

*(pending — filled in as fixes land)*

---

## 4. UX findings

See `2026-08-05-ux-design-audit.md`.

---

## Stale documentation found along the way

- `.claude/rules/homepage.md` still documents a **"Card/List View Toggle"** with
  localStorage key `work-view-mode`, `CaseStudyListRow`, and an AnimatePresence blur
  transition. None of that exists any more: `ViewToggleButton` is defined in
  `CaseStudyList.tsx` but never rendered, there is no `viewMode` state, and `GalleryIcon`
  is imported unused. The rules file needs correcting.
- `site/lib/carousel-transition.ts` is dead code — exported, imported nowhere.

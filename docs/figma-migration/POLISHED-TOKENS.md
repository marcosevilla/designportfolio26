# Canary Polished Design Tokens + Restyle Pipeline

Built 2026-08-02. Working file: **Canary Polished Visuals**
`https://www.figma.com/design/OclYC5ytIQc9HAuJMRXUaz/Canary-Polished-Visuals`

| Page | ID | What |
|------|----|------|
| 🎬 Case Study Visuals | `1:4` | The 72 verified 1:1 captures (duplicated from Portfolio Aug 2026) |
| -> Case Study Visuals (Polished) | `1:2` | Restyle target page |
| 🎨 Polished Tokens | `3:2` | Token spec sheet (root frame `3:105`) |
| 📁 Backup File Index | `1:3` | Backup audit |

Source of the old system: **🧩 Component Library** `tqv9ywljxiLpBuFPWnDr2b` — 48 pages.
⚠️ `get_metadata` only lists *loaded* pages (showed 1). Use `use_figma` + `figma.root.children` to see all 48.

---

## Why the old system read unpolished (diagnosis)

**Canary Component Library:**
- **Zero published styles** — 0 paint, 0 text, 0 effect styles. Only 2 variable collections (`Primitives` 20 vars, `Theme` 6 vars w/ Round/Square/Circular radius modes). Nothing enforced the system, so drift was guaranteed.
- Type: Roboto, 11 sizes × 3 weights, **every size locked to exactly 1.5× line-height** (10/16 → 56/84). Display type at 1.5 leading reads slack.
- Bold styles carry **+2% letter-spacing** — backwards; large bold text wants negative tracking.
- Color: 44 hexes, 9 families × 5. Charcoal ramp is **pure hueless neutral** (`#000/#333/#666/#999/#ccc`) — reads cold.
- **Two competing blues** with no defined roles: Canary Blue `#1c91fa`, Blue `#2858c4`.

**The 72 extracted frames** (21,693 nodes scanned):

| | Canary system | Frames |
|---|---|---|
| Font sizes | 11 | **32** |
| Line heights | 11 | **90** |
| Colors | 44 | **223** (53 text / 109 bg / 61 stroke) |
| Radii | 3 modes | **26** |
| Padding values | — | **41** |

Two causes: (1) **Tailwind v4's palette collided with Canary's** — `#6a7282`, `#364153`, `#4a5565`, `#99a1af`, `#101828`, `#e5e7eb` are Tailwind grays; `#90a1b9`, `#314158`, `#0f172a` are its slate. (2) Browser-computed junk: font sizes 8.4/9.6/13.2/17.998px, radii `33554400` and `18641400`.

Good news: **51% of nodes are auto-layout** (11,114) — restyling doesn't require rebuilding.

---

## The token system

Decisions: **Inter** (Marco, 2026-08-02) · **primary `#2858c4`** (dominates real frames 391:16 over Canary Blue).

### Collections
| Collection | ID | Vars |
|---|---|---|
| Color / Primitives | `VariableCollectionId:3:3` | 36 |
| Color / Semantic | `VariableCollectionId:3:40` | 23 |
| Space | `VariableCollectionId:3:64` | 11 |
| Radius | `VariableCollectionId:3:76` | 6 |

### Color primitives
```
neutral  0 #ffffff · 50 #f7f8fa · 100 #eef0f4 · 200 #e2e5eb · 300 #cbd0da · 400 #9aa2b1
         500 #6b7484 · 600 #4d5563 · 700 #3a4150 · 800 #262c38 · 900 #131822
primary  50 #eef2fc · 100 #dbe3f8 · 200 #b8c7f1 · 300 #8fa6e6 · 400 #6480d8
         500 #2858c4 · 600 #2149a6 · 700 #1b3c88 · 800 #17316d · 900 #132750
success  50 #e8f6ef · 100 #b7e2cd · 500 #0f7a4a · 600 #0c6440 · 700 #094f33
warning  50 #fdf3e2 · 100 #f5dcae · 500 #9a6100 · 600 #7d4f00 · 700 #613d00
danger   50 #fdeaee · 100 #f6c2cd · 500 #c8203f · 600 #a81834 · 700 #8a1329
```
Neutrals carry a deliberate cool cast (fixes Canary's hueless grays). Warning is desaturated to pass AA on white — Canary's `#fab541` doesn't. **Open: Marco may find it too brown.**

### Semantic aliases
`bg/` canvas·subtle·muted·inverse·accent·accent-hover·accent-subtle·success-subtle·warning-subtle·danger-subtle
`text/` primary·secondary·tertiary·disabled·inverse·accent·success·warning·danger
`border/` subtle·default·strong·accent

### Type ramp (18 text styles, Inter)
Line-height ratio **tightens** as size grows; tracking goes **negative** on large text.

| Style | Size/LH | Tracking | Weights |
|---|---|---|---|
| Micro | 11/16 | +4% | Regular, Medium, Semi Bold |
| Caption | 12/18 | +0.5% | Regular, Medium |
| Body S | 13/18 | 0 | Regular, Medium |
| Body | 14/20 | 0 | Regular, Medium, Semi Bold |
| Body L | 16/24 | −0.5% | Regular, Medium, Semi Bold |
| Title S | 20/28 | −1% | Medium, Semi Bold |
| Title | 24/32 | −1.5% | Medium, Semi Bold |
| Display | 32/40 | −2% | Semi Bold |

Weight map: Thin/ExtraLight/Light/Regular → **Regular** · Medium → **Medium** · SemiBold/Bold/ExtraBold/Black → **Semi Bold**

### Space / Radius / Elevation
```
space   2 4 6 8 12 16 20 24 32 40 48
radius  xs 2 · sm 4 · md 8 · lg 12 · xl 16 · full 9999
elev    sm / md / lg / overlay — 2 layers each, one light source, ink #131822
```

---

## The restyle pipeline (3 passes)

Always **clone the source frame first** — the 🎬 captures are the verified record and the color pass is destructive (binding overwrites original hex; you cannot re-derive it).

**Pass 1 — Typography.** Map family → Inter, snap size to nearest ramp step (clamp minimum to 11), apply that step's line-height + tracking. Handle `figma.mixed` via `getStyledTextSegments`.

**Pass 2 — Color.** For each solid fill/stroke: RGB → HSL, pick family, then nearest step **by lightness**, then `setBoundVariableForPaint` to the primitive.

```
if (saturation < 0.35)          -> neutral      // CRITICAL, see below
else if (hue 185–330)           -> primary
else if (hue 90–185)            -> success
else if (hue 25–90)             -> warning
else                            -> danger
```

⚠️ **The 0.35 threshold is the whole ballgame.** First attempt used 0.12 and six Tailwind grays got pulled into the primary ramp — the entire right-hand preview panel turned lavender. Measured separation on real frames:

| | saturation |
|---|---|
| Tailwind blue-tinted neutrals (hue ~218) | 0.121 – 0.200 |
| Genuine brand blues (`#2858c4`, `#2b7fff`) | 0.661 – 1.000 |

Wide safe gap. 0.35 sits comfortably in it.

**Pass 3 — Geometry.** Bind corner radii (≥40 → `full`, else nearest step), force all stroke weights to 1, bind auto-layout gap/padding to space vars where |delta| ≤ 4px.

**Pass 4 — Overflow repair.** Inter is ~7% wider than Roboto. For any TEXT whose parent has `clipsContent` and `text.width > parent.width`, widen the parent.

---

## Test result — Compendium Builder / 03 Edit Item

Source `1:293` (untouched) → polished clone **`13:2`**, sitting 160px to its right on page `1:2`.

324 nodes: **66 text converted · 132 fills + 41 strokes bound · 34 radii bound · 194 spacing bindings · 12 stroke weights normalized · 2 non-solid skipped.**

**Verdict: the system holds.** Only 4 of 66 text nodes needed resizing (8px and 10px strays → 11px); every spacing value was already on-ramp, so nothing shifted.

### Findings
1. **Saturation threshold** — fixed, documented above. Re-clone required after the bad pass, since binding destroys source color.
2. **Inter is wider than Roboto** — "Canary Test Hotel (Demo)" was already clipping by 1px at 162/161 in the source; Inter pushed it to 174/161. Pass 4 widened the parent to 176. Expect a handful per frame.
3. **Ramp snapping does not preserve contrast relationships** — the sidebar wordmark went from invisible to faintly legible. Two colors 0.05 apart in lightness can land on steps 0.09 apart, amplifying or flattening contrast. Not a bug, but audit dark-on-dark and light-on-light pairs after each frame.
4. **Sidebar hue shift is a judgment call** — `#333333` (warm neutral) → `#262c38` (cool navy). Reads more designed, less like shipped Canary. Marco to rule.

### Open
- Warning ramp reads brown — retune?
- Sidebar navy — keep or force sidebar chrome to stay neutral?
- Spec sheet color chips + radius swatches ARE bound to variables; space bars are not.

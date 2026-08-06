# Design Token Binding Audit — 2026-08-05

Read-only audit of how completely the site is bound to its design system across three axes:
**type**, **color**, **spacing**. All paths are relative to `site/`.

Sources of truth consulted: `CLAUDE.md`, `.claude/rules/typography.md`,
`.claude/rules/design-tokens.md`, `.claude/rules/editorial-grid.md`,
`.claude/rules/specimens.md`, `docs/TYPOGRAPHY-BACKLOG.md`, `lib/typography.ts`,
`app/globals.css`.

---

## Executive summary

| Axis | Genuine violations | Verdict |
|------|-------------------|---------|
| **Type** | **79** live sites (60 inline `fontSize` + 18 arbitrary `text-[Npx]` + 1 raw Tailwind size) | Weakest axis. A second, undocumented 10/11/12/13/14px scale lives in chat, nav, modals, TOC and overlays. |
| **Color** | **44** | Strong axis for *hue* — near-total `var(--color-*)` binding. Weak for *shadow* and *scrim*: no token family exists, and the two shadow tokens that DO exist have zero consumers. |
| **Spacing** | **3** | Strongest axis. There is **no spacing token layer at all**, but the Tailwind default 4px scale is followed ~99% of the time, so the system is real even though it's undeclared. |

The single highest-leverage finding is not a violation count — it's that
`--shadow-soft` and `--shadow-soft-lg` are **defined in `@theme` and consumed by
literally nothing**, while their exact string is retyped 3× in `globals.css` and
4× in `lib/gallery-content.ts`.

---

## Token inventory (what exists to bind to)

**Type — 9 tokens** in `lib/typography.ts` (the rule file says 8; `monoLabel` was
added after and makes 9), plus the non-token `serifName` export:

`display` · `title` · `h2` · `h3` · `body` · `subtitle` · `pullQuote` · `label` · `monoLabel`

Adoption (`typescale.*` reference counts across `app/`, `components/`, `lib/`):

```
label      27      body       18      display     9      h3          9
subtitle    7      monoLabel   4      title       3      h2          2
pullQuote   1
```

29 files import from `@/lib/typography`.

**Color — CSS variables** in `app/globals.css` `:root` / `.dark`, overridden at
runtime by `applyColoredTheme()` for 10 colored themes:
`--color-bg` · `--color-fg` · `--color-fg-secondary` · `--color-fg-tertiary` ·
`--color-surface` · `--color-surface-raised` · `--color-card-bg` · `--color-border` ·
`--color-muted` · `--color-accent` · `--color-glow` · `--color-image-outline` ·
`--color-on-accent`.

Plus two shadow tokens in `@theme`: `--shadow-soft`, `--shadow-soft-lg` — **0 consumers**.

**Spacing — nothing.** There is no `tailwind.config.*` file (Tailwind v4, CSS-first),
and `@theme` in `globals.css` declares `--container-*`, `--shadow-*`, `--color-*`,
`--font-sans`, `--default-transition-duration` — and **no `--space-*` / `--spacing`
scale**. Grid geometry is tokenized separately (`--grid-max: 1440px`,
`--grid-gap: 24px`, `CONTENT_BAND = "4-9"`, `CONTENT_BAND_MD = "3-10"`).

---

# AXIS A — TYPE

## A.1 Hardcoded font sizes, non-exempt (histogram)

Distinct raw values found in live production files:

```
 1 × 10px    12 × 11px    21 × 12px     6 × 13px     7 × 14px
 1 × 15px     3 × 16px     2 × 18px     1 × 32px
```

**Only 11px (`label`), 16px (`h3`/`subtitle`) and 15px (`body`) exist as tokens.**
10px, 12px, 13px, 14px, 18px and 32px do not. 12px is the single most common
hardcoded size in the codebase (21 sites) and has **no sans token** — `monoLabel`
is 12px but is mono + uppercase + −0.02em, which none of the 21 match.

## A.2 Violations grouped by file

Legend: token column is which of the 9 typescale tokens the value maps to.

### `components/CaseStudyList.tsx` — 8
| Line | Raw value | Maps to |
|------|-----------|---------|
| 294–298 | mono 12px / 500 / uppercase / `0.08em` / 1.4 | `monoLabel` **except tracking** — backlog ⑧ |
| 515–518 | mono `calc(14px + offset)` / 400 / uppercase / `−0.02em` / `22.4px` | no token — SectionLabel |
| 546–549 | sans `calc(14px + offset)` / 500 / `−0.01em` / `22px` | no token — marquee card title (rule says deliberate) |
| 561–565 | mono `calc(12px + offset)` / 400 / uppercase / `−0.02em` / `22px` | no token — marquee meta |
| 590–592 | sans `calc(14px + offset)` / 400 / `22.4px` | no token — marquee description |
| 746–748 | sans `calc(16px + offset)` / 500 / `−0.01em` | **`h3`** (lineHeight delta only) |
| 757–759 | mono 11px / uppercase / `0.08em` | no token |
| 996–998 | mono 11px / uppercase / `0.08em` | no token — **byte-identical to 757** |

⚠️ This file alone expresses "14px text" with **three** different line-heights:
`22.4px` (×2), `22px` (×1), and inherited `1.6`.

### `components/PasswordModal.tsx` — 6
| Line | Raw | Maps to |
|------|-----|---------|
| 148–151 | 12px / 500 / `0.08em` | no token |
| 169–172 | 12px / 500 / `0.08em` | no token — identical to 148 |
| 191–194 | 13px / `0.06em` | no token |
| 221–223 | 16px / `0.08em` | no token |
| 234–237 | 12px / 500 / `0.08em` | no token — identical to 148 |
| 254 | 13px | no token |

### `components/ChangelogOverlay.tsx` — 5
| Line | Raw | Maps to |
|------|-----|---------|
| 69–73 | sans 16 / 500 / `−0.01em` / lh 1 | **`h3`** (lineHeight delta) |
| 81–85 | mono 11 / 500 / `0.04em` / lh 1 | no token |
| 110–115 | mono 11 / 500 / `0.08em` / uppercase / lh 1 | no token |
| 145–149 | sans 14 / 500 / `−0.01em` / 1.4 | no token |
| 159–163 | sans 13 / 400 / `−0.005em` / 1.55 | no token — `−0.005em` is a one-off |

### `components/Hero.tsx` — 5
| Line | Raw | Maps to |
|------|-----|---------|
| 28–31 | mono 11px / 500 / uppercase / `0.06em` | no token |
| 47–48 | sans 14px / 1.4 | no token |
| 59–60 | mono 11px / 1.4 | no token |
| 86–90 | mono 11 / 500 / lh 1 / uppercase / `0.04em` | no token — 3rd tracking value in one file |
| 417–421 | mono 12px / 500 / uppercase / `0.08em` / lh 1 | `monoLabel` except tracking — backlog ⑧ |

Exempt within this file: 206, 215, 373 (`var(--wordmark-fontsize, 48px)`, `1em`,
`0.62em`) — brand-mark relative sizing.

### `components/chat/ChatPanel.tsx` — 5
| Line | Raw | Maps to |
|------|-----|---------|
| 70–73 | 14px / `26px` | no token |
| 292–295 | 15px / 500 / lh 1 | `body` size, wrong weight/lh |
| 303–308 | 10px / 500 / `0.08em` / lh 1 | **smallest text on the site**, no token |
| 370 | 13px | no token |
| 413 | `text-[16px] lg:text-[14px]` (className) | no token |

Line 108 (`fontSize: "1em"`) is relative — exempt.

### `app/work/knowledge-base/KnowledgeBaseContent.tsx` — 5
- `:39` — the 6-property italic hero subtitle (18 / `26px` / `0.02em` / 400 / explicit Geist). **Backlog ③.**
- `:151, 160, 169, 178` — `text-[15px] text-(--color-fg-tertiary)` ×4. **Backlog ⑥.**

### `app/work/upsells/UpsellsContent.tsx` — 5
- `:191, 200, 209, 218, 227` — `text-[15px] text-(--color-fg-tertiary)` ×5. **Backlog ⑥.**
  Since body dropped 17→15px these are now the *same size as body copy* and carry no
  size de-emphasis at all.

### `components/LockGate.tsx` — 4
`:142–145` (11px/500/`0.08em`), `:261–264`, `:284–287`, `:306–309` (12px/500/`0.08em` ×3, identical).

### `components/case-study/InlineTOC.tsx` — 3
`:76–81`, `:100–102`, `:135–139` — mono 12px / 500 / uppercase / `0.08em` / `20px`,
**three byte-identical copies inside one file**.

### `components/case-study/StudyMetaRow.tsx` — 3
`:139`, `:151–153`, `:179–181` — sans 12 / 500 / 1.4 ×3, identical. No sans-12 token exists.
⚠️ Backlog ⑤ describes this file as hardcoding `11`/`14`; it now hardcodes `12` — the
backlog entry is stale.

### `components/DemoStage.tsx` — 2
`:147–149`, `:185–187` — 13 / 500 / lh 1 ×2, identical (fullscreen chrome + Try-demo pill).

### `components/HamburgerMenu.tsx` — 2
`:51–55` (12px / 500 / `0.08em` / lh 1), `:219–222` (**32px** / 500 / `−0.02em` / 1.15).
The 32px is not a micro-label — backlog ① explicitly warns not to sweep it in with the
overlay group.

### `components/HomeNav.tsx` — 2
`:197–204`, `:249–253` — mono 12px / 500 / uppercase / `0.08em`, near-identical pair
(lh `1` vs `20px`).

### `components/chat/ChatMessage.tsx` — 2
`:108–109`, `:126–127` — 14px / `22px` ×2, identical. (`:138` `1.7em` is the brand-mark
cursor — exempt.)

### `components/chat/CaseStudyCardUnfurl.tsx` — 2
`:39–42` (sans 14px/500/1.3), `:51` (mono 11px).

### Single-site files
| File:line | Raw | Note |
|-----------|-----|------|
| `app/work/ai-workflow/AIWorkflowContent.tsx:46–52` | italic 18 / `26px` / `0.02em` / 400 | **byte-identical to KnowledgeBaseContent:39** — backlog ③ |
| `components/HomeLayout.tsx:290–292` | `calc(15px + offset)` / 1.647 / `−0.01em` | **exactly `typescale.body`** → mechanical swap |
| `components/HomeLayout.tsx:333` | `text-sm` | only raw Tailwind size in production |
| `components/Testimonials.tsx:28–30` | mono 11px / 1.4 / `0.02em` | no token |
| `components/LocalStatus.tsx:153–155` | mono 11px / `15px` / 400 | no token; fixed-geometry (backlog ① LEAVE FIXED) |
| `components/NavOverlay.tsx:233–237` | 12 / 500 / `22px` / `0.08em` | no token |
| `components/MobileNav.tsx:28–31` | 12px / 500 / `0.08em` | no token |
| `components/chat/ChipPrompt.tsx:28–30` | 12px / 500 / 1.3 | no token |
| `components/chat/ChatMessageActions.tsx:52` | mono 11px | no token |
| `components/chat/ChatBar.tsx:328–333` | 12px / 500 / `0.06em` / lh 1 | no token |
| `components/CustomCursor.tsx:124–127` | 14 / 500 / `−0.01em` / `20px` | no token |
| `components/case-study/QuickStats.tsx:26` | `text-[14px]` | no token |
| `components/case-study/PullQuote.tsx:23` | `text-[14px]` | no token |
| `components/case-study/NextProject.tsx:26` | `text-[13px] uppercase tracking-widest` | no token |
| `components/case-study/Acknowledgements.tsx:21` | `text-[13px] uppercase tracking-widest` | **byte-identical className to NextProject:26** |
| `app/work/compendium/CompendiumContent.tsx:97` | `text-[13px]` | no token |
| `components/case-study/ImagePlaceholder.tsx:22, 26` | `text-[13px]`, `text-[10px]` | dev-affordance component |

### CSS-level type outside the token system (`app/globals.css`)
| Line | Value | Note |
|------|-------|------|
| 251 | `font-size: 0.875rem` (skip-to-content) | only `rem` font-size in the codebase |
| 280 | `font-size: 9px` (`.dotted-link-arrow`) | smallest type on the site |
| 618 | `font-size: 20px` (`.cycling-greeting-cursor`) | comment says "absolute size, sized against the 18px italic tagline" — deliberate |

## A.3 Dead files carrying type violations — do NOT fix, delete instead

| File | Sites | Evidence |
|------|-------|----------|
| `components/WorkHistory.tsx` | 4 (`:64, 76, 89, 107`) | **zero importers** — `rg 'WorkHistory'` returns only the file itself |
| `components/SiteHeader.tsx` | 1 (`:99`) | unmounted site-wide 2026-07-20; only referenced in comments |

These 5 sites are excluded from the 79-violation count.

---

# AXIS B — COLOR

## B.1 The good news

Hue binding is close to total. Across all non-exempt production files there are
**exactly 2** raw Tailwind palette classes:

- `components/case-study/ImagePlaceholder.tsx:26` — `bg-red-500/90 ... text-white`
- `components/DemoStage.tsx:135` — `text-white/70 ... hover:text-white`

Every other `text-*` / `bg-*` / `border-*` in production uses
`text-(--color-fg-secondary)` style var syntax. That is a genuinely well-bound system.

## B.2 Violations

### B.2.a — Modal/lightbox scrims: 4 opacities, no token (**strongest tokenize-me signal on this axis**)
| File:line | Value |
|-----------|-------|
| `components/chat/ChatBar.tsx:426` | `rgba(0, 0, 0, 0.35)` |
| `components/PasswordModal.tsx:83` | `rgba(0,0,0,0.45)` |
| `components/CaseStudyList.tsx:894` | `rgba(0, 0, 0, 0.72)` |
| `components/DemoStage.tsx:78` | `rgba(8,8,8,0.78)` (`SCRIM_TINT`) |

Four overlays, four different blacks, four different alphas, zero shared token.
There is no `--color-scrim`. **Needs a design decision** (Marco picks the canonical
scrim), then it's a 4-line swap.

### B.2.b — Box-shadows: two tokens exist, both unused; the string is retyped 17×
`--shadow-soft: 0 1px 2px rgba(0, 0, 0, 0.04)` and
`--shadow-soft-lg: 0 4px 12px rgba(0, 0, 0, 0.06)` are declared in `@theme`
(`globals.css:21–22`) and consumed by **nothing**.

Byte-identical to `--shadow-soft`, retyped:
- `app/globals.css:833` (`.chat-input-field`)
- `app/globals.css:844` (`.chat-input-field:focus-within`)
- `app/globals.css:899` (`.chat-surface`)
- `lib/gallery-content.ts:91, 120, 137, 155` (inside a 3-stop `drop-shadow` string)

Other untokenized shadow stacks (each a one-off, no token family exists):
| File:line | Note |
|-----------|------|
| `lib/gallery-content.ts:91, 120, 137, 155` | **4 byte-identical 3-stop drop-shadow strings** |
| `components/ChatFab.tsx:64` | |
| `components/chat/ChatBar.tsx:298` | |
| `components/CustomCursor.tsx:129` | |
| `components/FnbDitherFrame.tsx:58` | |
| `components/NavOverlay.tsx:216` | |
| `components/music/MusicPlayerPanel.tsx:130, 206` | |
| `components/DemoStage.tsx:195, 725` | dark chrome |
| `components/DeviceShell.tsx:15` | `SHELL_SHADOW` — see B.3 |
| `app/globals.css:393–395, 442–445, 450–453, 937, 965–968` | 5 more inline stacks |

### B.2.c — Dark-chrome literals in `DemoStage.tsx` (10 sites)
`:143, 144, 190, 191, 359, 400, 506, 509, 720, 721` — `rgba(255,255,255,·)` and
`rgba(20,20,22,·)` / `rgba(8,8,8,·)`.

Per `.claude/rules/specimens.md`, the Try-demo pill and fullscreen chrome
"float over live product UI, so [they carry their] own drop shadow + backdrop blur
for contrast rather than relying on whatever is underneath." The *intent* is
sanctioned; the *values* are still untokenized. Recommend a small
`--color-chrome-on-dark-*` family or a local `DARK_CHROME` const in the file.
**Design decision, low urgency.**

### B.2.d — Hex literals that restate a token's value (silent-drift risk)
| File:line | Value | Restates |
|-----------|-------|----------|
| `components/PaletteSwatches.tsx:75` | `#1a1a1a` ×2, `#ededed` ×2 | light `--color-fg` and dark `--color-fg` |
| `components/CustomCursor.tsx:39` | `\|\| "#1a1a1a"` | light `--color-fg` fallback |
| `components/CustomCursor.tsx:40` | `\|\| "#ffffff"` | light `--color-bg` fallback |
| `app/work/fb-ordering/FBOrderingContent.tsx:32` | `#EF5A3C` | **same hex as** `lib/chat/study-metadata.ts:39` (fb-ordering gradient start) |

PaletteSwatches genuinely needs both modes' `fg` visible simultaneously, so a var
can't do it directly — but the values should be hoisted to named constants so a
theme change can't silently desync the mono swatch.

### B.2.e — One-off white sheen expressed 2 ways
- `components/Hero.tsx:237` — `rgba(255,255,255,0.95)` inside the wordmark shimmer gradient
- `app/globals.css:574` — the same sheen concept as `color-mix(in srgb, var(--color-accent) 25%, white 75%)`

Same visual effect, two implementations, only one of which follows the theme.

### B.2.f — Syntax hygiene
- `components/case-study/ProjectDetails.tsx:60` — `text-[var(--color-fg-secondary)]`
  (legacy arbitrary-value syntax). Every other site uses `text-(--color-fg-secondary)`.
  Identical output; the odd one out.

## B.3 Color exemptions — verified, do NOT count

| Scope | Sites | Verification |
|-------|-------|--------------|
| `components/fb-showcase/**` | ~90 hex + rgba (`canary-polished-tokens.ts` 38, `fnb-specimen-data.ts` 12, `FnbCartSpecimen.tsx` 17, `OrderDashboardSpecimen.tsx` 10, `BrowserMockup.tsx` 9, `SystemArchitecture.tsx` 4, `OutletDetailsSpecimen.tsx` 5, `ObjectFlowDiagram.tsx` 3, `OutletConfigSpecimen.tsx` 4, `ItemLibrarySpecimen.tsx` 1, `admin-shell.tsx` 1) | **Confirmed** by `.claude/rules/specimens.md`: "`canary-polished-tokens.ts` — Inter ramp / `#2858c4` primary / cool neutrals … **This is SHARED infra — import it, don't re-transcribe.**" and by `.claude/rules/design-tokens.md`: "Inter is loaded … as a PRODUCT typeface only … Site chrome stays Geist." The specimens recreate Canary's product UI and must NOT follow the site theme. |
| `components/ThemeToggle.tsx` | 66 hex, 22 rgba | This file **is** the token definition layer — `applyColoredTheme()` writes the 10 colored themes into the CSS vars. Literals here are the source of truth, not drift. |
| `lib/playlist.ts` | 44 hex | Album-artwork accent data (content, not chrome). |
| `components/Resume.tsx` | 6 hex, 3 rgba | Named exemption in `TYPOGRAPHY-BACKLOG.md` — self-contained document. |
| `app/dev/**`, `components/dev/**`, `components/type-tuner/**` | ~30 hex + all 78 Tailwind palette classes | `notFound()` in prod. |
| Mask gradients | `Testimonials.tsx:103, 105` (`#000` in `maskImage`), `CursorGlowOverlay.tsx:64` (`#fff` in `mask`), `DitherBackdrop.tsx:182` (`#00000000`) | These are alpha channels, not colors. |
| Computed values | `BackgroundTexture.tsx:81, 242`, `LedMatrix.tsx:138–140` | Parsed from CSS vars / HSL math at runtime. |
| `lib/chat/study-metadata.ts:39–102` | 16 hex (8 gradient pairs) | Per-study brand gradients — content data, one per case study. ⚠️ But see B.2.d: `#EF5A3C` is duplicated into `FBOrderingContent.tsx:32`. |

---

# AXIS C — SPACING

## C.1 Does a spacing scale exist? **No.**

Plainly: **there is no spacing token set in this codebase.**

- There is no `tailwind.config.js` / `.ts` / `.mjs` anywhere in `site/` (Tailwind v4,
  CSS-first configuration).
- `@theme` in `app/globals.css:7–25` declares `--font-sans`, `--container-content*`,
  four `--color-*`, two `--shadow-*`, and `--default-transition-duration`.
  **No `--space-*`, no `--spacing`.**
- `rg -- '--space|--spacing' app/globals.css` returns nothing.

What *is* systematized:
- **Grid**: `--grid-max: 1440px`, `--grid-gap: 24px` (`globals.css:1112–1113`),
  `CONTENT_BAND = "4-9"` / `CONTENT_BAND_MD = "3-10"` (`lib/layout-presets.ts:24, 31`),
  used at 25+ call sites across `HomeLayout`, `CaseStudyShell`, `CaseStudyList`, and
  all case-study Content files.
- **48px header rhythm**: `HomeLayout.tsx:206` (`paddingTop: "48px"`),
  `HomeLayout.tsx:249` (`gap-12`), `Hero.tsx:407`, `:444`, `:467`, `:472` (`mt-12`),
  `GlobalToolbar.tsx:66` (`pt-12`). Toolbar → name → bio, 48px apart at each step,
  on both home and About. This is real, documented, and consistently applied — it is
  just expressed three different ways (`"48px"` inline, `gap-12`, `mt-12`/`pt-12`).

## C.2 Genuine violations — 3

| File:line | Value | Note |
|-----------|-------|------|
| `components/HomeLayout.tsx:390` | `mt-[100px]` | off-grid (100 ≠ 4n step; nearest are `mt-24`=96 and `mt-25`=100 which exists in v4) |
| `components/HomeLayout.tsx:406` | `mt-[100px]` | same value, same file — should be one constant |
| `components/case-study/CaseStudyShell.tsx:41` + `components/case-study/InlineTOC.tsx:56` | `lg:pt-[18vh]` / `top-[18vh]` | **coupled magic number across two files** — the TOC's top must track the canvas's top padding, but nothing enforces it |

That is the entire list. Across all non-exempt production files, arbitrary
`p-[…]` / `m-[…]` / `gap-[…]` values number **3 total**.

## C.3 Arbitrary sizing that is legitimately arbitrary (not violations)

These are component geometry, not spacing rhythm — a scale would not help:

`StudyMetaRow.tsx:101` `sm:min-h-[22px]` · `ProgressBar.tsx:31` `h-[2px]` ·
`ProjectDetails.tsx:37` `w-[7px]` · `LockGate.tsx:188` `min-h-[60vh]` ·
`app/resume/page.tsx:9` `max-w-[720px]` · `HomeLayout.tsx:333` `max-w-[340px]` ·
`PasswordModal.tsx:89` `max-w-[420px]` · `ChangelogOverlay.tsx:60` `max-w-[560px]` ·
`CaseStudyList.tsx:493` `w-[520px] max-w-[80vw]` · `CaseStudyList.tsx:970`
`h-[323px]` / `max-w-[420px]` / `h-[560px] lg:h-[640px]` ·
`MusicPlayerPanel.tsx:199` `max-w-[calc(100vw-16px)]` ·
`chat/ChatMessage.tsx:103` `max-w-[80%]`

## C.4 The de-facto spacing scale (derived, not invented)

Frequency of every Tailwind spacing utility across non-exempt production files
(`p*`, `m*`, `gap*`, `space-*`), converted from step to px:

| px | Step | Uses | What it does in practice |
|----|------|------|--------------------------|
| 4px | `1` | 34 | icon↔label gap |
| 6px | `1.5` | 17 | tight icon gap |
| **8px** | `2` | **102** | tight inline gap (most-used value on the site) |
| 10px | `2.5` | 9 | — |
| **12px** | `3` | **65** | control padding, list gap |
| **16px** | `4` | **49** | block padding, page gutter (`px-4`) |
| **20px** | `5` | **93** | paragraph rhythm (`mb-5` alone is 57 uses) |
| **24px** | `6` | **41** | grid gutter — equals `--grid-gap` |
| **32px** | `8` | **76** | block separation, desktop gutter (`px-8`) |
| 40px | `10` | 12 | — |
| **48px** | `12` | **16** | **the header rhythm** |
| 64px | `16` | 17 | — |
| 80px | `20` | 9 | — |
| 96px | `24` | 14 | — |
| **128px** | `32` | **52** | section rhythm (`pt-32` alone is 48 uses) |
| 192px | `48` | 2 | — |

Inline `style={{ padding/margin/gap }}` px values (149 declarations, non-exempt)
land on: `0, 1, 2, 3, 4, 6, 7, 8, 10, 12, 16, 20, 24, 32, 48` — every one on the
4px grid except `7` (which is `PEEK/2` arithmetic in `StudyMetaRow.tsx:160–161`,
derived not authored) and the 1/2/3 hairlines.

**Recommendation: do NOT mint `--space-*` CSS variables.** The Tailwind default
scale already *is* the token set, adoption is ~99%, and adding a parallel var layer
would create two ways to say 8px. Instead, **document the 9 load-bearing rungs
above as the sanctioned set** in `.claude/rules/editorial-grid.md`, and add one
rule: any padding/margin/gap not on this list needs a comment explaining why.

The one thing worth actually tokenizing is the 48px header rhythm, which is
currently the string `"48px"` in one place and `gap-12`/`mt-12`/`pt-12` in five
others — a `--header-rhythm: 48px` var (or an exported `HEADER_RHYTHM` const)
would make the relationship legible.

---

# Values expressed 3+ ways (the tokenization argument)

These are the strongest cases — the same visual intent, restated incompatibly.

| # | Concept | Ways expressed | Sites |
|---|---------|----------------|-------|
| 1 | **Mono-uppercase micro-label tracking** | `0.08em` (28×), `−0.02em` (`monoLabel` token + 3 marquee sites), `0.06em` (2×), `0.04em` (2×), `0.02em` (3×), `tracking-widest` (2×) | **6 different values** for one visual role. Backlog ⑧ already rules the answer is `−0.02em`; migration is a visible site-wide change. |
| 2 | **Mono font family** | inline `"var(--font-geist-mono), ui-monospace, Menlo, monospace"` (**37×**), the `--font-mono-system` CSS var (fb-showcase only, 9×), `typescale.monoLabel.fontFamily` (1×) | The var exists and site chrome ignores it. |
| 3 | **Box-shadow "soft" lift** | `--shadow-soft` token (0 consumers), literal `0 1px 2px rgba(0,0,0,0.04)` in globals.css (3×), same string inside gallery-content drop-shadows (4×), plus 13 one-off stacks | See B.2.b. |
| 4 | **Modal scrim** | `rgba(0,0,0,0.35)`, `rgba(0,0,0,0.45)`, `rgba(0,0,0,0.72)`, `rgba(8,8,8,0.78)` | **4 values, 4 files.** See B.2.a. |
| 5 | **Line-height for 14px text** | `"22.4px"` (2×), `"22px"` (10×), `1.4` (2×), inherited `1.6` | 4 ways, and the px ones are exactly the bug `.claude/rules/typography.md` warns about (px line-heights don't track `--font-size-offset`). |
| 6 | **Sans font family** | `var(--font-sans)` (majority), `"var(--font-geist-sans), system-ui, sans-serif"` (10×) | Two spellings of the same stack. |
| 7 | **48px header rhythm** | `paddingTop: "48px"`, `gap-12`, `mt-12`, `pt-12` | 4 spellings, no shared constant. |
| 8 | **Case-study eyebrow label** | `text-[13px] uppercase tracking-widest text-(--color-fg-tertiary)` in `NextProject.tsx:26` and `Acknowledgements.tsx:21` — byte-identical classNames, no shared component | |
| 9 | **Italic hero subtitle** | identical 6-property inline object in `AIWorkflowContent.tsx:46–52` and `KnowledgeBaseContent.tsx:39` | Backlog ③. |
| 10 | **Device/shell drop shadow** | `"0 1px 2px rgba(0,0,0,0.05), 0 12px 28px rgba(0,0,0,0.08), 0 32px 56px rgba(0,0,0,0.06)"` byte-identical in `DeviceShell.tsx:15`, `fb-showcase/admin-shell.tsx:29`, `fb-showcase/FnbCartSpecimen.tsx:1958` | ⚠️ **Partly sanctioned** — `specimens.md` says "keep the two copies in sync". Deduping crosses the site-chrome ↔ specimen boundary; flagged as observation only. |

---

# Summary table — violations per file

Only files with ≥1 genuine violation. Sorted by total.

| File | Type | Color | Spacing | Total |
|------|------|-------|---------|-------|
| `components/DemoStage.tsx` | 2 | 13 | 0 | **15** |
| `components/CaseStudyList.tsx` | 8 | 1 | 0 | **9** |
| `app/globals.css` | 3 | 8 | 0 | **11** |
| `components/PasswordModal.tsx` | 6 | 1 | 0 | **7** |
| `components/Hero.tsx` | 5 | 1 | 0 | **6** |
| `components/chat/ChatPanel.tsx` | 5 | 0 | 0 | **5** |
| `components/ChangelogOverlay.tsx` | 5 | 0 | 0 | **5** |
| `app/work/knowledge-base/KnowledgeBaseContent.tsx` | 5 | 0 | 0 | **5** |
| `app/work/upsells/UpsellsContent.tsx` | 5 | 0 | 0 | **5** |
| `lib/gallery-content.ts` | 0 | 4 | 0 | **4** |
| `components/LockGate.tsx` | 4 | 0 | 0 | **4** |
| `components/case-study/InlineTOC.tsx` | 3 | 0 | 1 | **4** |
| `components/HomeLayout.tsx` | 2 | 0 | 2 | **4** |
| `components/case-study/StudyMetaRow.tsx` | 3 | 0 | 0 | **3** |
| `components/CustomCursor.tsx` | 1 | 2 | 0 | **3** |
| `components/chat/ChatBar.tsx` | 1 | 2 | 0 | **3** |
| `components/HamburgerMenu.tsx` | 2 | 0 | 0 | **2** |
| `components/HomeNav.tsx` | 2 | 0 | 0 | **2** |
| `components/chat/ChatMessage.tsx` | 2 | 0 | 0 | **2** |
| `components/chat/CaseStudyCardUnfurl.tsx` | 2 | 0 | 0 | **2** |
| `components/case-study/ImagePlaceholder.tsx` | 2 | 1* | 0 | **2** |
| `components/music/MusicPlayerPanel.tsx` | 0 | 2 | 0 | **2** |
| `components/PaletteSwatches.tsx` | 0 | 2 | 0 | **2** |
| `components/case-study/NextProject.tsx` | 1 | 0 | 0 | **1** |
| `components/case-study/Acknowledgements.tsx` | 1 | 0 | 0 | **1** |
| `components/case-study/QuickStats.tsx` | 1 | 0 | 0 | **1** |
| `components/case-study/PullQuote.tsx` | 1 | 0 | 0 | **1** |
| `components/case-study/ProjectDetails.tsx` | 0 | 1 | 0 | **1** |
| `components/case-study/CaseStudyShell.tsx` | 0 | 0 | 1 | **1** |
| `app/work/ai-workflow/AIWorkflowContent.tsx` | 1 | 0 | 0 | **1** |
| `app/work/compendium/CompendiumContent.tsx` | 1 | 0 | 0 | **1** |
| `components/Testimonials.tsx` | 1 | 0 | 0 | **1** |
| `components/LocalStatus.tsx` | 1 | 0 | 0 | **1** |
| `components/NavOverlay.tsx` | 1 | 1 | 0 | **2** |
| `components/MobileNav.tsx` | 1 | 0 | 0 | **1** |
| `components/chat/ChipPrompt.tsx` | 1 | 0 | 0 | **1** |
| `components/chat/ChatMessageActions.tsx` | 1 | 0 | 0 | **1** |
| `components/ChatFab.tsx` | 0 | 1 | 0 | **1** |
| `components/FnbDitherFrame.tsx` | 0 | 1 | 0 | **1** |
| `components/DeviceShell.tsx` | 0 | 1 | 0 | **1** |
| `app/work/fb-ordering/FBOrderingContent.tsx` | 0 | 1 | 0 | **1** |
| `components/ui/tooltip.tsx` | 1* | 0 | 0 | **1** |

\* shadcn vendor file / dev-affordance component — lowest priority.

**Dead files, excluded from totals:** `components/WorkHistory.tsx` (4 type),
`components/SiteHeader.tsx` (1 type).

**Top 10 by violation count:** DemoStage · globals.css · CaseStudyList ·
PasswordModal · Hero · ChatPanel · ChangelogOverlay · KnowledgeBaseContent ·
UpsellsContent · LockGate.

---

# DELIVERABLE 1 — Safe mechanical swaps

**Zero visual change. Another agent can execute these file-by-file with no judgment calls.**

## SWAP-1 — `components/HomeLayout.tsx:281–293` → `typescale.body`
The home bio inlines a spec that is byte-identical to the token
(`fontSize: calc(15px + var(--font-size-offset))`, `lineHeight: 1.647` =
`BODY_LINE_HEIGHT`, `letterSpacing: "-0.01em"`).

Add to imports (a `typescale` import may already exist — check first):
```ts
import { typescale } from "@/lib/typography";
```

OLD:
```
                  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                  // Site-wide body standard: 15px at the 1.647 body ratio
                  // (matches typescale.body — Marco dropped body 17→15 on
                  // 2026-08-05). The globals.css body default stays 14/1.6
                  // — UI chrome inherits it.
                  // line-height is unitless for the same reason as
                  // typescale.body: a px value would not track the Theme
                  // Palette font-size slider and the ratio would collapse.
                  fontSize: "calc(15px + var(--font-size-offset))",
                  lineHeight: 1.647,
                  letterSpacing: "-0.01em",
```
NEW:
```
                  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                  // Site-wide body standard — the token, not a restatement.
                  // .claude/rules/typography.md required these two to change
                  // together; now they can't drift.
                  ...typescale.body,
```
Keep the `color: "var(--color-fg-secondary)"` line that follows. **Keep the
`fontFamily` line** — `typescale.body` sets none, and the long-form string here is
one character different from what `var(--font-sans)` resolves to.

## SWAP-2 — `app/globals.css:833` → `var(--shadow-soft)`
OLD:
```
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 2px 6px rgba(0, 0, 0, 0.05);
```
NEW:
```
    var(--shadow-soft),
    0 2px 6px rgba(0, 0, 0, 0.05);
```
(This is the `.chat-input-field` rule. Byte-identical string.)

## SWAP-3 — `app/globals.css:844` → `var(--shadow-soft)`
Same two-line pattern inside `.chat-input-field:focus-within`. Identical edit to SWAP-2.

## SWAP-4 — `app/globals.css:899` → `var(--shadow-soft)`
OLD:
```
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.06),
```
NEW:
```
    var(--shadow-soft),
    0 8px 24px rgba(0, 0, 0, 0.06),
```
(This is the `.chat-surface` rule.)

> After SWAP-2/3/4, `--shadow-soft` has 3 consumers instead of 0.
> `--shadow-soft-lg` still has none — see DEC-6.

## SWAP-5 — `lib/gallery-content.ts:91, 120, 137, 155` → one shared constant
Four **byte-identical** strings. Hoist to a module-level const near the top of the file:
```ts
/** Shared 3-stop card lift — was retyped verbatim at four call sites. */
const GALLERY_CARD_SHADOW =
  "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.04)) drop-shadow(0 8px 20px rgba(0, 0, 0, 0.05)) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.04))";
```
Then at each of lines 91, 120, 137, 155:

OLD (identical at all four):
```
          "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.04)) drop-shadow(0 8px 20px rgba(0, 0, 0, 0.05)) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.04))",
```
NEW:
```
          GALLERY_CARD_SHADOW,
```

## SWAP-6 — `components/case-study/ProjectDetails.tsx:60` → canonical var syntax
OLD:
```
                    <p key={g} className="py-2 text-[var(--color-fg-secondary)]">
```
NEW:
```
                    <p key={g} className="py-2 text-(--color-fg-secondary)">
```
Identical computed output; matches the 40+ other call sites in the codebase.

## SWAP-7 — `components/case-study/InlineTOC.tsx` — hoist the 3× duplicated label spec
Three byte-identical style objects at `:76–81`, `:100–102`, `:135–139`.
Add a module-level const:
```ts
/** Mono uppercase TOC label — was inlined verbatim three times in this file.
 *  ⚠️ tracking is the LEGACY 0.08em; typescale.monoLabel is -0.02em.
 *  Migrating is backlog ⑧, a deliberate visible change — not this edit. */
const TOC_LABEL: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
  fontSize: "12px",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  lineHeight: "20px",
};
```
Then:
- `:74–81` — replace the six properties inside `style={{ … }}` with `...TOC_LABEL,`
  (keep the `color: "var(--color-fg-secondary)"` line).
- `:98–105` — this one is the star marker: it has `width`, `color`, `fontSize`,
  `lineHeight`, `fontWeight`, `y`. Replace only `fontSize: "12px"`,
  `lineHeight: "20px"`, `fontWeight: 500` with `...TOC_LABEL,` **only if you also
  confirm the added `textTransform`/`letterSpacing`/`fontFamily` are harmless on a
  single `*` glyph** — they are not (mono family changes the asterisk's metrics).
  **Skip this one**; leave `:100–102` as is.
- `:133–139` — replace the six properties with `...TOC_LABEL,`.

Net: 2 of the 3 sites deduped, zero visual change.

## SWAP-8 — `components/LockGate.tsx` — hoist the 3× duplicated 12px label spec
`:261–264`, `:284–287`, `:306–309` are identical (`fontSize: "12px"`,
`fontWeight: 500`, `letterSpacing: "0.08em"` + a mono `fontFamily`). Read the three
blocks, confirm byte-equality including `fontFamily`, hoist to a
`const GATE_LABEL: React.CSSProperties` at module level, and spread it at each site.
(`:142–145` is 11px — leave it alone.)

## SWAP-9 — `components/PasswordModal.tsx` — hoist the 3× duplicated 12px label spec
`:148–151`, `:169–172`, `:234–237` are identical. Same treatment as SWAP-8:
hoist to `const MODAL_LABEL`, spread at all three. (`:191–194` is 13px/`0.06em`
and `:221–223` is 16px/`0.08em` — leave both alone.)

## SWAP-10 — `components/CaseStudyList.tsx:755–761` and `:994–1000` — hoist the duplicated placeholder label
Two byte-identical style objects ("Under construction" / "Coming soon"):
```
              fontFamily: "var(--font-geist-mono), ui-monospace, Menlo, monospace",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-fg-tertiary)",
```
Hoist to `const PLACEHOLDER_LABEL: React.CSSProperties` at module level and spread
at both sites.

---

## Near-miss — mechanical *except* one property (verify visually, ~1 min each)

**NM-1 — `components/CaseStudyList.tsx:744–750` → `...typescale.h3`**
Matches `typescale.h3` on `fontFamily`, `fontSize` (`calc(16px + offset)`),
`fontWeight: 500`, `letterSpacing: "-0.01em"`. The token additionally sets
`lineHeight: 1.4`; this site currently inherits `1.6` from `body`. On a single-line
centered placeholder span the box shrinks ~3.2px. Almost certainly invisible, but
not literally zero — eyeball a locked card before committing.

---

# DELIVERABLE 2 — Requires a design decision

Ranked by leverage. None of these can be executed without Marco choosing a value.

| # | Decision | Scope | Notes |
|---|----------|-------|-------|
| **DEC-1** | **Add a 12px sans UI token** (`typescale.ui` or similar) | 21 sites | 12px is the most-hardcoded size on the site and has no sans token. `monoLabel` is 12px but mono+uppercase+`−0.02em`, so it covers none of them. This single token would absorb `StudyMetaRow` ×3, `NavOverlay`, `MobileNav`, `ChipPrompt`, `ChatBar`, `HamburgerMenu`, `HomeNav` ×2 and more. |
| **DEC-2** | **Add a `--color-scrim` token and pick ONE value** | 4 sites | Currently `0.35` / `0.45` / `0.72` / `0.78`. See B.2.a. |
| **DEC-3** | **Backlog ⑧ — migrate the 28 `0.08em` sites to `monoLabel`'s `−0.02em`** | 28 sites, 14 files | Already ruled by Marco; execution is a **visible site-wide tracking change** on nav, TOC, modals and badges. Do as one reviewed sweep, not piecemeal. |
| **DEC-4** | **Backlog ⑥ — the ten `text-[15px] text-(--color-fg-tertiary)` asides** | 10 sites, 2 files | Backlog recommends **(a)**: delete the `text-[15px]` as redundant now that body is 15px, keeping colour alone as the de-emphasis. That would make it a mechanical delete — but it needs Marco's yes. |
| **DEC-5** | **Backlog ③ — the duplicated italic hero subtitle** | 2 sites | Backlog's post-consolidation guidance: prefer `{...typescale.subtitle, fontStyle: "italic", …}` over minting `studySubtitleItalic`. Needs a call on whether the 18px/`0.02em` deltas survive. |
| **DEC-6** | **Decide the fate of `--shadow-soft-lg`** | 1 token | Zero consumers, and its nearest real-world twin (`globals.css:442`, `0 4px 14px rgba(0,0,0,0.06)`) differs by 2px of blur. Either retune the token to `14px` and adopt it, or delete it. |
| **DEC-7** | **Add a 13px and/or 14px chrome token** | 6 + 7 sites | The other two undocumented rungs. 14px is especially messy — it appears with four different line-heights (`22.4px`, `22px`, `1.4`, inherited `1.6`). Any 14px token MUST use a unitless line-height per the `typography.md` rule. |
| **DEC-8** | **`--font-mono-system` vs the 37 inline mono strings** | 37 sites | The var exists in `globals.css:82` and site chrome ignores it entirely. Note the values differ (`Monaco` is in the var, not in the inline string), so this is not a mechanical swap. |
| **DEC-9** | **Hoist the shared case-study eyebrow** | 2 sites | `NextProject.tsx:26` and `Acknowledgements.tsx:21` carry byte-identical classNames. Needs a call on whether it becomes a shared `<Eyebrow>` component or a `typescale` token. |
| **DEC-10** | **A dark-chrome color family for `DemoStage`** | 13 sites | Intent is sanctioned by `specimens.md`; values are untokenized. Lowest urgency. |
| **DEC-11** | **A `--header-rhythm: 48px` token** | 6 sites | Currently `"48px"` / `gap-12` / `mt-12` / `pt-12` across `HomeLayout`, `Hero`, `GlobalToolbar`. |
| **DEC-12** | **Couple the `18vh` pair** | 2 files | `CaseStudyShell.tsx:41` `lg:pt-[18vh]` and `InlineTOC.tsx:56` `top-[18vh]` must stay equal; nothing enforces it. A shared constant or a CSS var would. |

---

# Housekeeping (not violations)

- **`components/WorkHistory.tsx` has zero importers.** 4 type violations live in dead
  code. Delete rather than fix. (Cross-check `docs/DEAD-CODE-AUDIT.md` and
  `docs/SALVAGE-REVIEW.md` first — kept-for-salvage files are deliberately unreferenced.)
- **`components/SiteHeader.tsx` is unmounted site-wide** (2026-07-20); only comments
  reference it. Same treatment.
- **`docs/TYPOGRAPHY-BACKLOG.md` item ⑤ is stale.** It says `StudyMetaRow.tsx`
  hardcodes `fontSize: 11` / `fontSize: 14`; the file now hardcodes `fontSize: 12`
  at `:139`, `:151`, `:179`.
- **`.claude/rules/typography.md` says "8 tokens"; `lib/typography.ts` exports 9**
  (`monoLabel` was added after the consolidation and the count in the prose wasn't
  updated — the table below it does list all 9).

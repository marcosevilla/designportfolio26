# Portfolio Audit — February 2026

Comprehensive audit of marcosevilla.com based on deep research from 30+ design industry sources (see `PORTFOLIO-RESEARCH.md`), code review of all components, and analysis of current content and documentation.

**Target role:** Senior IC Product Designer
**Decision:** Keeping all 6 case studies, improving Tier 2 to match Tier 1
**Image timeline:** Exporting from Figma this week

---

## Table of Contents

1. [What You're Doing Well](#1-what-youre-doing-well)
2. [Critical Issues](#2-critical-issues)
3. [Content Issues](#3-content-issues)
4. [Visual & Design Issues](#4-visual--design-issues)
5. [Accessibility & Performance Issues](#5-accessibility--performance-issues)
6. [Prioritized Recommendations](#6-prioritized-recommendations)

---

## 1. What You're Doing Well

### 1.1 Interaction design is best-in-class
The SectionSnap rubber-band physics, spring-based nav animations, mouse-tracking card glow, and parallax scrolling are all polished and intentional. These aren't gratuitous -- they signal engineering collaboration ability and attention to physical metaphor. This is exactly what Rauno Freiberg's portfolio does for him, and yours hits a similar bar.

### 1.2 The theming system is a standout feature
10 WCAG AA-compliant color palettes + 3 font pairings + adjustable font sizing is genuinely impressive. It's memorable, it shows systems thinking, and it demonstrates accessibility awareness. The fact that it all runs through CSS variables with live updates is technically clean.

### 1.3 Tier 1 case studies have real substance
F&B Ordering, Compendium, and Upsells have specific revenue numbers ($1M CARR, $3.8M CARR), named customers (Hotel Jackson, Chateau Avalon, HOMA Cherngtalay), honest ownership claims (100% for F&B), and real pull quotes from PMs and stakeholders. This is exactly what Julie Zhuo, Alicja Suska, and First Round say separates strong portfolios from generic ones.

### 1.4 Progressive disclosure bio is unique
The question-prompt system ("What else have you worked on?" / "How'd you get into design?") is unlike any reference portfolio. It demonstrates interaction design thinking while solving the "how much bio is too much" problem elegantly.

### 1.5 Accessibility foundations are solid
`prefers-reduced-motion` support (CSS level), `aria-hidden` on inactive panels, semantic `<button>` elements on cards with `aria-haspopup="dialog"`, keyboard navigation in SectionSnap, WCAG AA color compliance across all themes, skip-to-content link, global focus-visible styles. Ahead of most portfolios.

### 1.6 NextProject chain is complete
Every case study links to the next in a circular loop (F&B -> Compendium -> Upsells -> Check-in -> General Task -> Design System -> F&B). This is a best practice that NN/g and multiple sources flag as critical for retention.

### 1.7 Architectural separation is clean
Server component data fetching, context-based dialog management, URL hash sync for deep-linking, CSS variable theming -- the engineering is well-structured.

---

## 2. Critical Issues

### 2.1 Zero real images anywhere (the dealbreaker)

**64 ImagePlaceholders** across 6 case studies, plus empty card interiors on the homepage. The CaseStudyCard component has a comment labeled `"Future mockup slot"` with an empty `flex-1` spacer.

Every source in the research agrees this is not a "nice to have" -- it's the difference between a portfolio that gets interviews and one that gets closed in 5 seconds.

**Michael Slade** (Google Design Manager) spends 30 seconds on a homepage looking for evidence of design skill. Gray boxes communicate the opposite.

The homepage cards are especially critical. A hiring manager scanning the work panel sees 6 frosted-glass cards with titles and subtitles only -- no preview of the actual work. **Van Schneider**: "The thumbnail is an ad for your case study." The ads are currently blank.

**Placeholder counts by study:**
| Case Study | Placeholders |
|---|---|
| F&B Ordering | 15 |
| Compendium | 14 |
| Upsells | 14 |
| Check-in | 5 |
| General Task | 8 |
| Design System | 8 |
| **Total** | **64** |

### 2.2 The work panel is too narrow

SectionSnap constrains both bio AND work panels to `max-w-[640px]`. The 2-column card grid renders in a 640px container. For a bento grid with hero cards spanning both columns at 16:9 -- that's extremely tight.

The CLAUDE.md originally spec'd the work panel at `max-w-content-lg` (1060px). The current 640px was set during the typography session to match the bio panel width. This may have been a "match the bio" decision that inadvertently compressed the card grid.

### 2.3 The intro animation delays content

The 5-phase hero sequence runs: star blink (1.8s) -> heading streams -> star blink (1.8s) -> bio streams -> done. That's roughly **4-5 seconds before the heading is fully visible**, and the work panel isn't reachable until "View my work" appears after that.

The sessionStorage skip handles returning visitors, but **first-time visitors -- including the hiring manager who just got the link -- wait through the full sequence.**

Sarah Doody's data says 10 seconds is the total window. Half of it is spent on an entrance animation before any work is visible. The reduced-motion path correctly skips to `done`, but most hiring managers aren't using that setting.

### 2.4 Two-tier case study quality gap is visible

The six case studies fall into two distinct quality tiers:

| | Tier 1 (F&B, Compendium, Upsells) | Tier 2 (Check-in, General Task, Design System) |
|---|---|---|
| Lines of code | 430-454 | 184-467 |
| Structure | Consistent 7-section TOC | Inconsistent (6-9 sections) |
| Framing | "Problem / Solution" | "Overview / My Role" |
| Key Decisions | 4-5 numbered, annotated | None |
| Pull Quotes | 2-3 per study | 0 |
| Visual Gallery | 8-image grid | None |
| Reflections | Specific (3-part) | Generic startup lessons |
| TOC position | `top-[18vh]` | `top-[22vh]` |

Check-in is the weakest at 184 lines -- it reads as a Canary product overview touching 4 products rather than a focused case study. A hiring manager clicking from F&B Ordering to Check-in would notice the quality drop immediately.

**Dann Petty**: "You are judged by your weakest work."

### 2.5 No TL;DR or summary section in any case study

Not a single case study has a summary or TL;DR block. The research is unanimous: **GV, Zhuo, NN/g, and Suska all recommend a 2-4 sentence executive summary** immediately after the hero. This is what 60% of reviewers will read as their entire case study experience (per Doody's data: most read homepage + 1 case study, and they skim that study).

The Tier 1 problem statement sections partially serve this role but are buried after QuickStats and don't read as summaries. A TL;DR card (problem -> approach -> outcome in 3-4 sentences) after each hero would dramatically improve the 60-second skim experience.

### 2.6 Positioning statement doesn't reflect identity work

**Current hero:** "Hi, I'm Marco. I design software in San Francisco."

**From designer-identity.md:** "I'm a product designer who treats visual craft as a strategic tool -- not polish, but precision. I build systems that work for humans and hold up under complexity."

The homepage uses the generic version. **Cap Watkins' advice:** "Name the problems you solve, not just the craft you practice." Any of the 5,000 product designers in SF could say what the hero currently says. The identity doc's positioning is specific, differentiated, and tells a story about what kind of designer you are.

---

## 3. Content Issues

### 3.1 Case studies are 2-3x the recommended length

Tier 1 studies are 200+ lines of dense text each. The research consensus is 800-1200 words of body text + 6-10 annotated images, readable in 3-5 minutes. Tier 1 studies are closer to 2,000+ words, and the Design Process sections read as month-by-month chronological timelines rather than pivotal decision moments.

**HubSpot**: "We assume everyone uses a similar process." The "Aug 2025 -> Sep 2025 -> Oct 2025" structure in Design Process sections is exactly the pattern they call out.

### 3.2 No rejected/failed directions in any case study

Across all 6 studies, not a single one shows a design direction that was explored and rejected. **Pablo Stanley, Zhuo, Figma's recruiter** all flag this as one of the strongest signals of senior thinking. The reflection sections mention things that could be changed, but showing the actual rejected design with annotation ("We explored X but rejected it because Y") is much more powerful.

### 3.3 Writing/Play sections are empty shells

Both `/writing` and `/play` show "Coming soon." These pages exist in the nav and are clickable. An empty page is worse than no link at all -- it signals unfinished work. Either populate them or remove them from the nav entirely.

### 3.4 Check-in case study needs a complete rethink

Currently reads as a Canary product overview touching 4 products (Check-in, Compendium, Omni-channel, International). It should be a focused case study about one product (the check-in dashboard redesign or V2 check-in flow), with the 21% ownership framed maturely.

Structural issues specific to Check-in:
- No "Problem / Solution" framing -- uses "Overview / My Role" instead
- No Key Design Decisions
- No Pull Quotes
- No Visual Gallery
- No Reflection section
- "Compendium" expandable section overlaps thematically with the dedicated Compendium case study
- Only 184 lines total

### 3.5 Tier 2 studies lack pull quotes entirely

F&B has 2, Compendium has 3, Upsells has 1 -- but Check-in, General Task, and Design System have zero. Even one quote per study (from Slack, email, a stakeholder) would add credibility and break up text.

### 3.6 Cross-project pattern connections are implicit

Work shares patterns across projects: builder layouts (Compendium, Upsells, F&B), translation pickers, live previews, modifier systems. These connections demonstrate systems thinking but are easy to leave implicit. Each case study should have at least one sentence connecting a pattern to another project -- this is the strongest staff-adjacent signal even for senior IC roles.

### 3.7 Design Process sections are chronological, not pivotal

All Tier 1 studies structure Design Process as month-by-month timelines (Aug 2025, Sep 2025, Oct 2025...). **Femke van Schoonhoven** recommends organizing around the 3-5 most important decisions. **HubSpot** calls chronological process the #1 anti-pattern. Restructure around pivotal moments and decision points, cutting ~40% of the process content.

---

## 4. Visual & Design Issues

### 4.1 Card title sizes are uniform when they shouldn't be

The `TITLE_SIZES` map in `CaseStudyCard.tsx` assigns `18px` to all card sizes (hero, large, medium, standard, wide). The CLAUDE.md originally spec'd hero cards at 22px. The hero card (F&B Ordering, full-width, 16:9) should be visually dominant -- same title size as smaller cards undermines that hierarchy.

### 4.2 Homepage hero heading is small

At 24px base, the hero heading ("Hi, I'm Marco...") is the same size as page headings throughout the site. The research suggests portfolio hero text at 48-72px for impact. 24px is closer to body text territory than hero territory. On a wide desktop viewport, this will feel undersized relative to the whitespace around it.

### 4.3 Case study body text at 16px is on the low end

Case study body text uses 16px with 28px line-height. The research consensus for long-form case study reading is 18-22px. At 16px, case studies feel dense, especially given the word count. The 28px line-height (1.75 ratio) is generous and helps, but the base size is tight for sustained reading.

### 4.4 Body line-height is fixed, not proportional

Body line-height is set as a fixed `28px` rather than a unitless ratio like `1.75`. When users adjust font size via the theme palette (-4px to +4px offset), line-height stays at 28px:
- At +4px (20px body), line-height becomes 1.4 -- noticeably tighter
- At -4px (12px body), line-height becomes 2.33 -- very loose

A proportional ratio would maintain consistent vertical rhythm across all size adjustments.

### 4.5 CLAUDE.md documentation is out of sync with actual code

Several documented values don't match reality:
- `max-w-content-md` documented as 900px, actually 800px
- `max-w-content-lg` documented as 1264px, actually 1060px
- Hero H1 documented as `clamp(28px, 4vw+10px, 38px)`, actually 24px
- Page headings documented at 30px, actually 24px

Won't affect users, but will cause confusion in future dev sessions.

### 4.6 Tailwind config only maps 4 of 10 CSS variables

Only `border`, `surface`, `surface-raised`, and `muted` are mapped to Tailwind utilities. Missing: `bg`, `fg`, `fg-secondary`, `fg-tertiary`, `accent`, `glow`. Components that need foreground/accent colors must use inline `style` attributes, fragmenting usage patterns.

---

## 5. Accessibility & Performance Issues

### 5.1 Contrast issues with secondary/tertiary text

`--color-fg-tertiary` at 35% opacity yields roughly **2.6:1 contrast** on white -- fails WCAG AA (4.5:1 required for body text). `--color-fg-secondary` in dark mode at 50% opacity lands at approximately **4.3:1**, barely missing AA.

Colored themes use 65% opacity for secondary and 35% for tertiary. On several themes (Ocean, Slate), secondary text contrast dips below AA.

This matters: case study subtitles, card descriptions, and bio text all use `fg-secondary`.

### 5.2 BackgroundTexture doesn't respect `prefers-reduced-motion`

CSS-level reduced motion handling is thorough, but `BackgroundTexture` uses `requestAnimationFrame` directly on a canvas -- unaffected by CSS media queries. Users who prefer reduced motion still see the animated dot wave.

### 5.3 `getComputedStyle()` called every frame in BackgroundTexture

Background texture reads CSS variables via `getComputedStyle()` on every animation frame (~60fps). Triggers a style recalculation each time. Caching color values and re-reading only on theme change would improve performance.

### 5.4 No focus trapping in ThemePalette

When the palette panel opens, focus is not trapped within it. Focus should ideally be trapped within the panel and returned to the trigger on close.

### 5.5 BackgroundTexture: ~30k dots at 60fps

On a 1920x1080 screen: ~32,776 dots per frame, each performing Perlin noise lookup, distance calculation, color blending, and canvas draw. Workable on modern hardware but could cause frame drops on lower-end devices.

### 5.6 11 font files loaded

8 self-hosted `@font-face` declarations + 3 Google Fonts via `next/font`. Not all pairings use all fonts. Lazy-loading non-default font pairings would improve initial load time.

### Accessibility Summary Table

| Feature | Status |
|---|---|
| Skip-to-content link | Implemented |
| Focus-visible styles | Global, well-implemented |
| `prefers-reduced-motion` (CSS) | Thorough |
| `prefers-reduced-motion` (canvas) | **Not implemented -- gap** |
| `lang` attribute | Set to "en" |
| `aria-hidden` on decorative elements | Applied correctly |
| ARIA labels on interactive controls | Applied in ThemePalette |
| Focus trapping in modal/palette | **Not implemented -- gap** |
| Color contrast (primary fg on bg) | Passes AA |
| Color contrast (secondary/tertiary) | **Fails AA at reduced opacities** |
| Keyboard dismissal (Escape) | Implemented in ThemePalette |
| Keyboard navigation (SectionSnap) | Implemented (Arrow/Space/Enter) |

---

## 6. Prioritized Recommendations

### P0 -- Before Sending to Anyone

**1. Export and insert hero images for all 6 case studies + homepage cards.**
Prioritize: 6 hero images first (magazine covers), then homepage card previews (first thing hiring managers see), then 2-3 key decision images per Tier 1 study.

**2. Add a TL;DR summary block to every case study.**
3-4 sentences after the hero: problem, approach, outcome. Template:
> *[Company] needed [problem]. As the [role], I [approach]. The result: [outcome with metric].*

**3. Update the hero positioning statement.**
Replace "I design software in San Francisco" with something from the identity doc. Options:
- "I design systems that hold up under complexity without losing their humanity."
- "I design software where visual precision isn't polish -- it's how the product communicates."

**4. Remove or populate Writing and Play nav links.**
Empty "Coming soon" pages hurt more than no link. If not populating this week, hide from nav.

### P1 -- Before Active Job Search

**5. Bring Tier 2 case studies up to Tier 1 structure.**
For Check-in, General Task, and Design System:
- Reframe from "Overview / My Role" to "Problem / Solution"
- Add 3-5 numbered Key Design Decisions with rationale
- Add at least 1 PullQuote per study
- Add a Reflection section with 3-part structure (Worked well / Would change / What I learned) with specific insights
- Add a Visual Gallery section (even 4 images initially)
- Align TOC position to `top-[18vh]` for consistency
- Check-in specifically needs a complete rethink -- focus on one product, not four

**6. Trim Tier 1 Design Process sections.**
Restructure from month-by-month chronologies to pivotal moments and decisions. Cut ~40% of process content. Redistribute emphasis toward decisions and outcomes.

**7. Add one rejected/failed direction to each case study.**
"We explored X but rejected it because Y" -- 2-3 sentences + an image of the rejected approach.

**8. Widen the work panel.**
Bump from 640px to 800-900px, or use a responsive approach where the work panel is wider than the bio panel.

**9. Speed up or shorten the intro animation.**
Options (recommended order):
- Reduce star blink durations from 1800ms to 800ms each (saves ~2s)
- Make heading appear instantly, only stream the bio paragraph
- Show "View my work" button simultaneously with heading, not after
- Or: skip animation for first-time visitors, only play on direct visits

### P2 -- Polish Before Interviews

**10. Increase case study body text to 18px.**
Keep 16px for nav, card subtitles, and UI chrome. The 28px line-height (1.56 ratio at 18px) is still appropriate.

**11. Differentiate hero card title size.**
Restore hero card (F&B Ordering) to 22px title. Keep others at 18px.

**12. Annotate every image added.**
1-sentence caption on every image. Easiest and most universally cited best practice.

**13. Add cross-project pattern callouts.**
Each case study should have at least 1 sentence connecting a shared pattern to another project (builder layouts, translation pickers, live previews, modifier systems).

**14. Consider short video clips for interaction-heavy decisions.**
F&B Ordering's checkout flow, Compendium's custom section builder, Upsells' form builder -- 10-15 second auto-playing clips of prototypes in action.

**15. Fix secondary/tertiary text contrast.**
Bump `fg-secondary` to at least 70% opacity in dark mode (currently 50%). Ensure `fg-tertiary` is only used for decorative/non-essential text. Audit all colored themes for AA compliance.

**16. Add `prefers-reduced-motion` check to BackgroundTexture.**
Check the media query in JavaScript and either pause or show a static dot grid for users who prefer reduced motion.

**17. Fix body line-height to proportional.**
Change from fixed `28px` to unitless `1.75` so vertical rhythm scales with font-size-offset adjustments.

### P3 -- Nice to Have

**18. Add estimated reading time to case study heroes.**
A "5 min read" indicator sets expectations and signals conciseness.

**19. Add before/after comparisons.**
Check-in (V1 -> V2 dashboard), Design System (before -> after visual language), Compendium (printed -> digital).

**20. Evaluate SectionSnap threshold on desktop.**
18px of overscroll to transition from bio to work is subtle on desktop trackpads. Consider a more obvious scroll cue or lowering the threshold.

**21. Cache `getComputedStyle()` in BackgroundTexture.**
Read CSS variables once, re-read only on theme change instead of every frame.

**22. Add focus trapping to ThemePalette.**
Trap focus within panel when open, return to trigger on close.

**23. Lazy-load non-default font pairings.**
Only load Formula and Serif font files when user switches pairings, reducing initial page weight.

**24. Sync CLAUDE.md documentation with actual code values.**
Update width tokens, font sizes, and typescale values to match current implementation.

---

## Sources

This audit is grounded in research compiled in `docs/PORTFOLIO-RESEARCH.md`, which synthesizes published guidance from 30+ design leaders and publications including:

- Julie Zhuo (ex-VP Design, Meta)
- Sarah Doody (UX Portfolio Coach)
- Tobias van Schneider (Semplice, ex-Spotify)
- Daniel Burka / GV
- Nielsen Norman Group (Sarah Gibbons, Kara Pernice)
- HubSpot Design Team
- Figma Recruiter Blog
- Femke van Schoonhoven (ex-Shopify)
- Alicja Suska (1000+ portfolio reviews)
- Catt Small (*The Staff Designer*)
- Dann Petty (Epicurrence)
- Pablo Stanley (ex-Lyft)
- Brian Lovin (ex-GitHub, staff.design)
- First Round Capital
- Indeed Design
- And others (full index in PORTFOLIO-RESEARCH.md)

---

*Audit completed February 2026. No code changes were made -- this is analysis and recommendations only.*

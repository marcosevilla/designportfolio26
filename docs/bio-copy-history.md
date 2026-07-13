# Homepage Bio Copy — Full History

Every distinct iteration of the homepage bio/intro copy, recovered from git history (2026-02-09 → 2026-06-04). Two copy threads exist:

- **Streamed bio** — the paragraphs a visitor progressively reveals in the hero / About surface. Lived in `site/lib/bio-content.ts` (hand-written) until 2026-04-29, then moved to `site/content/bio.md` (markdown source; `site/scripts/build-bio.mjs` regenerates `bio-content.ts` from it). `~/Obsidian/marcowits/portfolio/bio.md` is a symlink to the repo file — there is no separate Obsidian history, and the vault is not a git repo.
- **Inline homepage bio** — the short intro paragraph(s) hardcoded in `site/components/HomeLayout.tsx`, introduced in the May 2026 homepage redesign. This is what a visitor reads on the homepage today.

Only versions where the actual copy changed are listed. Pure refactors (heading-line formatting `0108c23`, `HERO_NAME`/`HERO_STATEMENT` split `8b9a7cd`, dead-export removal `cd48886`, popover work `3b061a9`) are skipped. `HEAD` (`9b881ab`, 2026-06-04) makes no copy changes.

---

## 1. 2026-02-09 — `32053c9` — Initial commit (streamed bio, `bio-content.ts`)

The original six-paragraph progressive-disclosure bio, plus a hero statement heading. This commit also contained an experimental 6×6 grid of 36 tone variants (casual↔professional × concise↔verbose) — deleted 2026-04-25, never a primary surface.

Heading:

> Hi, I'm Marco. I bring clarity to enterprise complexity. Visual craft is how I get there, paired with rigorous problem-framing and systems thinking that scales.

Paragraphs (links noted inline):

> With seven years of experience across consumer and enterprise products, I currently work at the intersection of systems thinking and visual craft. At [Canary Technologies], I design platforms that serve millions of hotel guests and staff globally — building everything from 0→1 products to scalable design systems across Marriott, Wyndham, Best Western, and IHG.
>
> Before Canary, I helped democratize wine discovery for millions of users at [Vivino], made animated video production more accessible at [Vyond], and built an all-in-one productivity tool for software engineers at [General Task].
>
> Growing up in the Bay Area, I spent countless hours on PCs my dad custom-built — creating worlds in simulation games, experimenting with video editing and photo manipulation. Those digital playgrounds sparked my fascination with technology as a creative tool and set me on the path to software design.
>
> Ultimately, my goal is to build beautifully crafted products that give people a sense of ease and expand what's possible. I care deeply about the details — the micro-interactions, the typography, the moments that make software feel human. I'm drawn to emerging technologies and how they'll reshape human creativity — it's what keeps me experimenting and pushing my craft forward.
>
> Outside of product work, I'm a [photographer], an occasional web developer, and someone who's always experimenting with new tools and ways of making things. When I'm not designing, you'll find me shooting concerts and street photography, singing, or on the pickleball court.
>
> I'm always open to connecting — whether it's about a role, a project, or just to talk shop. Reach me at [marcogsevilla@gmail.com] or find me on [LinkedIn].

---

## 2. 2026-02-16 — `6868fa3` — Heading rewrite

**Changed:** The abstract "clarity to enterprise complexity" thesis heading was replaced with a plain, concrete statement. Paragraphs unchanged.

> MARCO SEVILLA
>
> I design software in San Francisco.
>
> Currently at Canary where I simplify operational workflows for the largest hotel brands in the world.

---

## 3. 2026-03-24 — `d3b8e9c` — "Seven years" → "eight years"

**Changed:** Single-word tenure bump in the opening paragraph (commit: "Improve SEO, accessibility, and content accuracy"). Everything else identical.

> With **eight** years of experience across consumer and enterprise products, I currently work at the intersection of systems thinking and visual craft. At [Canary Technologies], …

---

## 4. 2026-04-25 — `3d3a14c` — Opening paragraph shortened; hero statement cut

**Changed:** Homepage simplification. The long credential-heavy opener was compressed to two sentences; the "I design software in San Francisco…" hero statement and the 36-variant tone grid were deleted. Paragraphs 2–6 unchanged.

New opening paragraph:

> Product designer in San Francisco. At [Canary Technologies], I design hospitality platforms serving major brands including Marriott, Wyndham, Best Western, and IHG.

---

## 5. 2026-04-29 — `7462650` — Move to markdown + full rewrite (`site/content/bio.md` born)

**Changed:** The bio became a markdown file with frontmatter (name, tagline, prompts); `bio-content.ts` became generated output. Complete rewrite down to four paragraphs: the tenure framing, the goal/craft paragraph, and the email/LinkedIn paragraph were all cut. New product-suite framing ("Guest Hub") and a "thousands of guests" claim appear. New frontmatter tagline: *"In my spare time I dabble in music photography."*

> I'm a Product Designer in San Francisco. Currently at [Canary Technologies], where I lead design for our Food & Beverage, Upsells, Guest Hub, and Tipping products. I've built products that have served thousands of guests, supporting operations at the world's largest hotel brands including Marriott, Wyndham, Best Western, and IHG.
>
> Growing up, I spent countless hours on PCs my dad custom-built, editing videos, manipulating photos, and creating worlds in simulation games. Those digital playgrounds turned into a love for honing my craft, and a deep interest in building systems that help people do their best work.
>
> Previously, I helped democratize wine discovery at [Vivino], made animated video production more accessible at [Vyond], and built an all-in-one productivity tool for software engineers at [General Task].
>
> When I'm not designing, you'll find me shooting [music photography], working on creative side projects, singing, or on the pickleball court.

---

## 6. 2026-04-29 — `d01caa1` — Opening paragraph rebalanced ("bio rewrite")

**Changed (same day):** Opening paragraph restructured to lead with the brands, not the product list; "Guest Hub" → "Guest Experience"; the "thousands of guests" claim dropped. Other paragraphs unchanged.

> I'm a Product Designer in San Francisco. Currently at [Canary Technologies], building software for the world's largest hospitality brands including Marriott, Wyndham, Best Western, and IHG. I lead design for our Food & Beverage, Upsells, Guest Experience, and Tipping products.

---

## 7. 2026-04-30 — `2f7bee0` — Paragraph reorder (career before childhood)

**Changed:** No wording changes — the "Previously…" career paragraph moved above the "Growing up…" origin paragraph, so the bio reads role → past roles → origin story → outside interests. This four-paragraph copy is still the canonical `bio.md` content today:

> I'm a Product Designer in San Francisco. Currently at [Canary Technologies], building software for the world's largest hospitality brands including Marriott, Wyndham, Best Western, and IHG. I lead design for our Food & Beverage, Upsells, Guest Experience, and Tipping products.
>
> Previously, I helped democratize wine discovery at [Vivino], made animated video production more accessible at [Vyond], and built an all-in-one productivity tool for software engineers at [General Task].
>
> Growing up, I spent countless hours on PCs my dad custom-built, editing videos, manipulating photos, and creating worlds in simulation games. Those digital playgrounds turned into a love for honing my craft, and a deep interest in building systems that help people do their best work.
>
> When I'm not designing, you'll find me shooting [music photography], working on creative side projects, singing, or on the pickleball court.

---

## 8. 2026-05-26 — `a4dd35b` — Inline homepage bio appears (HomeLayout.tsx) + About-page drafts in bio.md

**Changed:** The homepage redesign checkpoint introduced a new, shorter bio hardcoded in `HomeLayout.tsx` — the first appearance of the "fascinated by the interplay" line:

> Senior product designer based in San Francisco.
> Currently at Canary Technologies.
>
> I'm fascinated by the interplay of human behavior, culture, and the tools we use that augment the way we work and create.
>
> Outside of work, you'll find me shooting concert photography, discussing music and movie, or exploring various other creative side projects.

The same commit appended a working scratchpad below a divider in `bio.md`, including "Draft v1 — About page expansion (2026-05-25)" — a substantially different, longer bio that never shipped:

> I'm a Product Designer, born and raised in the Bay Area.
>
> At Canary Technologies I lead design for our Food & Beverage, Upsells, Guest Experience, and Tipping products. The software runs inside Marriott, Wyndham, Best Western, IHG, and most of the large hotel groups you'd recognize.
>
> Before Canary I helped democratize wine discovery at [Vivino], made animated video production more accessible at [Vyond], and built an all-in-one productivity tool for software engineers at [General Task].
>
> The work I'm drawn to sits between three things: tools, the people using them, and the environments they show up in. Visual craft matters to me. So does paying attention to the culture the work lands inside of. What it's competing with for someone's attention. What it accidentally encourages.
>
> I came to it the long way. As a kid I lived on PCs my dad custom-built. Maps in sim games. Edits in whatever video software I could get my hands on. Photo manipulation in shareware Photoshop knockoffs. Those felt like worlds I could bend, and the feeling stuck. It turned into a career building tools that help people do their best work.
>
> The goal hasn't moved much: beautifully crafted software that gives people a sense of ease, and expands what they're able to do.
>
> Outside of design I'm shooting [concert and street photography], on creative side projects, singing, or on the pickleball court. Ex-tennis player. Never fully let go.

(The scratchpad also preserved an even older pre-repo About text — "My work blends a life-long enthusiasm for technology, a foundation in visual design, and a keen interest in human creativity and productivity… an ex-tennis-player-turned-pickleball-hobbyist" — and three "guiding principles" candidates: *Find the simple shape under the mess / Build the thing instead of pitching the thing / Design for the whole stay, not a single screen*.)

---

## 9. 2026-05-26 — `6a4793e` — Inline bio: three paragraphs → two

**Changed:** The location/role fragment merged into the "fascinated" paragraph.

> Senior product designer based in San Francisco. Currently at Canary Technologies. I'm fascinated by the interplay of human behavior, culture, and the tools we use that augment the way we work and create.
>
> Outside of work, you'll find me shooting concert photography, discussing music and movie, or exploring various other creative side projects.

---

## 10. 2026-05-26 — `93f5228` — Inline bio: drop the "Senior product designer" lead

**Changed:** The role/location sentence moved out of the bio (into the "Marco Sevilla" heading + tagline treatment). Bio now opens on Canary.

> Currently at Canary Technologies. I'm fascinated by the interplay of human behavior, culture, and the tools we use that augment the way we work and create.
>
> Outside of work, you'll find me shooting concert photography, discussing music and movie, or exploring various other creative side projects.

---

## 11. 2026-05-26 — `efcd3e6` — Inline bio rewritten: interests out, résumé in

**Changed:** Full rewrite of the inline homepage bio (commit note: "Home bio rewritten to two paragraphs: current Canary role + prior roles"). The "fascinated by the interplay" thesis and the outside-of-work interests were cut in favor of a credentialed career summary — the first time the inline bio names prior companies and titles.

> Currently at Canary Technologies, building software for the world's largest hospitality brands.
>
> Previously, I was the Lead Visual Designer for a suite of animation tools at Vyond, made wine discovery more accessible at Vivino, and was the Founding Product Designer at General Task.

Same day, `6a7cd4a` ("trim bio to four paragraphs") cleaned `bio.md` back to exactly the canonical four paragraphs of iteration 7, deleting the draft scratchpad.

---

## 12. 2026-06-04 — `d51da5e` — Inline bio merged to one paragraph; artist-bio drafts land in bio.md

**Changed (inline bio):** The two paragraphs were joined into a single paragraph — wording identical to iteration 11. This is the homepage bio as of `HEAD` (`9b881ab`):

> Currently at Canary Technologies, building software for the world's largest hospitality brands. Previously, I was the Lead Visual Designer for a suite of animation tools at Vyond, made wine discovery more accessible at Vivino, and was the Founding Product Designer at General Task.

**Changed (bio.md):** Below a `----` divider, new "Artist bio" drafts were appended (photographer identity — a different register from the design bio):

> Marco Sevilla (he/him) is a queer Filipino photographer and designer born and raised in the Bay Area, currently based in San Francisco. He's built a body of work documenting locally organized queer nightlife events like Queen Out, alongside concerts for Live Nation and Goldenvoice.
>
> He aims to transport the viewer onto the dance floor by capturing intimate moments of catharsis and celebration. With his work, he hopes to honor the artists and organizers who are shaping and reinventing SF nightlife, and continue to create space for queer liberation.

(Plus rougher in-progress fragments above that final version.)

> **⚠ Bug:** `scripts/build-bio.mjs` does not stop at the `----` divider — it converts *everything* in `bio.md` into streamed-bio paragraphs. The regenerated (uncommitted) `site/lib/bio-content.ts` currently contains the artist-bio drafts and raw fragments ("[Portola /", "Outside Lands / swap your real list]", etc.) as visitor-facing paragraphs. Either move the drafts out of `bio.md` or make the script truncate at the first horizontal rule before the next build/deploy.

---

## Current state (2026-06-04, `9b881ab` / HEAD)

- **Homepage inline bio (visible):** the one-paragraph Canary + prior-roles copy (iteration 12).
- **Streamed bio source (`bio.md`):** the canonical four paragraphs (iteration 7) + appended artist-bio drafts (see bug above).
- Consumers of the generated `bio-content.ts`: `Hero.tsx`, `SiteHeader.tsx`, `StreamingText.tsx`, `HighlightableBio.tsx`.

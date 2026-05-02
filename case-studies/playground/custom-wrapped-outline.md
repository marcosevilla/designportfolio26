# Custom Wrapped — Project Outline

> Internal context document. Raw notes for portfolio + future iteration. Public-facing case study lives in `custom-wrapped.md`.

---

## At a glance
- **Title:** Custom Wrapped
- **Date:** Nov 2025
- **Type:** Personal project / year-in-review experience / personal gift
- **Status:** Shipped, given as a gift
- **Repo:** `~/claude-projects/pj-marco-wrapped` (internal package name: `love-notes`)
- **AI-paired ratio:** ~95% Claude-coded, 5% hand-coded.

---

## Origin
A year-in-review experience inspired by Spotify Wrapped, built as a personal gift. Driven by Marco's belief that AI is the tool that finally lets a backlog of half-formed creative ideas become real things you can hand to someone — and by the desire to push beyond Wrapped's now-ubiquitous template into something visually distinct and genuinely personal.

---

## Concept
- Vertical swipe carousel — iOS-style gesture, slide-by-slide reveal
- Each slide tells one story from the year (vacations, movies, milestones, inside jokes)
- Slide-by-slide art direction: the visual style on each card serves that card's story
- Personal data woven in throughout — not generic stats, but data mined from Marco's own life

---

## Tech stack
- **Framework:** Next.js 16 (App Router)
- **Animation:** GSAP (GreenSock) + `@gsap/react`
- **Carousel:** embla-carousel-react (swipe gesture engine)
- **Styling:** Tailwind CSS v4 with custom design tokens
- **Language:** TypeScript
- **Fonts:** Geist Sans (loud headers), VT323 (8-bit pixel terminal), Caveat (handwriting)

---

## Architecture
- App Router single-page experience — `StoryContainer` orchestrates the carousel
- Each slide is its own component under `src/components/story/slides/` — IntroSlide, DaysSlide, LoveSlide, WeddingsSlide, IMessage2Slide, etc.
- Shared primitives: Starburst (animated decorative), Counter (animated number), AudioToggle, Polaroid carousel, video marquee
- GSAP timelines drive the choreographed reveals and the stop-motion frame stepping
- Background color interpolates between slides during swipe — adds continuity across discrete vignettes

### Why GSAP over framer-motion
The whole project is fundamentally **scroll-storytelling** — sequenced timelines, choreographed reveals, multiple elements moving in sync per slide. GSAP's imperative timeline model is the natural fit for that shape of work. framer-motion is excellent for component state transitions, but GSAP is what scroll-storytelling sites have used for years.

### Why embla-carousel
Native iOS-feeling swipe gesture with momentum, snap, and direction-aware velocity. Hooked into GSAP so each slide change triggers its own choreography.

---

## The visual identity: stop-motion + three voices

### Stop-motion / discrete-frame animation
A deliberate creative direction sourced by Marco — DIY, "vintage video game with modern elements." Reaction against the over-smoothed feel of typical web motion. Implemented by stepping through discrete animation frames at chunky intervals (think hand-drawn animation cadence) rather than tweening continuously.

### Three font voices, each scoped to a role
| Font | Role | Used on |
|---|---|---|
| **VT323** (8-bit pixel) | The throughline. Vintage-game identity. | Captions, labels, accents across every slide |
| **Geist Sans** | The loud beats. Headlines and emphasis. | Big numbers, slide titles, callouts |
| **Caveat** (handwriting) | The intimate beats. Personal warmth. | Wedding slide (thank-you-card aesthetic), private notes |

The mapping was conscious — each slide tells its own story, so the type follows. The wedding slide reads like a thank-you card from real wedding stationery; the stats slides read like an arcade.

---

## The personal data layer (the real unlock)
The thing that makes it *Marco's* and not a Wrapped clone is the source material: his actual year, mined from his actual data.

Two examples documented:
1. **Vacation count** — scraped flight events from Marco's calendar across 2025 to count and visualize trips
2. **Year in movies** — cross-referenced Letterboxd watchlist with movie theater visits to surface every theater session of the year

The thesis behind it: **AI is the tool that augments creativity by making it cheap to mine and dramatize personal data into a meaningful, personalized experience.** The vault of half-formed ideas in Marco's head finally became a buildable thing.

---

## What was hard
- Articulating the stop-motion motion principles to Claude succinctly enough that it could intuit how every moving element should behave
- Maintaining cohesion across slides that each have their own art direction
- Sourcing and structuring the personal data (calendar, Letterboxd) so it could feed the visualizations cleanly

---

## AI workflow notes
- ~95% Claude-coded
- Figma MCP used to translate visual concept into code, same workflow as Pajamagrams
- The throughline lesson — **specifying motion intent succinctly enough for Claude to translate it faithfully** — was sharpened further here
- Personal data sourcing was an interesting AI-assisted task: Marco directed what to look for; Claude helped parse calendar exports and Letterboxd data into usable structures

---

## Status / next
- Shipped, given as a gift
- No active roadmap
- The "personalized digital experiences" thesis it proves out is the seed for future personal projects

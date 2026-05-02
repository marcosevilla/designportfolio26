# Custom Wrapped

> Personal project · Nov 2025
>
> A year-in-review experience built like Spotify Wrapped — vertical swipe carousel, GSAP timelines, stop-motion animation.

---

## The idea

Spotify Wrapped is well-trodden territory now — every product team makes one. The interesting question wasn't whether to make another, but whether I could make one that felt like *mine*: visually distinct, sourced from my actual year, and intentional enough that someone close would feel seen by it.

I built it as a gift. The thesis underneath it — and the reason I keep coming back to projects like this one — is that AI is the tool that finally lets a vault of half-formed creative ideas become real things you can hand to someone.

---

## Building the spine

The whole project is fundamentally scroll-storytelling: sequenced timelines, choreographed reveals, multiple elements moving in sync, slide by slide. That shape of work is GSAP's natural home, so GSAP runs the choreography. embla-carousel handles the iOS-feeling vertical swipe — native momentum, snap, and direction-aware velocity, hooked into GSAP so each slide change triggers its own scripted reveal. Background color interpolates between slides during the swipe so the discrete vignettes feel continuous.

Each slide is its own React component with its own timeline. The container orchestrates; the slides perform.

---

## The visual identity

### Stop-motion, on purpose

The motion is deliberately not-smooth. Animations step through discrete frames at chunky intervals — DIY, vintage-video-game cadence rather than the over-tweened feel typical of polished web product. The decision was creative direction, not a constraint. I wanted vintage with modern elements; I designed the visual concept in Figma first; I then articulated the motion principles to Claude carefully enough that the implementation could intuit how every button, transition, and element should behave.

Articulating motion intent succinctly enough for an LLM to translate it faithfully is becoming a quiet thread across these projects. This one pushed it the furthest.

### Three font voices, each scoped to a role

- **VT323** (8-bit pixel) — the throughline. Vintage-game identity, present on every slide.
- **Geist Sans** — the loud beats. Big numbers, slide titles.
- **Caveat** (handwriting) — the intimate beats. The wedding slide reads like a thank-you card from real wedding stationery; the rest of the slide doesn't need to.

Each slide tells its own story; the type follows. Three voices, one experience.

---

## The real unlock: personal data as source material

The thing that makes Custom Wrapped *mine* — and not a Wrapped template with new colors — is the data underneath it.

Each slide is sourced from my actual year. Two examples that felt especially good to build: a vacation count derived from scraping flight events out of my calendar across 2025, and a year-in-movies surface that cross-references my Letterboxd watchlist with my movie-theater visits to reconstruct every theater session I had.

The result is a gift that's full of details only the recipient would catch — which was the point. A personalized digital experience, not a template. AI made the mining cheap; my year made it specific; the design made it land.

---

## What this proves to me

That a designer who can direct AI well can produce small, personal, finished things at a quality bar that used to require a team. The vault of ideas becomes a queue.

# Six Degrees

> Personal project · Feb 2026 → ongoing
>
> A movie-graph puzzle game that started as a roadtrip car game with friends.

---

## Origin

Long before it was a website, Six Degrees was a verbal game played on roadtrips with friends who love movies — connect any two actors through the films and shows they've shared, fewest hops wins. The mechanic was already tested socially. The only question was whether it would survive being translated into a single-player web experience that strangers and friends would both want to come back to.

I built it as a deliberate stress test: how far could I push Claude Code on a real, shippable product, with my product instincts as the steering wheel?

---

## Building it

Next.js 16 on Vercel, TypeScript, Tailwind v4, no external state library — just `useReducer` plus Context. The interesting work isn't the framing; it's behind the API.

Actors are sourced from TMDb, but TMDb's "popular people" endpoint is noisy. So the pool is filtered down to ~200 candidates that meet a real-mainstream-career bar: at least two English-language credits with 3000+ votes apiece. The pool is built once, cached server-side for 24 hours, and re-pulled on deploy. Every TMDb call lives behind a `/api/tmdb/*` proxy so the API key stays on the server.

That part is tablestakes. The next part is what I cared about.

---

## The graph as the difficulty oracle

Difficulty isn't tagged onto actors. It's computed live from the TMDb graph itself.

When the player picks Easy, Medium, or Hard, the reveal screen pulls a random pair, runs a quick two-step BFS through their filmographies, and only commits the pair if the result matches the requested tier:

- **Easy** — they share a movie
- **Medium** — one actor between them
- **Hard** — no obvious 2-hop connection

Up to eight retries until something fits. No precomputed difficulty table. No manual tagging. The graph stays accurate as TMDb data evolves, and the system stays small enough to live in a single API route.

---

## Sculpting the chimes

There are no audio files in the repo. Every sound — the soft chime when you add a card, the descending thud and crumple when you remove one, the whoosh when an actor card flips — is generated in the browser at runtime via Web Audio. Sine waves, triangle waves, exponential gain ramps, short bursts of white noise shaped by hand.

I went this route to control the sound itself. Frequency, envelope, noise content — all numbers I could tune like a button radius. No asset pipeline, no licensing, and a tiny, custom sonic identity that I could iterate on alongside the visual reveals.

---

## The hard part: humane difficulty

The architecture is the easy part. The craft was in making it *feel good*.

Early prototypes were technically correct and emotionally exhausting. Queries were slow, the reveal felt sluggish, the snap was off, and even the most cinephile friends I tested with hit pairs they couldn't connect — the kind of moment that ends a game session for good. Most of the work after the first working build went into tuning the parts that don't show up in a code diff: snap timing, reveal pacing, sonic feedback, and difficulty thresholds set just past "challenging" but a long way short of "rage-quit."

It plays well in the wild now, with the same friends who inspired it.

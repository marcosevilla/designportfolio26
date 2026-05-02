# Six Degrees — Project Outline

> Internal context document. Raw notes for portfolio + future iteration. Public-facing case study lives in `six-degrees.md`.

---

## At a glance
- **Title:** Six Degrees
- **Date:** Feb 2026 → ongoing
- **Type:** Personal project / web game
- **Status:** Live, plays in the wild with movie-savvy friends
- **Repo:** `~/Developer/six-degrees`
- **AI-paired ratio:** ~95% Claude-coded, 5% hand-coded. Marco directed; Claude built.

---

## Origin
A real-life roadtrip car game played verbally with friends who love movies — connect any two actors through the films and shows they've shared. The mechanic was already proven socially. With the rise of AI-driven product design, the question shifted from "could I build this?" to "how far could I push Claude Code on a real, shippable product?" The web version became both a flex of product/design instincts and a deliberate vehicle for getting more fluent with Claude Code.

It now plays well in the wild with the same friends who inspired it.

---

## Concept
Two random actors are revealed. Build the shortest chain of co-stars and shared movies to connect them. Three difficulty tiers shape how connectable the random pair is allowed to be.

Game loop:
1. Difficulty selected on home screen
2. Reveal screen flips two actor cards (with synthesized audio)
3. Chain builder lets the player search and add actor/movie nodes
4. Results screen scores the chain by length and time

---

## Tech stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 with CSS custom properties
- **Fonts:** Geist Sans (primary), Playfair Display (serif accent for results score label only)
- **State:** React `useReducer` + Context (no external state library)
- **Sound:** Web Audio API — fully synthesized chimes and noise bursts, no audio assets
- **API:** TMDb (The Movie Database), proxied through `/api/tmdb/*` routes to keep the API key server-side
- **Deployment:** Vercel
- **Env:** `TMDB_API_KEY` in `.env.local`

---

## Architecture

### TMDb proxy + actor pool
- `/api/tmdb/pool` builds an actor pool of ~200 candidates pulled from TMDb's "popular people" endpoint
- Module-level server cache, 24h TTL — survives across requests, resets on deploy
- First request after restart is slow (~5–10s) while it populates the pool; every subsequent request is instant

### Pool filters (so the game is playable)
| Constraint | Threshold | Why |
|---|---|---|
| `known_for_department` | `Acting` | Skip directors/writers |
| Profile photo | required | Visual reveal screen needs it |
| English-language entries | ≥ 2 | Avoid actors no one in target audience would recognize |
| Vote count on those entries | ≥ 3000 | Filter out low-circulation indies |
| Qualifying entries | ≥ 2 | Forces "real mainstream career," not one-hit wonders |

### Other API routes
- `/api/tmdb/search` — debounced search across movies + TV, sorted by popularity, returns top 15
- `/api/tmdb/credits` — pulls cast/crew for chain validation
- `/api/tmdb/person` — actor detail
- `/api/tmdb/validate` — confirms a chain step is valid
- `/api/tmdb/verify-pair` — runs a 2-step BFS to determine `minSteps` for a candidate pair (this is the difficulty oracle, see below)

---

## The difficulty system (the clever bit)
Difficulty isn't tagged onto actors — it's computed live from the TMDb graph itself.

When the player picks Easy/Medium/Hard, the reveal screen:
1. Picks a random pair from the pool
2. Calls `/api/tmdb/verify-pair`, which uses TMDb's filmography to compute `minSteps`
3. Matches the result against the requested difficulty:
   - **Easy** → `minSteps === 1` (they share a movie)
   - **Medium** → `minSteps === 2` (one actor between them)
   - **Hard** → `minSteps === null` (no obvious 2-hop connection — still likely connectable, but not trivially so)
4. Retries up to 8 times until a candidate matches

The graph itself is the oracle. No precomputation, no manual tagging, no shipping a database — and the difficulty stays accurate as TMDb data evolves.

Color coding per difficulty:
- Easy → green `#4ade80`
- Medium → pink `#E8547C`
- Hard → red `#E63946`

---

## Audio
All sound effects are synthesized in real time with the Web Audio API. No `.mp3`/`.wav` files exist in the repo.

`lib/sounds.ts` exports:
- `playCardSound` — sine oscillator, 660 → 880 Hz exponential ramp, 250ms gain envelope. The "card added" chime.
- `playRemoveSound` — triangle oscillator, 400 → 180 Hz descending, plus a short white-noise burst (random samples shaped by a fast fade) for "crumple" texture. The "card removed" thud.
- `playFlipSound` — white-noise-driven whoosh shaped over 300ms, used for the actor reveal flips.

**Why synthesized:** chosen for full control over the sound itself. Frequency, envelope, noise content are all numbers Marco can tune — like designing a button radius. No asset pipeline, no licensing, no file size.

---

## AI workflow notes
- ~95% of the code was written by Claude Code. Marco's role: product direction, design judgment, prompting, taste calls, iteration.
- TMDb was discovered through Marco's own research against specific criteria (popularity filter, blockbuster bias, deep filmographies, flexible API, low cost). Claude built around it.
- The difficulty-as-graph-oracle architecture emerged through pairing — Marco described what "a fair difficulty curve" should feel like; Claude proposed the BFS-based approach.
- `CLAUDE.md` and `UI-CRITIQUE.md` and `VIRALITY-RESEARCH.md` live in the repo as persistent context for ongoing iteration.

---

## What was hard
The whole project was an exercise in making something **user-friendly and intuitive enough** that friends would actually keep playing.

- **Snappiness:** initial actor queries felt slow; tuning caching, preloading, and the reveal animation timing took several passes.
- **Mobile-first responsiveness:** had to hold up on a phone, not just a laptop.
- **Sonic engagement:** the synthesized chimes were tuned in pairs against the visual reveal so the audio and motion arrive together.
- **Difficulty calibration:** the hardest constraint. Even the most cinephile friends sometimes can't connect a pair — the graph oracle plus the pool filters had to coexist so that "hard" is challenging-but-not-rage-quitting.

---

## Status / next
- Live and shipped
- Plays well with the original friend group
- Future ideas: daily puzzle mode (deterministic seed already stubbed in `actor-pool.ts`), shareable scorecards, leaderboard

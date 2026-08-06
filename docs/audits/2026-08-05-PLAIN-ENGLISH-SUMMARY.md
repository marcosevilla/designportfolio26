# What changed on the site — in plain English

**Date:** 2026-08-05
**Status: committed to `main` locally, NOT pushed and NOT deployed.** The live site is
unchanged until you push. Nothing here is irreversible.

**To undo everything:** `git reset --hard pre-multiagent-audit`

---

## The headline: your project carousel was fighting you

You asked me to make the project cards scroll smoothly instead of jerking one-by-one.

Here's what was actually happening. The carousel had "magnetic snapping" turned on — the
idea being that when you let go, the nearest card slides neatly into place. Reasonable idea.
But a trackpad doesn't send one big "scroll 600 pixels" instruction. It sends a hundred tiny
ones. And the magnet was re-aiming at the nearest card after *every single one* of those tiny
nudges.

So it never got anywhere. I measured it before touching anything: a normal swipe that should
have travelled 600 pixels traced this path —

> 110 → 137 → 127 → 184 → 163 → 130 → 183 → 48 → **0**

It wobbled and snapped right back to where it started. **Net movement: zero.** That's the
"jagged" feeling — it wasn't your imagination, and it wasn't a matter of taste. It was broken.

I removed the magnet. The same swipe now goes smoothly from 0 to 600 and stays there. A
single mouse-wheel click moves it 120 pixels and holds. No stutter, no snap-back, on desktop
and on phones.

**One honest caveat, and it matters.** Removing the magnet fixed the *smoothness*. It did not
fix *discoverability* — and there's a real gap there that existed before I started. The
scrollbar is hidden, there are no arrows, and a plain mouse wheel scrolls the page up and
down rather than the strip sideways. So a visitor using a regular mouse may only ever see the
cards already on screen. Trackpad and phone users are fine.

I didn't add arrows or indicators myself, because that's a visual design decision on your
homepage and there are four reasonable answers — you should pick. **This is my number-one
recommendation for you** and it's written up with options in the opportunities doc.

---

## The bug that was quietly breaking your chat

This is the one I'm most glad we caught.

If someone opened your AI chat on their phone and tapped outside it to close it, the chat
**broke permanently for the rest of their visit** — and it stayed broken even if they
reloaded the page. Every message they tried to send afterwards showed
*"Lost connection — try asking again."* forever.

The cause: when you send a message, the code creates an empty blank space to stream the
reply into. If you close the panel mid-reply, that empty space was supposed to be cleaned
up — but the cleanup line sat *after* the line that exits early, so it never ran. The empty
blank got saved to the browser's memory, survived reloads, and got attached to every future
message. The AI service rejects messages containing an empty blank, so every subsequent
attempt failed.

It's fixed, and anyone already carrying a broken session recovers automatically on their next
visit.

I want to flag *how* it was verified, because "we fixed it" is easy to say. The check pulls
the actual shipped code out of the file, runs it, and confirms the bug is gone — and then
runs the identical check against the *old* version of the file and confirms it **fails**
there. That proves the test is really testing something rather than just agreeing with
itself.

---

## Making the site lighter on people's laptops

Your homepage has animated visual textures behind each project card. All eight of them were
running constantly — including the ones scrolled off-screen where nobody could see them. That
burns battery and spins up fans for no benefit.

They now pause when they're not visible and resume when they scroll back in.

**Measured: 2,408 animation frames every 5 seconds → 598. About 75% less work.**

Same idea in a few other places:
- The music visualizer kept drawing at full size even when collapsed to a 10-pixel sliver.
  Now: **241 draws → 0** while collapsed.
- The music player was re-drawing a very large component **four times a second** just to
  update the clock. Now: zero.
- The background dot-grid effect was switched off months ago *for performance* — but the
  "off" switch was in the wrong place, so it still attached a listener that fired on every
  single mouse movement, on every visit, feeding an effect that was never drawn. Now genuinely
  off.
- The cursor glow effect was forcing the browser to re-measure the page on every mouse
  movement. Fixed.

---

## Small things that were visibly wrong

**The table of contents highlighted the wrong section.** On every case study, the marker
could land on the wrong item when two sections were near the boundary. Amusingly, the
*correct* version of this code already existed elsewhere in your codebase — in a component
that isn't used any more. The good code was the dead code, and the broken copy was the one
shipping.

**A ghost name flashed on every "Return" from the About page.** An old, larger version of
"Marco Sevilla" — a design you'd replaced — was appearing at full opacity for a quarter-second
inside a page that was fading out. Removed.

**The About page transition animated when it should have jumped.** A scroll reset was
inheriting "smooth scrolling" from a site-wide setting, so it slid around while the page was
already animating.

**Keyboard users hit two dead ends.** Closing the chat dumped keyboard focus back to the top
of the page. And the music scrubber announced itself to screen readers as a slider, accepted
focus — and then did nothing at all when you pressed the arrow keys. Both fixed; the scrubber
now supports arrows, shift-arrows for bigger jumps, and Home/End, and announces "2:17" instead
of reading out "137.42".

---

## Design system: better than you probably think, with one weak spot

You asked me to make sure everything is tied to design tokens (your defined type, colour and
spacing values, rather than one-off numbers). Here's the honest scorecard:

| | Verdict |
|---|---|
| **Spacing** | **Strongest.** Only 3 genuine violations in the whole codebase |
| **Colour** | **Strong.** Only 2 stray hardcoded palette colours in all of production |
| **Type** | **The weak spot.** ~79 places using sizes that aren't in your scale |

The spacing result surprised me enough to double-check it. There is technically *no* spacing
token system defined anywhere — and yet the code follows a consistent scale about 99% of the
time. Combined with your grid and the 48px header rhythm, spacing is already the most
disciplined of the three. **It doesn't need a token layer; adding one would be busywork.**

I made 10 changes that bind hardcoded values to tokens you already had, with **zero visual
change** — verified value-by-value, old versus new.

I deliberately **stopped short** of the type cleanup. There's an undocumented set of sizes
(10/12/13/14/18/32px) in use, and fixing it means either inventing tokens — which contradicts
your "I don't want a dozen styles" instruction — or changing how text looks. Both are your
call, not mine. Six specific decisions are written up with a recommendation for each.

One near-miss worth knowing: a "safe" swap I'd queued up would have **silently broken three
shadows**. The styling tool strips out any token nothing is using, so referencing an unused one
resolves to nothing at all — no error, the shadow just vanishes. That was caught by checking
the compiled output rather than trusting the change. I've left a warning comment where it
would bite next.

---

## Something that had never run at all

Your project had a code-quality checker installed but **no configuration file**, and the
command to run it had been broken by a framework upgrade. So it had never actually run — not
once. That's why several of these issues went unnoticed for so long.

It works now. The first run surfaced 67 items. **I did not mass-edit your code to satisfy
it** — almost none were real defects, and rewriting working code to please a linter is how you
introduce bugs. Instead I graded each rule by what it actually catches here, with the
reasoning written down. One genuine issue it found got fixed properly.

---

## What I chose NOT to do, and why

I want to be explicit about this rather than let it look like oversight.

- **I didn't delete ~45 MB of unused files.** They're real and they're unused — but visitors
  never download them, so this is repo tidiness, not site speed. And if the "unused" judgment
  is wrong by one file, you get a broken image in production. That's your call to make, not
  mine to make while you're away.
- **I didn't re-encode your two large background videos.** That changes how they look. I did
  fix the half that's free: they no longer download until you're nearly scrolled to them.
- **I didn't add carousel arrows.** Visual design decision on your homepage — see above.
- **I didn't act on most of the UX findings.** You asked for *suggestions* there, so they're
  written up rather than built.
- **I didn't push or deploy.** You didn't ask me to, and you should look at it first.

---

## Independent double-check

You asked me to double-check the work, so a separate reviewer — one that made none of these
changes and was told to be adversarial — retested everything against the original version.

**Result: 10 out of 10 passed. Zero regressions.** All 11 pages load with zero console errors,
no layout breaks at any of four screen widths, both light and dark themes clean, and the
carousel measured smooth with zero snap-backs.

It specifically hunted the worst possible outcome of the performance work — that pausing the
off-screen animations might leave **blank cards**. It found that across 251 frames of realistic
scrolling, exactly one frame showed an undrawn card: 95 pixels wide, for about 16 milliseconds.
Then it confirmed visually with screenshots in both themes.

Two things it was honest about not being able to test: one server-side check couldn't run
because there's no API key in the local environment (**worth one smoke test on your Vercel
preview**), and chat was tested with the network stubbed, so no API spend was incurred.

---

## Your next step

Everything is committed locally in three commits. Nothing is live.

1. Run `cd site && npm run dev` and click around — especially the carousel and the chat.
2. If it feels right, push.
3. Then read **`docs/audits/2026-08-05-OPPORTUNITIES.md`**. The top item — the carousel
   scroll affordance — is the one I'd genuinely act on next, and the second one is a
   one-line change: your best case study currently ends by sending the reader into a
   password wall.

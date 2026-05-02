# Case Study Interview Method

> A reusable methodology for gathering the material that makes a case study sing — origin, craft, decisions, and impact — through structured interview + parallel codebase research.
>
> **Paste this into a new Claude Code session when you're about to write a case study** (personal project, work project, or refreshing existing copy).
> Built from the conversation that produced the Playground case studies (Six Degrees, Pajamagrams, Custom Wrapped). The methodology is battle-tested for personal projects; the **work-context question banks (G–K) are proposed extensions** based on what would have made *those* sessions even more powerful, drawn from how senior IC product designers structure case studies.

---

## When to use this

- Starting a new case study from scratch (personal or work)
- Writing up a project months after the fact when memory is fuzzy
- Refreshing existing case study copy that reads flat or generic
- Resurfacing thinking on old work for portfolio updates, LinkedIn, or interview prep

---

## How Marco paste-uses this

Open a session in the relevant project directory and paste:

> "I want to write a case study for `[project name]`. Use the method in `docs/CASE-STUDY-INTERVIEW.md`. The repo / Figma / docs you should look at in parallel are: `[paths/links]`. Start the interview."

Claude should then:
1. Investigate the listed sources in parallel
2. Surface specific findings as a short summary
3. Run the interview question-by-question
4. Synthesize a voice/tone, propose drafts, and ship the docs/files Marco wants

---

## The methodology in one paragraph

The session works because **research and questions happen in parallel**, not sequentially. By the time the first question is asked, the codebase, the README, the CLAUDE.md, and any related Figma files have already been skimmed — so questions reference *specific decisions in the actual code*, not generic prompts. Questions are asked **one at a time** to respect ADHD parsing and to actually listen to the answer. Each answer gets a brief **"Logged: X"** reframe so the user can correct comprehension drift in real time. Synthesis questions (voice, throughlines, AI ratio, audience) are saved for the end. Drafts are proposed before files are written. IA decisions (where things live, what gets shipped) are confirmed before execution.

---

## Core principles

| # | Principle | Why |
|---|---|---|
| 1 | **Parallel research, never serial** | Code reading and question-asking happen simultaneously. The point of reading the code first is to ask *better* questions, not to skip questions. |
| 2 | **One question at a time** | Marco's ADHD parses focused inputs better. Also slows the interviewer down enough to actually listen. |
| 3 | **Specific over generic** | "Why synthesized Web Audio in `lib/sounds.ts` instead of audio files?" beats "tell me about the sound design." Quote actual code or decisions. |
| 4 | **Log briefly, don't summarize at length** | "Logged: X" in one sentence beats a paragraph. The log is a comprehension check, not an essay. |
| 5 | **Explain unknowns, don't push past them** | If Marco doesn't recognize a term ("what's GSAP?"), explain it cleanly with a comparison table or analogy, then re-ask. Never make him feel behind. |
| 6 | **Pillar extraction at the end** | Synthesize across answers to surface 2–4 throughlines that become the case study's spine and the section's umbrella message. |
| 7 | **Propose voice options, recommend one** | Don't present three equal choices. Show options (a)/(b)/(c), recommend one with reasoning, and ask. |
| 8 | **Propose drafts before writing files** | Show the proposed copy and ask for sign-off, edits, or rewrite. Don't surprise with files. |
| 9 | **Confirm IA decisions** | Where docs live, whether subpages are needed, how nav handles them — these are decisions worth pausing on. |
| 10 | **Trust but verify own claims** | When the user makes a claim about prior nav or architecture, check the actual files. Memory in CLAUDE.md can be stale. |

---

## Question banks

Pull from the relevant banks based on project type. **Banks A–F are universal** (used in the Playground session). **Banks G–K are work-specific** and proposed additions for corporate/team context. **Bank L** is synthesis — always saved for the end.

### A. Origin & motivation [universal]

- What's the kernel? Was there a real-world moment, conversation, or frustration that started it?
- Why this project, why now? What changed that made it the right moment?
- Was this primarily a **build-to-ship**, **build-to-learn**, or **build-to-give**?
- Did it start as something else and morph? What did it generalize from?
- If you didn't build this, what would the world look like? (Forces stakes.)

### B. Concept & scope [universal]

- In one sentence, what is this thing?
- Who's the audience — friends, customers, internal teams, recruiters, your future self?
- What's deliberately in scope? What's deliberately out?
- How did you decide where to stop?
- What constraints did you set yourself before opening the editor?

### C. Process & creative workflow [universal]

- What was the design rhythm? Did you design everything in Figma first, or build-and-design in parallel?
- Where did Claude / AI fit in the loop? At what step did it enter?
- Solo or collaborative? If collaborative, who shaped what?
- How many real iterations did the artifact go through? What changed from v1 to v2 to v3?
- Was there a moment where you almost gave up or pivoted hard?

### D. Tools & stack — the tradeoff lens [universal]

- For each major tool/framework: why this one over the obvious alternatives?
- Was the choice **deliberate** (you wanted to learn it / it was the right shape) or **pragmatic** (Claude recommended it / you already knew it)?
- What would the project look like if you'd made the opposite choice on the most consequential decision?
- Anything in the stack that surprised you in use — easier than expected, harder than expected?
- *Important*: if Marco doesn't remember why he picked a tool, **explain the tool first** so he can answer with context.

### E. Craft & hard decisions [universal]

- What was the single hardest thing to get right?
- What did you redo, and why?
- Where did "feel" matter more than "function"? How did you tune the feel?
- What broke or surprised you? (Sweat-moment questions are gold — they reveal scrappiness.)
- What's invisible to a casual viewer that you spent hours on?

### F. AI workflow [universal — this designer's signature]

- Roughly what % was AI-paired vs. hand-coded? (For framing voice, not for copy.)
- Where did AI accelerate? Where did it block or hallucinate?
- What did you learn about **prompting and specifying** that you'd carry forward?
- Did you use Figma MCP, Claude Code skills, MCP integrations? If so, how did the loop actually go?
- Was there a moment AI surfaced something you wouldn't have thought of?

---

### G. Stakeholders & collaboration [WORK — proposed]

- Who initiated this work? Who sponsored or championed it internally?
- Who designed it *with* you? Who reviewed and gave feedback? Who pushed back?
- How did you align with PM, engineering, and leadership? Where did those conversations happen — Slack, Figma comments, design reviews, 1:1s?
- Were there competing visions for the work? How did you reconcile them?
- Any organizational dynamics or politics that shaped the outcome (reorgs, exec interest, shifting priorities)?
- What was your role specifically — sole designer, lead of a pod, contributor on a team? What did *you* own end-to-end vs. share?

### H. Constraints, trade-offs, scope [WORK — proposed]

- What was the deadline? Was it real or arbitrary? How did it bend the design?
- What was the budget — engineering capacity, design capacity, your time?
- What got cut from the original vision? Who decided? Do you regret any of it?
- What did you push for that didn't make it? What would you do differently if you had the political capital?
- Were there compliance, legal, accessibility, or platform constraints that shaped the work?
- How did you negotiate scope with PM/eng when timelines slipped?

### I. Research & validation [WORK — proposed]

- What did you know about users *before* you started? How did you know it?
- What new research did you do — interviews, usability tests, surveys, data analysis, support ticket review, sales call shadowing?
- Did data or research ever push back on a design you loved? What happened?
- Did you ship anything that turned out to be wrong? How did you find out?
- What's a quote from a real user that sticks with you about this project?
- How did you decide research was "enough" to make a call?

### J. Impact & metrics [WORK — proposed]

- How was success measured? Was the metric set by you, by leadership, by data?
- What's the actual number — CARR, retention, NPS, time-on-task, conversion lift, support deflection? **Get a real number.**
- What did customers/users say? (Any direct quotes worth surfacing?)
- What changed for the *team* or *product* after this shipped? Did it set a precedent?
- Did anything go wrong post-launch — a regression, a bad rollout, a metric that moved the wrong way?
- What did you learn about how the company measures design impact?

### K. Hand-off, launch & after [WORK — proposed]

- How did design get built? What was the hand-off shape — Figma, prototypes, design specs, pair-programming with eng?
- Did you contribute to the design system as part of this? New components, new tokens, new patterns?
- A11y reviews — did the work pass, what did you have to fix?
- Phased rollout, A/B test, dark-launch, full release? How did you de-risk?
- What broke at launch? What got reverted? What got iterated on after week 1?
- What did the team's retro turn up? What would a future PM/designer pick up from this work?

---

### L. Synthesis / cross-cutting [save for the end of the interview]

- **Voice target.** Quote the existing copy back, then offer:
  - **(a) Playful & confident** — voice, wink, light first-person
  - **(b) Crafted & quietly self-assured** — third-person, measured, lets the work talk
  - **(c) Warm & personal** — leans diaristic, names beats from real life
  - …and recommend a default with reasoning. Always blend if it earns it (e.g., "(b) with flashes of (a)").
- **Throughlines.** What 2–4 themes emerge across this project and Marco's other work?
- **Audience.** Who is this case study primarily for — recruiters, hiring managers, peers, future self?
- **What does this project prove about Marco?** (Used to keep copy honest — every paragraph should serve this.)
- **Anything off-limits to mention?** (Names of recipients, specific personal data, NDA-bound details, internal stakeholder names.)

---

## Output format

Standard set of artifacts per project, unless Marco specifies otherwise:

| File | Purpose | Lives in |
|---|---|---|
| `{slug}-outline.md` | Raw context — everything Marco said + everything you read from the codebase + stack + architecture + lessons. Internal, exhaustive, factual, list-y. | `case-studies/[section]/` |
| `{slug}.md` | Polished short case study in the agreed voice. ~400–600 words for a personal project; ~800–1500 for a flagship work case study. | `case-studies/[section]/` |
| `page.tsx` + `[Name]Content.tsx` | Optional portfolio subpage if the case study deserves a real route. Match the existing house pattern (`CaseStudyShell`, `TwoCol`, `SectionHeading`, `FadeIn`, `ImagePlaceholder`, `NextProject`). | `site/app/[section]/[slug]/` |

For Playground projects: `case-studies/playground/`, `site/app/play/[slug]/`.
For Work projects: `case-studies/`, `site/app/work/[slug]/` (and add to `DEDICATED_ROUTES` per CLAUDE.md).

---

## Voice playbook

Tone is decided **per case study**, not at the brand level — but Marco's portfolio voice tends toward **(b) crafted & quietly self-assured, with flashes of (a) playful & confident**.

### Default voice rules

- **Third-person default**, occasional first-person when it earns its keep ("I built it as a stress test…")
- **Confident craft as the baseline** — let the work talk, don't pad with adjectives
- **Dry humor when the moment calls** — "wouldn't rage-quit," "the architecture is the easy part"
- **Specific over abstract** — "tuning the snap threshold by a few pixels of forgiveness" beats "obsessing over interaction details"
- **Numbers when honest** — concrete metrics, percentages, counts
- **Avoid** — résumé verbs ("leveraged," "spearheaded"), AI-buzzword phrasing ("AI-driven," "AI-enabled" used outright), false humility, false bravado

### When to deviate

- **Personal projects (Playground):** lean a little warmer, can name a beat from real life ("with the same friends who inspired it"). The "software as a love language" framing is on-brand.
- **Work projects (case studies):** lean a little more measured. Lead with the problem, the constraint, the customer. Save the personal beats for one or two human moments.
- **AI workflow projects:** don't over-credit AI. The frame is "I direct, AI builds" — Marco's craft is in the design vision, prompting, taste, iteration loops.

---

## Anti-patterns (what NOT to do)

- ❌ Asking 10 questions in one message
- ❌ Generic prompts like "tell me about your design process"
- ❌ Writing the case study before getting voice approval
- ❌ Putting words in Marco's mouth — if you're guessing, ask
- ❌ Padding with adjectives or verbs that don't earn their place
- ❌ Stating the project's "themes" outright in copy (signal them, don't say them)
- ❌ Naming people, partners, or NDA-bound stakeholders without explicit confirmation
- ❌ Citing memory or CLAUDE.md as gospel for current architecture — verify against the actual files
- ❌ Treating IA decisions (file paths, route structure, nav inclusion) as obvious — they aren't, confirm them
- ❌ Skipping the synthesis questions at the end — they're where the throughline emerges

---

## Session shape (the rhythm that worked)

A typical session runs roughly like this:

1. **Setup (1 message)** — Marco opens the session and pastes this doc + project pointers
2. **Parallel scan (1–2 minutes)** — Claude reads the codebase, README, CLAUDE.md, related docs in parallel; surfaces specific findings as a short summary
3. **Question pass (10–20 minutes)** — Banks A–F (or A–K for work), one question at a time, each answer logged briefly. Save bank L for the end.
4. **Synthesis (3–5 minutes)** — Voice options offered with a recommendation; pillars extracted; audience confirmed.
5. **Drafts (5–10 minutes)** — Card-level descriptions, page-level case study, IA proposal — all shown for sign-off before any files are written.
6. **Build (5–15 minutes)** — Files written, build/typecheck verified, dev server smoke-tested, commit drafted.
7. **Iterate** — Marco previews locally; tweaks go in; commit.

Total: ~45–60 minutes for a personal project, ~90–120 for a work flagship.

---

## What "good" looks like at the end

A case study that:

- Has a **specific, true origin story** — not generic problem framing
- Names **at least one technical or design decision in concrete detail** that another designer would respect
- Includes **at least one moment of struggle, surprise, or scrappy iteration** — proves the work was real, not airbrushed
- Has **a single sentence** somewhere that captures the throughline of the case study (and ideally connects to the portfolio's larger thesis)
- Avoids **AI buzzword phrasing** while clearly demonstrating an AI-augmented practice through the *substance* of how the work was made
- Closes with **either a result, a reflection, or a "what this proves to me"** beat — never just trails off
- Reads like **Marco wrote it**, not like a portfolio template — voice consistent with the rest of his work

---

## Maintenance

- When a new question category proves valuable across multiple sessions, add it to a bank above
- When a question turns out to consistently produce thin answers, reword or remove
- Keep the doc tight — if it crosses ~500 lines, prune
- This doc is for Marco AND for Claude — if you change the methodology, change the doc

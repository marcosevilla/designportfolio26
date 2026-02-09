# Case Study Playbook

A repeatable process for writing portfolio-ready product design case studies with depth and rigor. Built from writing all 6 case studies: F&B Mobile Ordering, Compendium, Upsells Forms, Check-in Dashboard 2.0, Above Property Portal, and Knowledge Base Redesign.

---

## How to Use This

When starting a new case study, tell Claude:

> "Write a case study for [project name] following the playbook in /Users/marcosevilla/Desktop/docs/case-studies/CASE-STUDY-PLAYBOOK.md"

Claude will gather context from all sources, draft the case study, and flag gaps with `[TODO]` placeholders.

---

## Phase 1: Context Gathering

Search **all five sources** for every case study. Don't skip any — each source provides different signal.

### Source 1: Linear

**What to search:**
- Project by name → get milestones, issue count, completion %, start/target dates, lead, status
- Marco's assigned issues within the project → get specific design tickets, descriptions, Figma links
- Related projects (e.g., for Upsells Forms, also search Upsells Variants, Denied Requests, Auto-approval)
- Initiative KRs linked to the project → business targets and success metrics

**What to extract:**
- Timeline (project start → completion dates)
- Scope (total issues, % complete, milestones)
- Team (project lead, PM, engineers from issue assignments)
- Design decisions embedded in issue descriptions (ERDs, data models, flow descriptions)
- Figma links from issue descriptions
- Iteration count from milestones

**Query patterns:**
```
list_projects: query="[project name]", includeArchived=true, includeMilestones=true
list_issues: assignee="me", query="[project name]", limit=100, includeArchived=true
list_issues: project="[project ID]", limit=250 (for full project scope)
```

### Source 2: Notion

**What to search:**
- PRDs (Product Requirements Documents) — objectives, user stories, success metrics, feature requirements
- Eng design docs — data models, API specs, frontend architecture, implementation tickets
- Launch docs — GTM strategy, target audience, rollout plan
- OKR reviews — monthly business KPIs (CARR, ARR, adoption rates, MAU), product KPIs, strategic account reviews
- User research notes — interview scripts, user testing sessions, customer feedback synthesis
- Training scripts — how CS describes the feature (reveals the value prop)
- Design walk-through pages — linked from design review agendas

**What to extract:**
- Business metrics (CARR, revenue, adoption %, churn, YoY growth)
- Customer quotes and reactions from research sessions
- Competitive landscape (feature comparison tables)
- Success metrics defined in PRDs (what the team aimed for)
- GTM context (pricing, target audience, rollout sequence)
- Strategic account names and feedback (Omni, COMO, Wyndham, IHG, etc.)

**Query patterns:**
```
notion-search: query="[project name] PRD"
notion-search: query="[project name] design"
notion-search: query="OKR review [product area]"
notion-search: query="[project name] research"
notion-fetch: id="[page ID from search results]" (for full page content)
```

### Source 3: Slack

**What to search:**
- Marco's design shares in #epd-in-stay, #canary-design — these contain Figma links, Loom walkthroughs, design rationale
- EOW/EOD updates in #epd-in-stay — timeline of what Marco worked on each week
- PM conversations (DMs with Nico, Becca) — scope decisions, priority debates, customer feedback
- Customer/pilot feedback threads — real user reactions, pain points, feature requests
- #just-hatched announcements — launch posts with eng context
- #product-questions — CS asking about the feature (reveals real customer needs and gaps)
- #product-team — strategic discussions, competitive analysis, process proposals
- Design hand-off meeting notes (Google Drive links in Notion search results)

**What to extract:**
- Direct quotes from customers/stakeholders
- Design rationale in Marco's own words (from design shares)
- Scope decisions and trade-offs (from PM conversations)
- Customer pain points (from #product-questions)
- Launch reactions and early feedback
- Cross-functional collaboration evidence (working with eng, CS, sales)
- Prototype URLs and evolution

**Query patterns:**
```
conversations_search_messages: search_query="[project name] design", limit=20
conversations_search_messages: search_query="[feature] Marco", limit=20
conversations_search_messages: search_query="[project name] feedback customer", limit=20
```

**Note:** Slack user filter uses display names, not @handles. If filtering by user fails, search without the filter and look for Marco's messages in results.

### Source 4: Local Context Docs

**What to reference:**
- `/Users/marcosevilla/Documents/marcowits/Canary/context/profile.md` — role, strengths, growth areas, promotion criteria from Aman
- `/Users/marcosevilla/Documents/marcowits/Canary/context/company.md` — product suite, codebase structure, team
- `/Users/marcosevilla/Documents/marcowits/Canary/context/projects/` — project-specific overviews if they exist
- `/Users/marcosevilla/Desktop/docs/canary-work-summary.md` — ownership stats (files owned / total), iteration counts per project
- `/Users/marcosevilla/Documents/marcowits/Canary/context/projects/misc/performance-2026.md` — Aman's performance feedback (useful for Reflection section)

**What to extract:**
- Ownership percentages and iteration counts (for Quick Stats)
- Performance feedback themes (for Reflection — "What I learned")
- Promotion criteria alignment (frame design decisions in terms of senior-level behaviors)
- Codebase paths (shows technical awareness)

### Source 5: Figma

**What's available:**
Figma MCP tools are connected (Marco authenticated as msevilla@canarytechnologies.com, Canary Technologies org, Pro plan). However, the tools **cannot search or list files** — they require file keys and node IDs.

**How to get file keys:**
- Linear issue descriptions often contain Figma links (e.g., DSN-130 references the Above Property Figma)
- Slack design share messages contain Figma URLs
- Notion PRDs and eng design docs reference Figma files
- Collect file keys from these sources during Phase 1 searches

**Available tools:**
- `get_metadata` — sparse XML of layers (names, types, positions, sizes). Good for understanding page structure.
- `get_screenshot` — captures visual of a selection. Good for case study visuals.
- `get_design_context` — extracts design context for code generation (React + Tailwind default). Good for documenting component patterns.
- `get_variable_defs` — design tokens (colors, typography, spacing). Good for design system documentation.
- `get_figjam` — converts FigJam diagrams to XML. Good for brainstorm/IA artifacts.

**Query patterns:**
```
# Get file structure (requires file key from URL)
get_metadata: fileKey="IKNHA6AMAO60UUyR65FZfA", nodeId="2301-3566"

# Get visual screenshot
get_screenshot: fileKey="1nR9UummPr3j06xQD0zhic", nodeId="4308-3463"

# Get FigJam brainstorm
get_figjam: fileKey="eagUaA8anDGaMEIGfBRqVU", nodeId="0-1"
```

**Limitation:** No file search or listing capability. Always collect file URLs from other sources first.

---

## Phase 2: Drafting

### Template Structure

Follow `/Users/marcosevilla/Desktop/docs/case-study-template.md` exactly:

1. **Card View** — cover image placeholder, project name, one-line description, company/year/role, 3 skill tags
2. **Hero Section** — one-sentence product description, company, timeline, role, team composition
3. **Quick Stats** — 4 metrics that prove impact (lead with strongest)
4. **The Problem** — 2-3 sentences: business context, what wasn't working, stakes
5. **The Solution** — 1-sentence summary, hero mockup placeholder, 3-4 key design decisions (each: decision name, 1-2 sentences explaining "why," visual placeholder)
6. **[+] Research & Discovery** — research methods used, 4-5 key insights (each: insight → how it shaped the design), research artifact description
7. **[+] Design Process** — approach philosophy, iterations by phase (chronological), constraints designed around, before/after placeholder
8. **[+] Impact & Results** — business impact (metrics), user impact (quotes, behavior changes), product impact (platform/architectural effects), expansion pipeline
9. **[+] Reflection** — worked well (3-4 items), would change (2-3 items), what I learned (2-3 items)
10. **Visual Gallery** — 8-10 TODO placeholders for key screens
11. **Next Project CTA** — link to next case study

### Writing Rules

**Voice:**
- First person ("I designed..." not "The design was...")
- Conversational, not corporate
- Confident, not boastful
- Specific, not vague — name the hotel, quote the person, cite the number

**What makes a strong case study:**
- **Specific customer names and quotes** — "Hotel Jackson's response: 'Dream come true'" beats "Users were pleased"
- **Design decisions framed as "why"** — not "I used a full-page layout" but "The existing modal couldn't accommodate forms, and I knew variants and categories were coming, so I redesigned as full-page to create room for growth"
- **Metrics with context** — "$833K CARR (+141% YoY)" beats "$833K CARR"
- **Constraints named explicitly** — "No POS integration at launch," "5 questions max per upsell," "No app download"
- **Cross-product connections** — showing how patterns from one project informed another demonstrates systems thinking
- **Honest reflection** — "I should have pushed for dropdown in MVP" is more credible than "Everything went perfectly"

**What to avoid:**
- "I'm passionate about..."
- "I believe in user-centered design..."
- Jargon without explanation
- Vague impact ("improved the experience")
- Process for process's sake
- Listing activities instead of decisions

### Metrics Strategy

1. **Search Linear issues and Notion OKR reviews** for referenced metrics first
2. **Use initiative KRs as proxy metrics** where direct metrics aren't available (e.g., "revenue per room from $5.10 to $10")
3. **Extract from Notion OKR review tables** — these have CARR, ARR, adoption rates, MAU, churn, YoY comparisons
4. **Use Slack #product-questions** — CS often references specific numbers when answering property questions
5. **Flag all missing metrics** with `[TODO: metric description]` for Marco to fill from internal dashboards (Amplitude, Omni)

### TODO Placeholders

Use clear, descriptive placeholders:
```
[TODO: Cover image — hero shot of guest ordering flow on mobile, 16:9]
[TODO: Visual — menu landing screen]
[TODO: Post-launch metrics — actual order volume, revenue per hotel, adoption rate]
[TODO: Guest satisfaction scores, NPS data if available]
```

---

## Phase 3: Quality Check

Before delivering, verify:

- [ ] All 5 sources were consulted (Linear, Notion, Slack, local docs, Figma)
- [ ] Problem section has specific stakes (not generic "improve experience")
- [ ] Each key design decision explains the "why," not just the "what"
- [ ] At least 2 specific customer/stakeholder quotes included
- [ ] Metrics have context (%, YoY, MoM comparisons)
- [ ] Research section names specific hotels/users tested with
- [ ] Process section is chronological with named collaborators
- [ ] Reflection includes genuine "would change" items (not just wins)
- [ ] Cross-product connections mentioned where relevant
- [ ] All `[TODO]` items are clearly described so Marco can fill them
- [ ] Consistent formatting with other case studies in the folder
- [ ] "Next Project" CTA links to the correct next case study

---

## Suggestions for Stronger Case Studies

### 1. Lead with the simplifying insight

Every strong case study has one core design insight that simplified the problem. Find it and make it the centerpiece of the Solution section.

- F&B: "Delivery type drives the entire experience" — one variable that determines 6 checkout scenarios
- Compendium: "Custom sections as the extensibility layer" — one pattern that replaced dozens of section types
- Upsells Forms: "Scope down features, scope up the container" — text-only MVP inside a full-page layout built for growth

### 2. Show the prototype-to-product pipeline

Marco builds code prototypes (Vercel, Next.js) — this is a differentiator. Every case study should highlight:
- What the prototype was (URL, tech, what it demonstrated)
- Who tested with it (specific hotels)
- How it evolved (versions, what changed after feedback)
- What it became beyond design (GTM asset, sales demo, training tool)

### 3. Frame decisions in terms of senior-level behaviors

Aman's promotion criteria: (1) stakeholder communication, (2) design leadership, (3) product thinking. Each case study should demonstrate at least one:
- **Stakeholder communication:** "I shared a comprehensive design share to #epd-in-stay covering all 6 scenarios"
- **Design leadership:** "I proactively prioritized design tickets by business impact rather than waiting for prioritization"
- **Product thinking:** "I connected the delivery-type model to the broader platform architecture for future ordering scenarios"

### 4. Include the competitive landscape

Every case study benefits from showing awareness of alternatives:
- What competitors offered (Duve, Toast, Iris, Oaky, Stay)
- What Canary's competitive gap was
- How the design closed or differentiated from that gap

### 5. Connect to revenue and business outcomes

Design portfolios often lack business context. Every case study should include:
- The business initiative or KR the project contributed to
- Revenue metrics (CARR, ARR, approved revenue) even if approximate
- Customer acquisition context (verbal commitments, pipeline, enterprise traction)
- Pricing context (how the feature is sold, bundled, or priced)

### 6. Name the collaborators

Specific names make the work feel real and demonstrate cross-functional skill:
- PMs: Nico Garnier, Becca Aleynik
- Engineers: Tommy Slater, Austin Irvine, Adil Shaikh
- Designers: Miguel (Senior), Wenjun (Staff)
- Stakeholders: Aman (VP Product)
- Customers: Hotel Jackson (Christine), HOMA Cherngtalay, Chateau Avalon, Malibu Beach Inn

### 7. Mine Figma for design-decision specifics

Figma files contain details that transform generic case study language into concrete, credible descriptions:
- **Taxonomies and IA structures** — Full category lists, hierarchy levels, naming conventions (e.g., KB's "Basic Info → Policies → Amenities → Services, Facilities, Dining, Shopping, Outdoor → Location → In-room")
- **System object models** — How objects relate to each other (e.g., F&B's Service Locations → Menus → Items → Modifier Sets → Orders)
- **State logic and constraints** — What happens at limits, what's disabled vs. hidden (e.g., "Add option" disables at 15, managed portfolios disable all editing)
- **Progressive disclosure flows** — Question branching, conditional UI, yes/no/unanswered patterns
- **Design annotations** — Problem framing, approach options, and rationale written directly in Figma (especially on "Design Review" pages)

The best approach: pull metadata from key Figma nodes after the draft is complete, then update the Key Design Decisions and Design Process sections with specific details.

### 8. Use the Reflection section strategically

The Reflection section is where credibility is built. Strong "would change" items show self-awareness:
- Specific enough to be believable ("I should have caught the item remarks discoverability issue in prototype testing")
- Connected to a lesson ("Form design is workflow design — the form itself is the easy part")
- Forward-looking ("I'd push to get AI menu parsing into the roadmap earlier")

Avoid generic reflections like "I'd do more research" or "I'd communicate more."

---

## Reference Files

| File | Purpose |
|------|---------|
| `case-study-template.md` | Template structure and formatting rules |
| `CASE-STUDY-PLAYBOOK.md` | This file — process and quality standards |
| `canary-work-summary.md` | Ownership stats and iteration counts |
| `fb-mobile-ordering.md` | Reference case study (most detailed) |
| `compendium.md` | Reference case study (platform/systems angle) |
| `upsells-forms.md` | Reference case study (workflow/form design angle) |
| `checkin-dashboard-2.md` | Reference case study (enterprise/shared ownership angle) |
| `above-property-portal.md` | Reference case study (enterprise IA/permissions angle) |
| `knowledge-base-redesign.md` | Reference case study (IA/foundational design angle) |

---

## Lessons Learned (from writing all 6 case studies)

### Process Issues Encountered

1. **Notion search results exceed token limits.** Notion searches for broad terms ("compendium," "check-in") return 25K+ tokens and get truncated. **Fix:** Use targeted queries (e.g., "compendium PRD," "check-in V2 KR") and fetch specific page IDs rather than browsing search results.

2. **Slack user filter doesn't work with @handles.** `filter_users_from: "@marcosevilla"` returns "user not found." **Fix:** Search without user filter and use query terms that naturally surface Marco's messages (e.g., "compendium design Marco," "[project] feedback customer").

3. **Earlier case studies may have thinner Slack sourcing.** When writing multiple case studies in sequence, context window pressure means later searches are more thorough than earlier ones. **Fix:** After completing all drafts, do a dedicated audit pass — read each case study looking for generic language (e.g., "positive sentiment" instead of a real quote), then run targeted Slack searches to fill gaps.

4. **Notion PRDs and Initiative KRs are high-value but easy to skip.** The PRD has success metrics, user stories, and feature requirements. Initiative KRs provide "Target → Result" framing for metrics. Both are worth fetching even if the case study seems complete from other sources.

5. **Figma metadata exceeds token limits for complex files.** `get_design_context` and `get_metadata` on dense pages (form builders, dashboards) return 100K–1.3M characters. **Fix:** Save results to disk, then use Grep to search for meaningful text content (labels, annotations, section names). Alternatively, request metadata on specific child nodes rather than entire pages.

6. **Figma file keys must be collected from other sources first.** The Figma MCP tools cannot search or list files — they require file keys extracted from URLs. **Fix:** During Phase 1 Linear/Slack/Notion searches, actively collect every Figma URL mentioned. Linear issue descriptions and Slack design shares are the richest sources of file keys.

7. **Figma design review pages contain the richest case study material.** Pages named "Design Review" or containing annotations (problem framing, approach options, taxonomy diagrams) are far more valuable for case studies than polished final screens. These pages often contain the designer's thinking process — which is exactly what a case study needs to articulate.

### Quality Gaps to Watch For

1. **Hero section team names** — Easy to write "1 Designer, 3 Engineers, 1 PM" and move on. Name the PM and tech lead at minimum. Naming engineers shows cross-functional awareness.

2. **Quick Stats defaulting to process metrics** — Iteration counts and issue completion % are filler when business metrics aren't available yet. Flag these with `[TODO: Replace with business metrics when available]` rather than locking in weak stats.

3. **Competitive landscape varies by case study** — F&B and Compendium have strong competitive sections; Upsells and Check-in are thinner. Every case study should name at least 2-3 competitors with specific feature comparisons.

4. **Cross-product connections need to be explicit** — Marco's projects share patterns (builder layouts, translation pickers, live previews, modifier systems). These connections demonstrate systems thinking but are easy to leave implicit. Each case study should have at least one sentence connecting a pattern to another project.

5. **Initiative KRs missing** — Metrics are stronger when framed as "Target: X → Result: Y" rather than just citing numbers. Pull KRs from Linear initiatives when available.

6. **Figma data can enrich design decisions with specifics** — Figma metadata reveals concrete details that strengthen the narrative: full taxonomies (KB's categorization structure), system object models (F&B's 5 interconnected objects), constraint values (Upsells' 15-option dropdown limit), and UI state logic (Above Property's "all editing disabled" for managed portfolios). After drafting, do a Figma audit pass to see if design details can replace generic descriptions with specific ones.

7. **Figma Visual Gallery should link to specific nodes, not just files** — Every TODO placeholder in the Visual Gallery should include a `?node-id=` parameter pointing to the exact frame. This saves time when Marco exports screenshots later. Collect node IDs during the Figma metadata analysis.

### Simplifying Insight by Case Study

Every case study should have one core design insight in the Solution section:

| Case Study | Simplifying Insight |
|---|---|
| F&B Mobile Ordering | "Delivery type drives the entire experience" — one variable determines 6 checkout scenarios |
| Compendium | "Custom sections as the extensibility layer" — one pattern replaced dozens of section types |
| Upsells Forms | "Scope down features, scope up the container" — text-only MVP inside a full-page layout built for growth |
| Check-in Dashboard 2.0 | "Verification as a checklist, not a single action" — breaking check-in into discrete steps lets staff track progress and nothing gets missed |
| Above Property Portal | "Two-tier role architecture" — Above Property vs. Managed roles as the single organizing principle for enterprise permissions |
| Knowledge Base Redesign | "Where does this live?" — the navigation question that reframed a UI problem as a product architecture problem |

---

---

## Industry Best Practices (from research across 20+ sources)

The following is synthesized from portfolio guidance by HubSpot design leadership, Figma recruiters, Julie Zhuo, Tanner Christensen (ex-Netflix), GV (Google Ventures), Alicja Suska (1000+ portfolio reviews), Intercom, Catt Small (The Staff Designer), and others.

### The 10 Non-Negotiables for Senior/Staff Case Studies

1. **Lead with the outcome, not the process.** Hook in 10 seconds. Hiring managers spend ~60 seconds deciding whether to read further. State the problem, your role, and the result up front.
2. **Clarify your specific role** and contributions honestly. Julie Zhuo asks candidates directly: "What decisions were you directly responsible for?"
3. **Show design judgment**: trade-offs, constraints, what you fought for and what you lost. HubSpot wants "hard constraints that led to compromised design solutions you can defend."
4. **Connect research to decisions** with explicit cause-and-effect. Listing findings without showing how they shaped the design creates a disconnected narrative.
5. **Include failed directions** and what you learned from them. Show the messy middle, not just the polished output.
6. **Annotate every visual** — never drop screenshots without context. One of the most frequent mistakes across 1000+ portfolio reviews.
7. **Quantify impact** or use qualitative alternatives (user quotes, behavioral observations) when metrics are confidential.
8. **End with genuine reflection**, not performative humility. Julie Zhuo asks: "If you had two more months, what would you have done differently?"
9. **Keep it scannable**: 60-second skim test, 5-minute deep read. Bold headings, short paragraphs, annotated images.
10. **For staff level**: demonstrate systems thinking, cross-team influence, and strategic contribution beyond your immediate project.

### Common Mistakes to Avoid (The Fatal Seven)

1. **Process recitation** — Walking through discover → research → ideate → test as though the process itself is impressive. HubSpot: "We assume everyone uses a similar process. We want to see the thinking, not the steps." Tanner Christensen: "The typical design process outline is boring and tells interviewers nothing about you."
2. **Too long / not scannable** — Case studies should be digestible in 1-2 minutes of scanning.
3. **Not clarifying your role** — Especially on team projects. Be honest about your specific contribution.
4. **Dropping images without context** — Mockups without annotations is one of the most frequent mistakes.
5. **Not connecting research to decisions** — Spell out cause-and-effect, not just list findings.
6. **Cookie-cutter process** — Show that you adapt methodology to context, not follow a rigid framework.
7. **Missing reflection** — Not including what failed or what you'd change. Hiring managers say this tells them the most.

### What Separates Senior from Junior in a Portfolio

| Signal | Junior | Senior/Staff |
|---|---|---|
| Problem | Solves the given problem | Frames and chooses the right problem |
| Research | Executes research | Proposes and prioritizes what to research |
| Process | Follows a framework | Adapts process to constraints |
| Decisions | Describes what was built | Explains trade-offs, what was cut and why |
| Metrics | States outcomes | Connects design decisions to business outcomes |
| Influence | Works within their team | Influences adjacent teams, org-wide standards |
| Systems | Designs screens | Designs systems, components, scalable patterns |
| Reflection | "I'd do more research" | Specific, actionable, forward-looking |

### Storytelling Frameworks

- **SCQA** (Situation, Complication, Question, Answer) — Set the scene, introduce tension, pose the design question, present your answer up front. Recommended as the opening hook.
- **BAB** (Before, After, Bridge) — Show the before state, the after state, then explain how your design bridged them. Effective for quick-scan impact.
- **Tanner Christensen's insight**: "A common mistake is assuming interviewers want to hear a profound narrative about the product problem. We don't. We want to hear about YOUR challenges while working on the product problem."

### Portfolio-Level Considerations

- **3-5 case studies** is the consensus. Fewer than 3 looks like a one-hit wonder. More than 5 means you're showing mediocre work. "You will be judged by your weakest project."
- **Show range** across problem types, platforms, and team sizes — but also show a **through-line** (a design identity or philosophy).
- **Lead with your strongest work.** End with a CTA.
- **The portfolio itself is a UX test** — overdone interactions, complex loading, and heavy animations are anti-patterns.
- **For promotion portfolios**: choose projects that evidence skills for the NEXT role, not the current one.

### Sources

- [HubSpot - Portfolio Reviews Done Right](https://product.hubspot.com/blog/portfolio-reviews-done-right)
- [Figma - Portfolio Tips from a Figma Recruiter](https://www.figma.com/blog/product-design-portfolio-tips-from-a-figma-recruiter/)
- [GV - How to Review Portfolios](https://library.gv.com/hiring-a-product-designer-how-to-review-portfolios-8a161746d3c4)
- [First Round - Facebook's Method for Hiring Designers](https://review.firstround.com/an-inside-look-at-facebooks-method-for-hiring-designers/)
- [Tanner Christensen - How to Strengthen Your Portfolio](https://medium.com/@tannerc/how-to-strengthen-your-design-portfolio-1b635a5561f9)
- [Alicja Suska - I Reviewed 1000+ Portfolios](https://medium.com/design-bootcamp/i-reviewed-1000-product-design-portfolios-heres-what-i-ve-learned-6a19e37581af)
- [UX Playbook - Minto Pyramid for Case Studies](https://uxplaybook.org/articles/ux-case-study-minto-pyramid-structure-guide)
- [Intercom - IC Career Path for Product Design](https://www.intercom.com/blog/product-design-ic-career-path/)
- [Rosenfeld Media - The Staff Designer by Catt Small](https://rosenfeldmedia.com/books/the-staff-designer/)
- [Indeed Design - The Art of Storytelling for Case Studies](https://indeed.design/article/the-art-of-storytelling-for-case-studies/)
- [Dribbble - Senior UX Designer Portfolio](https://dribbble.com/resources/career/senior-ux-designer-portfolio)

---

---

## Case Study Page Design: Visual & UX Best Practices

How the case study page itself should be designed on the web — layout, typography, imagery, interactions, and performance patterns from top product design portfolios.

*Compiled from research across NN/g, Smashing Magazine, Baymard Institute, IxDF, Tobias van Schneider, and 20+ portfolio examples from designers at Stripe, Vercel, Linear, and others.*

### Page Layout & Structure

**Reading width:**
- Body text: ~66 characters per line (`max-width: 66ch` or ~700px). WCAG 1.4.8 says ≤80 characters.
- Images break out wider: ~1200px for key mockups, full-bleed (100vw) for hero and impact moments.
- This "narrow text / wide imagery" pattern is the dominant layout among top portfolios.

**Visual rhythm — alternate between:**
```
[Full-bleed hero image with title overlay]
[Metadata bar: role, timeline, team, tools]
[Brief intro text — narrow column]
[Full-bleed or wide image — final product showcase]
[Section heading + body text — narrow column]
[Medium-width process image with caption]
[Pull quote or key metric callout — wide, centered]
[Device mockup presentation — contained]
[Results / impact section with metrics]
[Next project link]
```

**Spacing:**
- Use a consistent spacing scale (e.g., 8px base: 24, 48, 96, 128px between sections).
- Paragraph spacing ≈ 1.39× line-height.
- Generous whitespace is the foundation of visual hierarchy — more is almost always better.

### Typography

**Font sizes:**
| Element | Size | Line-height |
|---------|------|-------------|
| H1 (case study title) | 48-72px | 1.1-1.2 |
| H2 (section headers) | 32-40px | 1.2-1.35 |
| H3 (sub-sections) | 24-28px | 1.3-1.4 |
| Body text | 18-22px | 1.5-1.6 |
| Pull quotes / callouts | 28-36px | 1.3-1.4 |
| Captions | 14-16px | 1.4 |
| Metadata labels | 12-14px uppercase, letter-spaced | — |
| Impact metrics | 48-80px bold, accent color | 1.1 |

**Rules:**
- Limit to 3 distinct type sizes max. Hierarchy via size + weight + opacity, not color alone.
- Test hierarchy in grayscale — if it doesn't work without color, it doesn't work.
- Use `clamp()` for fluid scaling between breakpoints.
- 1-2 font families max. Consistency across the portfolio matters more than novelty.

### Image & Media Presentation

**Display widths:**
| Pattern | Width | Use for |
|---------|-------|---------|
| Full-bleed | 100vw | Hero images, dramatic visual breaks, mood shots |
| Wide contained | ~1200px | Primary mockups, key screens |
| Text-width | ~700px | Process artifacts, sketches, diagrams |
| Side-by-side | 50/50 or 60/40 | Before/after, variant comparisons |

**Rules:**
- Show 4-10 key mockup screens per case study.
- Every image needs a caption — never drop screenshots without context.
- Device mockups for heroes and thumbnails (realistic frames). Minimal/flat frames for inline images.
- Before/after: side-by-side on desktop, stacked on mobile, with clear labels.
- Short video clips (10-30s, autoplay muted) for interaction demos and prototype walkthroughs.
- Aim for 60-80% text, 20-40% images as a rough ratio.

### Hero / Header Patterns

**Dominant pattern:**
- Full-bleed hero image (or brand-color background) filling near-viewport height.
- Project title overlaid in large type (48-72px).
- One-line description below.
- Show the final product as an appetizer — the parts you're most proud of.

**Metadata block** immediately below hero:
- Role, timeline, team, company, tools, platform.
- Labels: uppercase, small (12-14px), letter-spaced, muted. Values in regular weight below.

**Optional TL;DR:** 2-3 sentence summary for busy reviewers. Hiring managers spend ~60 seconds deciding whether to read further.

### Navigation Within Case Studies

**Sticky sidebar TOC** (preferred):
- Left or right sidebar with `position: sticky`. Highlight active section via intersection observer.
- NN/g caution: in-body sticky TOCs compete with global nav and are often missed. Sidebar placement avoids this.

**Progress bar:**
- Thin (2-4px) bar at page top, filling left-to-right as user scrolls. Unobtrusive and informative.
- Pages with TOCs see 27% longer engagement and 18% higher CTR.

**Next project link** at the bottom of every case study:
- Critical for retention — keeps reviewers in your portfolio.
- Full-width card with next project's hero image, title, and brief description.

**Other:** Back-to-top button (bottom-right, appears after fold), breadcrumbs, estimated reading time.

### Interactive Elements

**Recommended:**
- Scroll-triggered fade-ins (sections and images gently fade/slide in). Subtle and widely used.
- Before/after sliders for redesign work. Highly effective.
- Embedded Figma prototypes or short recorded prototype videos.
- Expandable/accordion sections for detailed process content, keeping the main flow scannable.
- Animation duration: 200-500ms. 200-300ms for smaller elements.

**Avoid:**
- Heavy parallax (feels dated if overdone).
- Animations that block content or require interaction to access information.
- Gratuitous motion for its own sake.

**Accessibility:**
- Always respect `prefers-reduced-motion`.
- Ensure keyboard navigation throughout.
- Never let immersion block content — always provide a straightforward path to the same information.

### Mobile Responsiveness

- Stack everything vertically. Side-by-side → stacked. Full-bleed images → edge-to-edge (no padding).
- Serve responsive images via `srcset` / `<picture>`. Don't send 1920px images to 360px screens.
- Touch targets: minimum 44×44px for all tappable elements.
- Body text: 16-18px on mobile (vs 20-22px desktop).
- Reduce or disable heavy scroll animations for battery and performance.
- Consider horizontal swipe carousels for image galleries.

### Performance

**Images:**
- Use WebP or AVIF. Significant savings over JPEG/PNG.
- Never lazy-load the hero image (LCP element). Preload it: `<link rel="preload" as="image">`.
- Use `loading="lazy"` on all images below the fold.
- Always set `width` and `height` on `<img>` (or use `aspect-ratio` CSS) to prevent layout shift.
- Use BlurHash or LQIP placeholders while images load.

**Budgets:**
- Total page weight: <3MB (before lazy loading).
- Above-the-fold content: <1MB.
- Core Web Vitals targets: LCP <2.5s, CLS <0.1, INP <200ms.

**Animation:**
- Prefer CSS animations over JS. Use `transform` and `opacity` only (cheapest for GPU).
- CSS scroll-driven animations API for scroll effects without JS.
- Test on real mid-range Android devices, not just MacBook Pro.

### Common Mistakes (Visual & UX)

1. **Walls of text** with no visual breaks — readers lose interest immediately.
2. **Tiny, low-quality images** — if reviewers can't see UI detail, the case study fails.
3. **Image dumps with no captions** — mockups without explanation are meaningless.
4. **Poor portfolio design** — "If you can't make your own portfolio look good, hiring managers will rightly think twice."
5. **Inconsistent styling** across case studies — the portfolio should feel like a cohesive product.
6. **No visual hierarchy** — all text same size/weight, readers can't scan.
7. **Slow loading** — too many unoptimized images, heavy animations.
8. **Broken prototype links** — use screenshots instead of relying on external tools.
9. **No next-project navigation** — case study ends, reviewer bounces.
10. **Not mobile-optimized** — many reviewers first see your portfolio on their phone.

### Actionable Checklist

**Must-haves:**
- [ ] Narrow text column (~66ch) with breakout images
- [ ] Full-bleed hero with title, one-liner, and product preview
- [ ] Metadata block (role, timeline, team, tools)
- [ ] Consistent vertical spacing scale
- [ ] Large, high-quality images with captions
- [ ] Mobile-optimized (tested on real phones)
- [ ] Next project link at bottom of every case study
- [ ] Fast loading (optimized images, lazy load below fold, preloaded hero)
- [ ] Clear visual hierarchy (passes grayscale test)
- [ ] Scannable layout (gist visible from quick scroll)

**Nice-to-haves:**
- [ ] Sticky sidebar TOC with active state
- [ ] Reading progress bar
- [ ] Subtle scroll-triggered fade-in animations
- [ ] Before/after interactive sliders
- [ ] Embedded Figma prototypes or video demos
- [ ] Estimated reading time
- [ ] BlurHash image placeholders
- [ ] Breadcrumb navigation

### Reference Portfolios

| Designer | Company | URL | Known for |
|----------|---------|-----|-----------|
| Rauno Freiberg | Vercel | rauno.me | Interaction craft, code as medium |
| Karolis Kosas | Stripe | karoliskosas.com | Clean minimalism, strong process |
| Tobias van Schneider | Semplice | vanschneider.com | Case study philosophy, portfolio systems |

**Curated collections:** [Pafolios](https://pafolios.com/) (685+), [Bestfolios](https://bestfolios.medium.com/), [DesignerUp](https://designerup.co/blog/10-exceptional-product-design-portfolios-with-case-study-breakdowns/), [SiteBuilderReport](https://www.sitebuilderreport.com/inspiration/ux-portfolios)

### Sources

- [Baymard Institute — Optimal Line Length](https://baymard.com/blog/line-length-readability)
- [NN/g — Table of Contents Design](https://www.nngroup.com/articles/table-of-contents/)
- [Smashing Magazine — Typographic Patterns](https://www.smashingmagazine.com/2013/05/typographic-design-patterns-practices-case-study-2013/)
- [Smashing Magazine — img Element and Core Web Vitals](https://www.smashingmagazine.com/2021/04/humble-img-element-core-web-vitals/)
- [web.dev — Too Much Lazy Loading](https://web.dev/articles/lcp-lazy-loading)
- [CSS-Tricks — Sticky TOC with Active States](https://css-tricks.com/sticky-table-of-contents-with-scrolling-active-states/)
- [Tobias van Schneider — Visual Guide to Case Studies](https://vanschneider.medium.com/a-visual-guide-to-writing-portfolio-case-studies-ad5dbc513f37)
- [IxDF — How to Create Visuals for Case Studies](https://www.interaction-design.org/literature/article/how-to-create-visuals-for-your-ux-case-study)
- [IxDF — 7 Portfolio Mistakes Costing You Jobs](https://www.interaction-design.org/literature/article/avoid-design-portfolio-mistakes-costing-jobs)
- [UXfolio — Case Study Template 2026](https://blog.uxfol.io/ux-case-study-template/)
- [Framer — 11 Animation Techniques for UX](https://www.framer.com/blog/website-animation-examples/)
- [Chrome Developers — Scroll-Driven Animation Performance](https://developer.chrome.com/blog/scroll-animation-performance-case-study)

---

*Playbook created February 2026 — updated with lessons from writing all 6 case studies, Figma audit, industry best practices research, and case study page visual/UX design research.*

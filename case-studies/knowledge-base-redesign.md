# Knowledge Base Redesign

---

## CARD VIEW

```
[TODO: Cover image — Knowledge Base categorization structure with hotel info subjects, 16:9]

KNOWLEDGE BASE REDESIGN
Restructuring the AI brain that powers hotel chatbots and voice

Canary Technologies • 2024 • Lead Designer

Information Architecture • AI Systems • User Research
```

---

## CASE STUDY PAGE

### Hero Section

```
← Back to Work

# Knowledge Base Redesign

A ground-up redesign of the information architecture and UI for Canary's AI knowledge base — the system where hotels enter property data that powers both the AI chatbot (Messaging) and voice assistant products.

---

Company          Canary Technologies
Timeline         3 months (Jan – Mar 2024)
Role             Lead Designer (IA and UI design)
Team             1 Designer, PM (Kevin Li), Staff Designer (Wenjun Zhao, design review)
```

---

### Quick Stats

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  2 products      │  DSN-128 +      │  Pilot hotel    │  Feb 2024 →     │
│  powered by one  │  DSN-183        │  visit +        │  Jan 2026       │
│  knowledge base  │  Large design   │  user research  │  Navigation     │
│  (Messaging +    │  tickets        │  with hoteliers │  prediction     │
│  Voice)          │  delivered      │                 │  validated      │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
[TODO: Replace with stronger metrics when KB V2 launches — activation time reduction, AI response rate improvement, adoption %]
```

---

### The Problem

Canary's AI messaging product (Finch) and voice assistant both relied on a knowledge base where hotels enter property information — hours of operation, amenity details, shuttle schedules, restaurant menus. But the existing UI was, in Aman's words, "pretty ugly visually and doesn't play well in demos since we shipped it as a quick MVP years ago." Hotels had no structured way to enter information, the categorization was flat, and the experience was buried inside the Messaging tab — even though it powered multiple products.

The business consequence was direct: AI response quality depended on KB completeness, and the Q1 2024 KR was "We respond to 90% of messages that could be answered from the KB." But hotels weren't filling out the knowledge base because the UI made it feel like a chore rather than a natural part of setup. Wyndham, Canary's largest enterprise customer, was "nervous about complexity" in the existing system. Kevin Li's brief was clear: make it "look approachable, fairly easy to provide information, and also super powerful."

---

### The Solution

I redesigned the knowledge base from scratch — creating a new information architecture with structured categories, building user personas from hotel research, and designing a UI that made entering property data feel like completing a profile rather than filling out a form. My work established the IA foundation that the current KB V2 (Q1 2026) is built on.

[TODO: Hero mockup — Knowledge Base v2 categorization view with structured subjects and completion metrics]

#### Key Design Decisions

1. **Categorized subject structure instead of flat custom statements**
   The existing KB was an unstructured list of custom statements — hotels typed freeform text and hoped the AI could use it. I redesigned this as a categorized system with a full taxonomy: Basic Info (MOST IMPORTANT — property name, address, contact), Policies & Rules (check-in/checkout, reservation, pet, safety, noise/quiet, age), Amenities broken into Services, Facilities (parking, elevator, gym, sauna, spa, pool), Shopping (gift stores, retail), Dining (restaurants, bars, café/coffee, room service), Outdoor (patio/balcony, fire pit, bikes, BBQ grill, courtyard, lounge chairs), Location, and In-room Conveniences (bedroom, heating+cooling, safety, bathroom, kitchen+dining). Kevin signed off on this categorization structure (Feb 14, 2024), and it became the backbone for how hotels think about their property data. The key principle: reduce cognitive load by asking hotels to fill in what they know about specific topics, not write generic "statements."
   [TODO: Visual — categorization structure showing subject areas with fill-in prompts]

2. **Platform-level navigation, not product-specific**
   In February 2024, I raised what became the defining architectural question: "Where does knowledge base live — is it just in messaging? Is there a special knowledge base nav? Is it in settings?" The KB powered both Messaging and Voice, so burying it in the Messaging tab made no sense. I explored options for a standalone knowledge base section accessible across products. Nearly two years later (January 2026), this exact decision was implemented — the KB was moved out of Messaging into its own standalone section in Admin Settings.
   [TODO: Visual — navigation exploration showing KB as standalone section vs. nested in Messaging]

3. **Completion metrics to drive adoption**
   Hotels weren't filling out the KB because there was no sense of progress or urgency. I designed completion metrics — time it takes to complete the KB, percentage of completion per category — that Kevin validated as the right approach (Feb 14, 2024). This framing turned KB setup from an open-ended chore into a trackable task. Miguel's later implementation (Dec 2025) built on this with progress bars for each default context category — the same concept, refined.
   [TODO: Visual — completion metrics showing category-level progress indicators]

4. **Progressive disclosure with AI-aware branching**
   I designed each category as a progressive questioning flow: "Does your property have X?" → Yes (ask more: When? What? Where? Upload files) → No (show nothing) → Unanswered (Canary doesn't know). This three-state model directly mapped to how the AI would respond: Yes → "Yes! [answer]", No → "No. [Explanation]", Unanswered → escalate to human employee. The design also prioritized information by how easy it is for hotels to gather — property name and address (trivial) at the top, bar closing time on Christmas (harder) deeper in the flow. This prioritization ensured hotels would fill out the highest-impact data first.
   [TODO: Visual — progressive disclosure flow showing yes/no/unanswered states and AI response mapping]

5. **"Any added friction for the hotel is AWFUL" as a design principle**
   From my brainstorm with Kevin (Jan 29, 2024), I established this as the guiding principle for all KB design decisions. Hotels are already stretched thin — every extra click or confusing label in the KB setup directly reduces AI quality because hotels just won't bother. This principle informed everything: the categorized structure (reduce decisions), the completion metrics (create momentum), and the contextual editing pattern (edit where you see the data, not in a separate admin panel).
   [TODO: Visual — before (flat custom statements) vs. after (structured categories with contextual editing)]

---

### [+] Research & Discovery

#### What I Learned

**Research methods used:**
- Kickoff session with Kevin Li (PM) — defined scope, identified pilot hotels, reviewed existing Finch architecture (Jan 17, 2024)
- FigJam brainstorm exploring IA patterns, user personas, and competitive approaches (Jan 2024)
- User interview with Caitlyn (CS/hotel operations) — understanding how hoteliers actually maintain property information (Feb 13, 2024)
- Pilot hotel visit — on-site observation of how hotel staff interact with property data systems (Feb 13, 2024)
- Competitive analysis — studied listings products (Redfin, Zillow, Vrbo) for patterns on structured property data entry
- Design review with Wenjun Zhao (Staff Designer) — feedback that shaped P0 priorities and scoping
- Ongoing syncs with Kevin Li on categorization, metrics, and platform-level implications

**Key insights:**
1. Hotels think about their property in categories (rooms, dining, amenities, policies), not in freeform statements. The flat custom statements model asked them to think like an AI trainer rather than a hotelier. → I restructured the KB around natural property categories, so entering information felt like describing your hotel rather than programming a chatbot.
2. Two products powered by the same data creates a synchronization problem. From my brainstorm notes: "If you have two different products powered by the same set of information: What is the entry point of information? How do you edit in context? What is the methodology to keep all information in sync?" → This became the central design question and directly led to the platform-level navigation proposal.
3. Wyndham (via CSM Ani) was "nervous about complexity — half the time they want to invest." Enterprise hotels needed the KB to feel lightweight, not like another system to manage. → I designed progressive disclosure: start with the most impactful categories, show completion %, and let hotels expand scope over time.
4. Time-sensitive information (announcements, seasonal changes) and custom information (subjects not in the standard categories) needed separate treatment. Kevin and I discussed this explicitly (Feb 14). → I designed the categorization with both structured subjects and a custom area for hotel-specific topics.
5. The KB had cross-sell potential: "This could become a cross-sell opportunity for Compendium & Finch" (brainstorm notes, Jan 29). Hotels entering rich property data for AI could reuse that same data in the digital compendium. → This insight planted the seed for what later became the Compendium–KB connection, which I revisited in Aug 2025 when I proposed an "Ask me anything search bar at the top of Compendium."

**Research artifact:**
I created a FigJam brainstorm (Knowledge-Base-v2: Brainstorm) that mapped the full problem space — user personas, information flows between products, categorization options, and competitive patterns. This brainstorm connected to the main Figma design file (Property Info Page / Knowledge Base v2) where I built out the full IA, wireframes, and high-fidelity designs across multiple pages including categorization views, editing flows, and hours of operation patterns.

---

### [+] Design Process

#### How I Got There

**Approach:** I framed the design around three approaches of increasing automation: (1) Making manual input easy — IA and UI structure that reduces cognitive load, (2) Doing some work for them — prefilling information from existing data sources, and (3) Full automation via API integrations (out of scope for V1). The design focused on approach 1 with elements of approach 2, understanding that the IA had to work for both Compendium and Knowledge Base simultaneously: "We also need to gather data in a way that works for Compendium + Knowledge Base (AI)."

[TODO: Visual — FigJam brainstorm showing IA exploration and persona work]

**Iterations:**
- **Research & scoping (Jan 2024):** Kevin Li created DSN-128 — a large design ticket to "revisit designs for knowledge base and jam through how to make the experience fast + easy for hotels to get onboard." I started by understanding the existing system: asked Kevin about the current AI KB UI (Jan 17), reviewed the Finch architecture, and studied how information flows from hotel input to AI responses. The kickoff notes in Notion document my initial questions: "Which properties are using this? Why those properties? How are we defining improvements? Any competitors in this space?"
- **Brainstorming & IA exploration (Jan–Feb 2024):** Built the FigJam brainstorm exploring categorization structures, inspired by listings products (Redfin, Zillow, Vrbo). Wenjun created DSN-183 (Feb 2) as a sub-ticket: "UX considerations for both Compendium CMS + Knowledge Base — Deliverables: IA, low-fidelity wireframes." I raised the platform-level navigation question with Wenjun (Feb 1) and began exploring where KB should live architecturally.
- **User research & persona building (Feb 2024):** Interviewed Caitlyn (CS/hotel operations) and visited a pilot hotel (Feb 13) to observe how hotel staff actually maintain property information. Built personas and documented open questions about how hoteliers prefer to collect and maintain info. Shared progress with Wenjun in Figma, noting "I'll be interviewing Caitlyn tomorrow and visiting one of our pilot hotels tomorrow."
- **Categorization sign-off & metrics (Feb 2024):** Got sign-off from Kevin on the categorization structure (Feb 14). Also validated the completion metrics approach — time to complete KB, percentage of completion — as the right way to drive adoption. Discussed handling of time-sensitive info (announcements) and custom subjects not in the standard structure. DSN-183 completed Feb 16.
- **Final designs & handoff (Mar 2024):** Shared the final Property Info / Knowledge Base v2 Figma with Wenjun (Mar 6). DSN-128 marked complete March 11 — "Ready for eng." The design file included full categorization views, editing flows, hours of operation patterns, and the structured subject architecture.

**What happened after my design work:**
- **Designs not implemented (Apr–Aug 2024):** Engineering prioritized other work. When I checked with Kevin in August 2024, the property info/KB designs hadn't been developed. The IA and design decisions were preserved in Figma.
- **Handoff to Miguel (Sep 2024):** I explicitly shared my KB designs with Miguel Santana, noting "These were specifically created for Messaging's AI Knowledge Base, so the designs may not completely align with the requirements for Compendium."
- **Self-serve custom statements launched (Nov 2024):** A lighter version of KB self-service shipped — enabling hotels to add custom statements from the KB UI. This was built on the foundation I'd established.
- **Miguel's UI polish (Dec 2025):** Miguel rebuilt the KB UI using Claude Code — collapsible sections, progress bars for default context categories, updated design standards. The categorization structure and completion metrics pattern echoed my original designs.
- **KB moves to Settings (Jan 2026):** The knowledge base was moved out of Messaging into a standalone Admin Settings section — exactly the architectural decision I'd proposed in February 2024.

**Constraints I designed around:**
- **MVP had shipped as "quick MVP years ago"** — The existing UI was functional but unstructured, and hotels had learned to work around it. The redesign had to improve the experience without breaking existing workflows.
- **Two products, one data source** — Messaging (Finch) and Voice both consumed KB data, but the UI lived only in Messaging. The design had to work for a multi-product future.
- **Enterprise scale** — Wyndham's 4,570+ properties each needed KB setup, making onboarding friction a multiplicative problem.
- **Competing priorities** — The corporate portal (Above Property) was "more important for this week" (Jan 22), and KB design time was compressed. Kevin helped buy extra time, but the design had to be efficient.

[TODO: Visual — before (flat custom statements in Messaging tab) vs. after (structured categories as standalone section)]

---

### [+] Impact & Results

#### What Happened

**Design impact:**
- Created the categorization structure (hotel services, accessibility, rooms, hours of operation, etc.) that Kevin Li approved as the KB's IA foundation
- Delivered two large design tickets (DSN-128 and DSN-183) covering full IA, wireframes, and high-fidelity designs
- The platform-level navigation question I raised in Feb 2024 was resolved in Jan 2026 — KB moved to standalone Admin Settings, exactly as I'd proposed
- My completion metrics concept (% of KB filled, time to complete) was implemented in Miguel's Dec 2025 UI as progress bars per category
- My design file was explicitly shared as reference when Miguel took over KB work (Sep 2024)

**Product impact:**
- The self-serve custom statements feature (launched Nov 2024) built on the KB infrastructure my designs addressed — "Enables hotel customers to add custom statements from the KnowledgeBase UI in the Canary Dashboard to train the AI on new context"
- KB V2 (Q1 2026) is now a major cross-team initiative: Kelly Waters (eng lead), Terry Lin (PM), Miguel Santana (design), Applied AI team for URL/PDF scraping, Voice team leveraging KB resources
- The KB is expanding from custom statements to multiple data sources: URL scraping, PDF upload, website parsing — the "self-service vision" from the Q1 planning meeting aligns with the multi-source approach I explored in my brainstorm
- Success metric for KB V2: "Reduction of 'Days to Activate' by 7+ days (median) for voice, messaging, and webchat within 60 days of release"
- Q1 2026 KR: "Hotels can successfully ingest ≥ 95% of weekly submitted URLs to their knowledge base (KBv2)"

**Business impact:**
- KB quality directly impacts AI response rate — the Q1 2024 KR was "We respond to 90% of messages that could be answered from the KB based on a random sampling from production"
- Wyndham rollout requires 30-day notice for KB changes — the enterprise scale validates the need for structured, manageable KB design
- KB is now described as powering "Voice AI in addition to messaging, and will continue to expand to support more data sources and communication AI products" (Kevin Li, Jan 2026)
- The "cross-sell opportunity for Compendium & Finch" I identified in Jan 2024 is materializing — hotels use Compendium data and KB data for complementary guest experiences

**User impact:**
- Customer quotes from the current KB V2 PRD validate the original problem: Connor Stanford (Basecamp Resorts), Shane Goh (Capella Hotel Group), and Dean Briones (Sunset Marquis Hotel) all contributed feedback on KB needs
- Hotels can now self-serve custom statements (since Nov 2024) rather than relying on CS to configure AI responses
- The structured categorization reduces the cognitive load of "what should I tell the AI?" into "fill in what you know about these topics"

---

### [+] Reflection

#### What I'd Do Differently

**Worked well:**
- Visiting a pilot hotel and interviewing Caitlyn (Feb 13) gave me signal that no amount of Figma exploration could — I saw how hotel staff actually think about property information, which directly shaped the categorization structure. User research at this stage was the highest-leverage activity I did.
- Raising the platform-level navigation question early (Feb 2024) was the right instinct. Even though it wasn't resolved for nearly two years, framing KB as a multi-product concern rather than a Messaging feature shaped how the team thought about the problem. The fact that the Jan 2026 architecture landed where I'd proposed validates the design thinking.
- The FigJam brainstorm connecting KB to Compendium ("This could become a cross-sell opportunity") showed product thinking beyond the immediate ticket. This connection later informed my Compendium work and my Aug 2025 proposal for an AI search bar in Compendium.
- Establishing "Any added friction for the hotel is AWFUL" as a design principle gave the team a shared language for evaluating decisions. It's simple enough to be memorable and specific enough to be actionable.

**Would change:**
- I'd push harder for implementation priority. The designs were completed in March 2024 but weren't built — engineering had other priorities, and I didn't advocate strongly enough for the business case. When I checked with Kevin in August ("we never developed the property info/knowledge base designs as well correct?"), it was a missed opportunity to make the case for why this work should be prioritized.
- I'd prototype the completion metrics more concretely. Kevin liked the concept (time to complete, % filled), but I didn't build a functional prototype showing how it would feel to use — which might have made the implementation case stronger. When Miguel later added progress bars (Dec 2025), the concept worked exactly as I'd envisioned, but it could have shipped a year earlier.
- I should have documented the design decisions more explicitly for the handoff. When I shared the Figma with Miguel (Sep 2024), I noted the designs were "specifically created for Messaging's AI Knowledge Base" — but a more structured handoff document explaining the IA rationale, the platform-level navigation proposal, and the user research findings would have preserved more context.

**What I learned:**
- Information architecture is the invisible design. The categorization structure, the navigation decision, the completion metrics — none of these are visually impressive, but they determined the product's long-term trajectory. The most impactful design decision in this project was a taxonomy, not a layout.
- Design work that isn't implemented immediately isn't wasted — but it needs an advocate. My KB designs lived in Figma for months before anyone built on them. The IA survived because it was structurally sound, but the timeline could have been shorter if I'd been more proactive about connecting the design to business urgency.
- Asking "where does this live?" is one of the most important design questions. It's easy to design a great screen and ignore the navigation context. The KB's placement in Messaging was a product architecture problem disguised as a UI problem, and surfacing that early was more valuable than any individual screen design.

---

### Visual Gallery

```
## The Work

Figma source of truth: https://www.figma.com/design/1nR9UummPr3j06xQD0zhic/Property-Info-Page--Knowledge-Base-v2
FigJam brainstorm: https://www.figma.com/board/eagUaA8anDGaMEIGfBRqVU/Knowledge-Base-v2--Brainstorm
Figma (AI Answers — old design): https://www.figma.com/design/pCa7b81N81xqk5s0NWxNJO/AI-Answers
Figma (Knowledge Base 2.0 — current, Miguel/Diego): https://www.figma.com/design/8oASEy5vqaWrH1J6LY5xJa/Knowledge-Base-2.0

[TODO: FigJam brainstorm — Knowledge Base v2 problem space mapping and IA exploration]
  FigJam: https://www.figma.com/board/eagUaA8anDGaMEIGfBRqVU/Knowledge-Base-v2--Brainstorm?node-id=0-1
[TODO: Categorization structure — subject areas with structured data entry]
  Figma: https://www.figma.com/design/1nR9UummPr3j06xQD0zhic/Property-Info-Page--Knowledge-Base-v2?node-id=4308-3463 (Design Review page — includes full taxonomy: Basic Info, Policies & Rules, Amenities → Services, Facilities, Dining, Shopping, Outdoor, Location, Room info)
[TODO: Hotel info editing flow — contextual editing within categories]
  Figma: https://www.figma.com/design/1nR9UummPr3j06xQD0zhic/Property-Info-Page--Knowledge-Base-v2?node-id=4151-3969 (Final designs)
[TODO: Page structure drafts — progressive disclosure with prefilled categories]
  Figma: https://www.figma.com/design/1nR9UummPr3j06xQD0zhic/Property-Info-Page--Knowledge-Base-v2?node-id=4308-3463 (Page Structure Drafts section — shows "Does your property have X?" → progressive questioning flow, custom amenity creation, hours of operation entry)
[TODO: Hours of operation design — structured time entry for hotel services]
  Figma: https://www.figma.com/design/1nR9UummPr3j06xQD0zhic/Property-Info-Page--Knowledge-Base-v2?node-id=4915-136399 (Hours of operation — shared to Miguel in Sep 2024 handoff)
[TODO: Information hierarchy diagram — "easy to gather" vs. "harder to gather" prioritization]
  Figma: https://www.figma.com/design/1nR9UummPr3j06xQD0zhic/Property-Info-Page--Knowledge-Base-v2?node-id=4308-3463 (Section 3b — shows Hotel Info → Knowledge Base → AI Messaging data flow, with yes/no/unanswered branching logic)
[TODO: Before/after — flat custom statements (AI Answers) vs. structured categorized KB]
  Figma (before): https://www.figma.com/design/pCa7b81N81xqk5s0NWxNJO/AI-Answers?node-id=4-4454
  Figma (after): https://www.figma.com/design/1nR9UummPr3j06xQD0zhic/Property-Info-Page--Knowledge-Base-v2?node-id=4308-3463
```

---

### Next Project →

**Upsells Forms**
A flexible form system for hotel upsells

---

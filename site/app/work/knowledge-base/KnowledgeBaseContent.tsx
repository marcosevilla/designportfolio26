"use client";

import QuickStats from "@/components/case-study/QuickStats";
import ExpandableSection from "@/components/case-study/ExpandableSection";
import NextProject from "@/components/case-study/NextProject";
import PullQuote from "@/components/case-study/PullQuote";
import FadeIn from "@/components/case-study/FadeIn";
import SectionHeading from "@/components/case-study/SectionHeading";
import CaseStudyShell from "@/components/case-study/CaseStudyShell";
import MetaRail from "@/components/case-study/MetaRail";
import Grid, { Col } from "@/components/layout/Grid";
import { typescale } from "@/lib/typography";

const META = [
  { label: "Year", values: ["2024 · shipped 2026"] },
  { label: "Role", values: ["Product designer"] },
  { label: "Scope", values: ["Information architecture", "Research & personas", "KB UI"] },
];

const STATS = [
  { value: "2", label: "AI products powered by one knowledge base" },
  { value: "2,000+", label: "Properties on the KB platform" },
  { value: "90%", label: "AI response-rate target the KB drives" },
  { value: "2 yrs", label: "Architecture call held (proposed Feb '24, shipped Jan '26)" },
];

const TOC_ITEMS = [
  { id: "problem", label: "Problem" },
  { id: "solution", label: "Solution" },
  { id: "research", label: "Research" },
  { id: "process", label: "Process" },
  { id: "impact", label: "Impact" },
  { id: "reflection", label: "Reflection" },
];

export default function KnowledgeBaseContent() {
  return (
    <CaseStudyShell tocItems={TOC_ITEMS}>
        {/* Title + Subtitle with metadata rail (intro-rail) */}
        <Grid preset="intro-rail">
          <Col>
            <h1 className="text-(--color-fg)" style={{ ...typescale.display, fontFamily: "var(--font-geist-sans), system-ui, sans-serif", fontWeight: 700, letterSpacing: "0.02em" }}>AI Knowledge Base</h1>
            <p className="mt-3 text-(--color-fg-secondary)" style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif", fontStyle: "italic", fontWeight: 400, fontSize: 18, lineHeight: "26px", letterSpacing: "0.02em" }}>A ground-up redesign of the information architecture and UI for Canary&apos;s AI knowledge base — the system where hotels enter the property data that powers both the AI chatbot and voice assistant.</p>
          </Col>
          <Col className="mt-8 lg:mt-2">
            <MetaRail items={META} />
          </Col>
        </Grid>

        {/* Quick Stats */}
        <FadeIn>
          <QuickStats items={STATS} />
        </FadeIn>

        {/* ── The Problem ── */}
        <FadeIn as="section" className="scroll-mt-24 pt-24">
          <Grid preset="prose">
            <Col>
              <SectionHeading id="problem">The Problem</SectionHeading>
              <p className="mb-5">
                Canary&apos;s AI messaging product and voice assistant both relied on a knowledge base where hotels enter property information — hours of operation, amenity details, shuttle schedules, restaurant menus. But the existing UI had shipped as a quick MVP years earlier: hotels had no structured way to enter information, the categorization was flat, and the whole experience was buried inside the Messaging tab even though it powered multiple products.
              </p>
              <p>
                The business consequence was direct. AI response quality depended on knowledge base completeness — the target was answering 90% of guest messages from KB data — but hotels weren&apos;t filling it out because the UI made it feel like a chore rather than a natural part of setup. Our largest enterprise customer was openly nervous about the complexity. The brief: make it approachable, easy to feed, and genuinely powerful.
              </p>
            </Col>
          </Grid>
        </FadeIn>

        {/* ── The Solution ── */}
        <FadeIn as="section" className="scroll-mt-24 pt-32">
          <Grid preset="prose">
            <Col>
              <SectionHeading id="solution">The Solution</SectionHeading>
              <p className="mb-8">
                I redesigned the knowledge base from scratch — a new information architecture built on structured categories, personas grounded in hotel research, and a UI that made entering property data feel like completing a profile rather than filling out a form. The IA foundation I established is what the current KB V2 is built on.
              </p>
            </Col>
          </Grid>

          {/* Key decisions */}
          <Grid preset="prose" className="mt-10">
            <Col>
              <SectionHeading level={3}>Key Design Decisions</SectionHeading>
            </Col>
          </Grid>

          {/* Alternating 2-col spread at desktop (5 blocks, last sits left) */}
          <Grid className="mt-6 gap-y-14">
            <Col lg="1-6">
            <FadeIn>
              <SectionHeading level={4}>1. Categorized subjects instead of flat custom statements</SectionHeading>
              <p className="mb-5">
                The existing KB was an unstructured list of freeform statements — hotels typed text and hoped the AI could use it. I redesigned it as a categorized taxonomy: Basic Info, Policies &amp; Rules, Amenities (services, facilities, dining, shopping, outdoor), Location, and In-room Conveniences. The principle: reduce cognitive load by asking hotels to fill in what they know about specific topics, not to write generic &ldquo;statements.&rdquo; Entering information should feel like describing your hotel, not programming a chatbot. This categorization became the backbone for how hotels think about their property data.
              </p>
            </FadeIn>
            </Col>

            <Col lg="7-12">
            <FadeIn>
              <SectionHeading level={4}>2. Platform-level navigation, not product-specific</SectionHeading>
              <p className="mb-5">
                Early on I raised what became the defining architectural question: where does the knowledge base live? It powered both Messaging and Voice, so burying it inside the Messaging tab made no sense. I proposed a standalone knowledge base section accessible across products. Nearly two years later, that exact decision shipped — the KB moved out of Messaging into its own standalone section in admin settings. The most important design call in the project was an architecture question, not a screen.
              </p>
            </FadeIn>
            </Col>

            <Col lg="1-6">
            <FadeIn>
              <SectionHeading level={4}>3. Completion metrics to drive adoption</SectionHeading>
              <p className="mb-5">
                Hotels weren&apos;t filling out the KB because there was no sense of progress or urgency. I designed completion metrics — time to complete, percentage filled per category — turning setup from an open-ended chore into a trackable task. The concept was validated at design review and later implemented as per-category progress bars in the current UI.
              </p>
            </FadeIn>
            </Col>

            <Col lg="7-12">
            <FadeIn>
              <SectionHeading level={4}>4. Progressive disclosure with AI-aware branching</SectionHeading>
              <p className="mb-5">
                Each category became a progressive questioning flow: &ldquo;Does your property have X?&rdquo; → Yes (ask when, what, where; upload files) → No (show nothing) → Unanswered. That three-state model mapped directly to how the AI responds: yes with an answer, no with an explanation, or escalate to a human. I also prioritized information by how easy it is for hotels to gather — property name and address at the top, the bar&apos;s closing time on Christmas deeper in the flow — so the highest-impact data gets filled first.
              </p>
            </FadeIn>
            </Col>

            <Col lg="1-6">
            <FadeIn>
              <SectionHeading level={4}>5. &ldquo;Any added friction for the hotel is awful&rdquo; as a design principle</SectionHeading>
              <p className="mb-5">
                From the first brainstorm, I established this as the guiding principle for every KB decision. Hotels are stretched thin — every extra click or confusing label directly reduces AI quality, because hotels simply won&apos;t bother. It informed everything: the categorized structure (fewer decisions), the completion metrics (momentum), and contextual editing (edit where you see the data, not in a separate admin panel).
              </p>
            </FadeIn>
            </Col>
          </Grid>
        </FadeIn>

        {/* ── Research & Discovery ── */}
        <FadeIn className="pt-32">
          <Grid preset="prose">
            <Col>
          <ExpandableSection title="Research & Discovery" id="research">
                <SectionHeading level={3}>Research methods</SectionHeading>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>Kickoff with the PM — scoped the work, identified pilot hotels, reviewed the existing AI architecture</li>
                  <li>FigJam brainstorm mapping the full problem space: personas, information flows between products, categorization options</li>
                  <li>User interview with hotel operations — how hoteliers actually maintain property information</li>
                  <li>On-site pilot hotel visit — observed how staff interact with property data systems</li>
                  <li>Competitive analysis of listings products (Redfin, Zillow, Vrbo) for structured property-data-entry patterns</li>
                  <li>Design reviews with a staff designer that shaped P0 priorities and scoping</li>
                </ul>

                <SectionHeading level={3}>Key insights</SectionHeading>
                <div className="space-y-6">
                  <div>
                    <p className="mb-2">
                      <strong className="text-(--color-fg)">1. Hotels think in categories, not statements.</strong> The flat model asked them to think like an AI trainer rather than a hotelier.
                    </p>
                    <p className="text-[15px] text-(--color-fg-tertiary)">
                      → I restructured the KB around natural property categories, so entering information felt like describing your hotel.
                    </p>
                  </div>

                  <div>
                    <p className="mb-2">
                      <strong className="text-(--color-fg)">2. Two products on one data source creates a synchronization problem.</strong> What&apos;s the entry point? How do you edit in context? How does it stay in sync?
                    </p>
                    <p className="text-[15px] text-(--color-fg-tertiary)">
                      → This became the central design question and led directly to the platform-level navigation proposal.
                    </p>
                  </div>

                  <div>
                    <p className="mb-2">
                      <strong className="text-(--color-fg)">3. Enterprise hotels needed the KB to feel lightweight.</strong> Our largest chain was nervous about complexity and how much time they&apos;d have to invest.
                    </p>
                    <p className="text-[15px] text-(--color-fg-tertiary)">
                      → I designed progressive disclosure: start with the highest-impact categories, show completion %, expand scope over time.
                    </p>
                  </div>

                  <div>
                    <p className="mb-2">
                      <strong className="text-(--color-fg)">4. Rich property data has value beyond the AI.</strong> The same structured data hotels enter for the chatbot could power the digital compendium.
                    </p>
                    <p className="text-[15px] text-(--color-fg-tertiary)">
                      → This insight planted the seed for the Compendium–KB connection I revisited a year later with an &ldquo;ask me anything&rdquo; search concept.
                    </p>
                  </div>
                </div>

            <FadeIn className="mt-8">
              <PullQuote
                quote="Any added friction for the hotel is AWFUL."
                attribution="Design principle, established at kickoff and cited through the project"
              />
            </FadeIn>
          </ExpandableSection>
            </Col>
          </Grid>
        </FadeIn>

        {/* ── Design Process ── */}
        <FadeIn className="pt-32">
          <Grid preset="prose">
            <Col>
          <ExpandableSection title="Design Process" id="process">
                <p className="mb-8">
                  <strong className="text-(--color-fg)">Approach:</strong> I framed the design around three levels of increasing automation — make manual input easy (IA and UI that reduce cognitive load), do some of the work for them (prefill from existing data), and full automation via integrations (out of scope for V1). The IA also had to serve two products at once: the data hotels enter had to work for both the AI knowledge base and the guest-facing compendium.
                </p>

                <div className="space-y-8">
                  <div>
                    <SectionHeading level={4}>Research &amp; scoping</SectionHeading>
                    <p>
                      Started by understanding the existing system — how information flows from hotel input to AI responses, which properties used it and why, and how improvement would be measured.
                    </p>
                  </div>

                  <div>
                    <SectionHeading level={4}>IA exploration</SectionHeading>
                    <p>
                      Built the FigJam brainstorm exploring categorization structures, drawing on listings products like Redfin, Zillow, and Vrbo — the best existing patterns for structured property data entry. Raised the platform-level navigation question and began exploring where the KB should live architecturally.
                    </p>
                  </div>

                  <div>
                    <SectionHeading level={4}>User research &amp; personas</SectionHeading>
                    <p>
                      Interviewed hotel operations and visited a pilot hotel to watch staff maintain property information in the wild. Built personas and documented how hoteliers prefer to collect and maintain info — signal no amount of Figma exploration could produce.
                    </p>
                  </div>

                  <div>
                    <SectionHeading level={4}>Categorization sign-off &amp; metrics</SectionHeading>
                    <p>
                      Got PM sign-off on the categorization structure and validated the completion-metrics approach. Worked through edge cases: time-sensitive information like announcements, and custom subjects that don&apos;t fit the standard taxonomy.
                    </p>
                  </div>

                  <div>
                    <SectionHeading level={4}>Final designs &amp; handoff</SectionHeading>
                    <p>
                      Delivered the full design file — categorization views, editing flows, hours-of-operation patterns, and the structured subject architecture — marked ready for engineering.
                    </p>
                  </div>
                </div>

                <SectionHeading level={3}>Constraints I designed around</SectionHeading>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-(--color-fg)">A years-old MVP with learned workarounds</strong> — the redesign had to improve the experience without breaking existing workflows</li>
                  <li><strong className="text-(--color-fg)">Two products, one data source</strong> — Messaging and Voice both consumed KB data, but the UI lived in only one of them</li>
                  <li><strong className="text-(--color-fg)">Enterprise scale</strong> — thousands of properties each needed KB setup, making onboarding friction a multiplicative problem</li>
                  <li><strong className="text-(--color-fg)">Compressed timeline</strong> — competing priorities meant the design work had to be efficient and decisive</li>
                </ul>

          </ExpandableSection>
            </Col>
          </Grid>
        </FadeIn>

        {/* ── Impact & Results ── */}
        <FadeIn className="pt-32">
          <Grid preset="prose">
            <Col>
          <ExpandableSection title="Impact & Results" id="impact">
                <SectionHeading level={3}>Design impact</SectionHeading>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>Created the categorization structure that was approved as the KB&apos;s IA foundation — the backbone for how hotels structure property data today</li>
                  <li>The platform-level navigation question I raised was resolved two years later exactly as proposed: the KB moved out of Messaging into a standalone admin settings section</li>
                  <li>My completion-metrics concept (% filled, time to complete) shipped as per-category progress bars in the current UI</li>
                  <li>My design file was the explicit reference handoff when the next designer took over KB work</li>
                </ul>

                <SectionHeading level={3}>Product impact</SectionHeading>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>Self-serve custom statements shipped on the foundation the designs addressed — hotels train the AI themselves rather than relying on customer success</li>
                  <li>KB V2 is now a major cross-team initiative spanning product design, applied AI (URL/PDF ingestion), and the Voice team</li>
                  <li>The V2 success metric — cutting median days-to-activate by 7+ days across voice, messaging, and webchat — is a direct descendant of the original friction principle</li>
                </ul>

                <SectionHeading level={3}>Business impact</SectionHeading>
                <ul className="list-disc pl-5 space-y-2">
                  <li>KB completeness directly drives the AI&apos;s response rate — the target: answer 90% of answerable guest messages from KB data</li>
                  <li>The KB now powers voice AI in addition to messaging and continues expanding to more data sources and AI products</li>
                  <li>The cross-sell opportunity identified in the first brainstorm — one structured dataset serving both AI and the guest compendium — is materializing in the current roadmap</li>
                </ul>
          </ExpandableSection>
            </Col>
          </Grid>
        </FadeIn>

        {/* ── Reflection ── */}
        <FadeIn className="pt-32">
          <Grid preset="prose">
            <Col>
          <ExpandableSection title="Reflection" id="reflection">
                <SectionHeading level={3}>Worked well</SectionHeading>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>Visiting a pilot hotel and interviewing operations gave me signal no Figma exploration could — it directly shaped the categorization structure. User research was the highest-leverage activity in the project.</li>
                  <li>Raising the platform-level navigation question early was the right instinct. Framing the KB as a multi-product concern rather than a Messaging feature shaped how the team thought about the problem — and the architecture eventually landed exactly where I&apos;d proposed.</li>
                  <li>&ldquo;Any added friction for the hotel is awful&rdquo; gave the team shared language for evaluating decisions — simple enough to be memorable, specific enough to be actionable.</li>
                </ul>

                <SectionHeading level={3}>Would change</SectionHeading>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>I&apos;d push harder for implementation priority. The designs were complete but sat unbuilt while engineering focused elsewhere — I didn&apos;t advocate strongly enough for the business case, and concepts that later proved right could have shipped a year earlier.</li>
                  <li>I&apos;d prototype the completion metrics concretely. The concept was approved on the strength of the idea, but a functional prototype showing how it <em>feels</em> might have made the implementation case impossible to deprioritize.</li>
                  <li>I&apos;d document the handoff more explicitly — a structured rationale doc covering the IA thinking, the navigation proposal, and the research findings would have preserved more context than a Figma file alone.</li>
                </ul>

                <SectionHeading level={3}>What I learned</SectionHeading>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Information architecture is the invisible design. The taxonomy, the navigation decision, the completion metrics — none of them are visually impressive, but they determined the product&apos;s long-term trajectory. The most impactful decision in this project was a taxonomy, not a layout.</li>
                  <li>Design that isn&apos;t implemented immediately isn&apos;t wasted — but it needs an advocate. The IA survived because it was structurally sound; the timeline could have been shorter if I&apos;d connected it to business urgency sooner.</li>
                  <li>&ldquo;Where does this live?&rdquo; is one of the most important design questions. The KB&apos;s placement was a product architecture problem disguised as a UI problem, and surfacing that early was worth more than any individual screen.</li>
                </ul>
          </ExpandableSection>
            </Col>
          </Grid>
        </FadeIn>

        {/* Visual gallery removed with the placeholder cleanup — restore
            the section (+ its "gallery" TOC entry) once real images land. */}

        {/* ── Next Project ── */}
        <FadeIn>
          <NextProject
            title="Digital Compendium"
            subtitle="A digital guest hub built on the same structured property data"
            href="/work/compendium"
          />
        </FadeIn>
    </CaseStudyShell>
  );
}

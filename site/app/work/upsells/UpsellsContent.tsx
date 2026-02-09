"use client";

import CaseStudyHero from "@/components/case-study/CaseStudyHero";
import QuickStats from "@/components/case-study/QuickStats";
import ImagePlaceholder from "@/components/case-study/ImagePlaceholder";
import ExpandableSection from "@/components/case-study/ExpandableSection";
import SidebarTOCBridge from "@/components/case-study/SidebarTOCBridge";
import TOCObserver from "@/components/case-study/TOCObserver";
import NextProject from "@/components/case-study/NextProject";
import PullQuote from "@/components/case-study/PullQuote";
import ProgressBar from "@/components/case-study/ProgressBar";
import FadeIn from "@/components/case-study/FadeIn";
import { typescale } from "@/lib/typography";

const STATS = [
  { value: "$3.8M", label: "Upsells CARR" },
  { value: "$2.2M", label: "Approved upsell revenue/mo" },
  { value: "80%", label: "Upsells approval rate" },
  { value: "8,325", label: "Hotels using upsells" },
];

const TOC_ITEMS = [
  { id: "problem", label: "Problem" },
  { id: "solution", label: "Solution" },
  { id: "research", label: "Research" },
  { id: "process", label: "Process" },
  { id: "impact", label: "Impact" },
  { id: "reflection", label: "Reflection" },
  { id: "gallery", label: "Gallery" },
];

export default function UpsellsContent() {
  return (
    <>
      <ProgressBar />
      <SidebarTOCBridge items={TOC_ITEMS} />
      <TOCObserver sectionIds={TOC_ITEMS.map(i => i.id)} />

      <article className="text-[var(--color-fg-secondary)]" style={typescale.body}>
        {/* Hero */}
        <CaseStudyHero
          title="Upsells Forms"
          subtitle="A configurable form system that lets hotels collect custom guest information at the point of upsell purchase — turning simple add-ons into structured service requests."
          gradient={["#0D9488", "#0F766E"]}
          heroImageDescription="Hero shot — full-page upsell creation with form builder section + live mobile preview"
        />

        <div className="max-w-content mx-auto">
        {/* Quick Stats */}
        <FadeIn>
          <QuickStats items={STATS} />
        </FadeIn>

        {/* Content */}
        <div className="mt-8">
          <div>
            {/* ── The Problem ── */}
            <FadeIn as="section" className="scroll-mt-24 pt-24">
              <div id="problem" className="scroll-mt-24" />
              <h2
                className="text-[var(--color-fg)] mb-8 tracking-tight"
                style={typescale.h2}
              >
                The Problem
              </h2>
              <p className="mb-5">
                When a guest requests a snowmobile expedition, airport shuttle, or spa treatment through Canary&apos;s upsells, the hotel has to follow up manually — via messaging or phone — to collect the details needed to actually fulfill the request. Flight number? Preferred time? Number of guests? Dietary restrictions? All of this creates back-and-forth that delays confirmation, frustrates guests, and creates operational overhead for already-busy concierge teams.
              </p>
              <p>
                One hotel we tested with, Hotel Jackson in Wyoming, manages 30+ different tour experiences. Their tours coordinator described the current workflow: &ldquo;I see the guest is interested, I message them, I wait for a response — it could take 5 minutes or 5 days.&rdquo; Competitors like Duve had already built form-based data collection into their upsells, and CS teams were regularly fielding requests from properties that wanted to collect mandatory information at the time of purchase.
              </p>
            </FadeIn>

            {/* ── The Solution ── */}
            <FadeIn as="section" className="scroll-mt-24 pt-32">
              <div id="solution" className="scroll-mt-24" />
              <h2
                className="text-[var(--color-fg)] mb-8 tracking-tight"
                style={typescale.h2}
              >
                The Solution
              </h2>
              <p className="mb-8">
                I designed a form system that plugs into Canary&apos;s existing upsells product — hotel staff configure custom questions per upsell, guests answer them at the point of request, and staff see responses alongside the order in their dashboard. Alongside Forms, I redesigned the entire upsell creation experience from a cramped modal into a full-page layout with live preview.
              </p>

              <FadeIn>
                <ImagePlaceholder
                  description="Full-page creation flow with live preview panel"
                  aspectRatio="16/9"
                />
              </FadeIn>

              {/* Key decisions */}
              <h3
                className="font-medium text-[var(--color-fg)] mt-16 mb-6 tracking-tight"
                style={typescale.h3}
              >
                Key Design Decisions
              </h3>

              <div className="space-y-14">
                <FadeIn>
                  <h4 className="font-medium text-[var(--color-fg)] mb-3 tracking-tight" style={typescale.h4}>
                    1. Full-page creation flow with live preview
                  </h4>
                  <p className="mb-5">
                    The existing upsell creation modal couldn&apos;t accommodate forms — it was already cramped with basic fields. Rather than patching, I redesigned the entire creation experience as a full-page layout, emulating the pattern I&apos;d established in Compendium Builder. The right side shows a live mobile preview that updates as staff configure the upsell, so they see exactly what guests will see.
                  </p>
                  <ImagePlaceholder description="Full-page upsell creation showing form builder section" aspectRatio="16/9" />
                </FadeIn>

                <FadeIn>
                  <h4 className="font-medium text-[var(--color-fg)] mb-3 tracking-tight" style={typescale.h4}>
                    2. Form fields as &ldquo;Guest Information&rdquo; within the upsell
                  </h4>
                  <p className="mb-5">
                    I positioned forms as a natural extension of the upsell setup — a &ldquo;Guest Information&rdquo; section that appears when configuring an add-on. Hotels add up to 5 questions per upsell, each with a type (text, dropdown for MVP), a label, and required/optional status. The key insight from user testing was renaming &ldquo;Fields&rdquo; to &ldquo;Questions&rdquo; — hotel staff don&apos;t think in database terms, they think &ldquo;What do I need to ask the guest?&rdquo;
                  </p>
                  <ImagePlaceholder description="Form builder section showing question configuration" aspectRatio="16/9" />
                </FadeIn>

                <FadeIn>
                  <h4 className="font-medium text-[var(--color-fg)] mb-3 tracking-tight" style={typescale.h4}>
                    3. Guest form appears before submission, not after
                  </h4>
                  <p className="mb-5">
                    I designed the form to surface before the guest submits their upsell request — not as a follow-up. This was the core product insight: if you collect information at the moment of intent, you eliminate the entire manual follow-up workflow. The guest sees the form integrated into the upsell detail view, answers the questions, and submits everything together.
                  </p>
                  <ImagePlaceholder description="Guest mobile view showing upsell detail with form questions" aspectRatio="3/4" />
                </FadeIn>

                <FadeIn>
                  <h4 className="font-medium text-[var(--color-fg)] mb-3 tracking-tight" style={typescale.h4}>
                    4. Constraint-based UX with clear feedback
                  </h4>
                  <p className="mb-5">
                    The form builder uses visual feedback to communicate limits: the &ldquo;Add option&rdquo; button disables when a dropdown reaches 15 options, deletion is blocked when only one option remains, and error indicators appear on language tabs when translations have validation issues. These micro-interactions came from observing hotel staff in testing — they needed immediate, visible feedback rather than error messages after the fact.
                  </p>
                  <ImagePlaceholder description="Form builder showing constraint feedback states" aspectRatio="16/9" />
                </FadeIn>

                <FadeIn>
                  <h4 className="font-medium text-[var(--color-fg)] mb-3 tracking-tight" style={typescale.h4}>
                    5. Staff responses surfaced in context
                  </h4>
                  <p className="mb-5">
                    Guest form responses needed to appear everywhere staff manage upsells — in the New Requests tab, Past Requests, and within the check-in flow&apos;s &ldquo;Manage Upsells&rdquo; section. I designed a side sheet pattern that shows the full order alongside form responses, so staff can review answers and approve/deny without navigating away.
                  </p>
                  <ImagePlaceholder description="Staff dashboard showing upsell request with form responses in side sheet" aspectRatio="16/9" />
                </FadeIn>
              </div>
            </FadeIn>

            {/* ── Research & Discovery ── */}
            <FadeIn className="pt-32">
              <ExpandableSection title="Research & Discovery" id="research">
                <h3
                  className="font-medium text-[var(--color-fg)] mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  Research methods
                </h3>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>Prototype usability testing with Hotel Jackson (Wyoming) — snowmobile/tour upsell use case with 30+ experiences</li>
                  <li>User testing with Guldsmeden Hotels (Copenhagen) — boutique hotel testing form creation flow</li>
                  <li>User testing with The Ozarker Lodge — resort experience upsells</li>
                  <li>Prototype iteration based on feedback from Cortiina hotel</li>
                  <li>Competitive analysis — Duve&apos;s form-based data collection, Oaky&apos;s upsell approach</li>
                  <li>Design hand-off session with engineering — validated field types, localization approach, question limits</li>
                </ul>

                <h3
                  className="font-medium text-[var(--color-fg)] mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  Key insights
                </h3>
                <div className="space-y-6">
                  <div>
                    <p className="mb-2">
                      <strong className="text-[var(--color-fg)]">1. Hotels think in &ldquo;questions,&rdquo; not &ldquo;form fields.&rdquo;</strong> When Hotel Jackson saw the prototype, they immediately understood the concept but stumbled on terminology.
                    </p>
                    <p className="text-[15px] text-[var(--color-fg-tertiary)]">
                      → I redesigned the form builder section with question-oriented language throughout.
                    </p>
                  </div>

                  <div>
                    <p className="mb-2">
                      <strong className="text-[var(--color-fg)]">2. Upsell variants and variable pricing are tightly coupled with forms.</strong> Hotel Jackson manages half-day group, full-day group, half-day private, and full-day private versions of each tour.
                    </p>
                    <p className="text-[15px] text-[var(--color-fg-tertiary)]">
                      → This validated the Upsell Variants project (27 iterations) as a natural companion to Forms.
                    </p>
                  </div>

                  <div>
                    <p className="mb-2">
                      <strong className="text-[var(--color-fg)]">3. Template creation was the top productivity request.</strong> Hotel Jackson has &ldquo;a set of standard questions across multiple Upsell variants&rdquo; and wanted to avoid redundant setup.
                    </p>
                    <p className="text-[15px] text-[var(--color-fg-tertiary)]">
                      → While templates weren&apos;t in MVP scope, this shaped how I designed question reordering and duplication patterns.
                    </p>
                  </div>

                  <div>
                    <p className="mb-2">
                      <strong className="text-[var(--color-fg)]">4. The existing upsell modal was a dead end.</strong> As we scoped the forms roadmap, we realized that forms, variants, categories, and modifiers couldn&apos;t all fit in a modal.
                    </p>
                    <p className="text-[15px] text-[var(--color-fg-tertiary)]">
                      → I proposed the full-page redesign early, which engineering validated as feasible.
                    </p>
                  </div>

                  <div>
                    <p className="mb-2">
                      <strong className="text-[var(--color-fg)]">5. Nearly 95% of guests access the upsells page from mobile, yet only 42% scroll past the first screen.</strong>
                    </p>
                    <p className="text-[15px] text-[var(--color-fg-tertiary)]">
                      → Questions had to be discoverable without requiring scroll, leading to the integrated detail-page approach.
                    </p>
                  </div>
                </div>

                <h3
                  className="font-medium text-[var(--color-fg)] mt-10 mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  The prototype
                </h3>
                <p className="mb-5">
                  I built a functional prototype on Vercel that included the full-page creation flow, form builder with all question types (text, dropdown, date, time, quantity), live preview, and existing upsell configurations. Hotel Jackson and Guldsmeden Hotels both tested with this prototype, and it was iterated based on their feedback before engineering hand-off.
                </p>
                <ImagePlaceholder description="Code prototype on Vercel — v0-upsell-forms.vercel.app" aspectRatio="16/9" />
              </ExpandableSection>
            </FadeIn>

            {/* ── Design Process ── */}
            <FadeIn className="pt-32">
              <ExpandableSection title="Design Process" id="process">
                <p className="mb-8">
                  <strong className="text-[var(--color-fg)]">Approach:</strong> Start with the user&apos;s workflow — what questions do they need answered? — then design backwards from there into the builder experience and guest UI.
                </p>

                <ImagePlaceholder description="Evolution from modal to full-page creation flow" aspectRatio="16/9" />

                <div className="mt-10 space-y-8">
                  <div>
                    <h4 className="font-medium text-[var(--color-fg)] mb-2 tracking-tight" style={typescale.h4}>
                      Research & prototyping (Apr–May 2025)
                    </h4>
                    <p>
                      Built the v0 code prototype with all question types. Ran usability testing with Hotel Jackson, Guldsmeden, Cortiina, and The Ozarker Lodge. Iterated on prototype feedback — aligned UI to CanaryUI, added question type configurations, and evolved the modal into a full-page experience. Shared design hand-off with engineering on May 23.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-[var(--color-fg)] mb-2 tracking-tight" style={typescale.h4}>
                      Full-page creation + live preview (May–Jun 2025)
                    </h4>
                    <p>
                      Designed the complete full-page upsell creation flow — form builder, live mobile preview with responsive layout, manual translation patterns (leveraging Compendium&apos;s pattern), and validation error states for all upsell types.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-[var(--color-fg)] mb-2 tracking-tight" style={typescale.h4}>
                      MVP scope-down & launch (Jun–Jul 2025)
                    </h4>
                    <p>
                      Scoped forms down to text-only input for MVP (no dropdown), simplifying the creation UI. Engineering shipped the full-page view as a major milestone on July 21. Ran a bug bash, filed design tickets for release-blocking issues, and worked with engineering on a final checklist.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-[var(--color-fg)] mb-2 tracking-tight" style={typescale.h4}>
                      Guest frontend + dashboard (Jul–Sep 2025)
                    </h4>
                    <p>
                      Designed guest-facing form submission within the upsell detail view, form response display on the staff dashboard, discard confirmation, and the unified deny button pattern. Re-integrated the dropdown field type after MVP. Forms builder shipped on September 15.
                    </p>
                  </div>
                </div>

                <h3
                  className="font-medium text-[var(--color-fg)] mt-12 mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  Constraints I designed around
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-[var(--color-fg)]">Existing infrastructure</strong> — Forms had to integrate with the existing add-on model and Purchase Order system</li>
                  <li><strong className="text-[var(--color-fg)]">Add-ons only</strong> — MVP excluded Room Upgrades, Early Check-in, and Late Checkout</li>
                  <li><strong className="text-[var(--color-fg)]">5 questions max</strong> — Aligned limit to prevent form fatigue and keep the guest experience fast</li>
                  <li><strong className="text-[var(--color-fg)]">Multi-language from launch</strong> — EMEA hotels needed translations for custom questions immediately</li>
                </ul>

                <div className="mt-10">
                  <ImagePlaceholder description="Before (cramped modal) vs. after (full-page with live preview)" aspectRatio="16/9" />
                </div>
              </ExpandableSection>
            </FadeIn>

            {/* ── Impact & Results ── */}
            <FadeIn className="pt-32">
              <ExpandableSection title="Impact & Results" id="impact">
                <h3
                  className="font-medium text-[var(--color-fg)] mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  Business impact
                </h3>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>Upsells CARR reached $3.8M (+8.8% MoM), with a year-end target of $4.6M</li>
                  <li>Approved upsell revenue: $2.2M/month (+9% MoM)</li>
                  <li>80% upsell approval rate across 8,325 hotels</li>
                  <li>Upsells Forms launched September 2025 — available to all customers</li>
                  <li>Marriott Upsells RFP leveraged forms designs — dedicated design reviews and presentation materials for enterprise sales</li>
                  <li>Price modifiers for custom questions designed and ready, extending forms into a revenue-impacting feature</li>
                </ul>

                <FadeIn>
                  <PullQuote
                    quote="Dream come true."
                    attribution="Hotel Jackson tours coordinator"
                  />
                </FadeIn>

                <h3
                  className="font-medium text-[var(--color-fg)] mt-10 mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  User impact
                </h3>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>Guest form submission eliminated the &ldquo;5 minutes to 5 days&rdquo; follow-up cycle Hotel Jackson described</li>
                  <li>CS teams reported frequent requests for exactly this feature — properties wanted to collect flight numbers, wine preferences, spa times, dietary restrictions</li>
                  <li>Wyndham brands exploring custom questions for new guest initiatives</li>
                  <li>IHG adopted forms for a welcome amenity selection use case — extending forms beyond concierge services</li>
                </ul>

                <h3
                  className="font-medium text-[var(--color-fg)] mt-10 mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  Product impact
                </h3>
                <ul className="list-disc pl-5 space-y-2 mb-6">
                  <li>The full-page creation flow became the new standard for all upsell management</li>
                  <li>Forms architecture designed for extensibility using Canary&apos;s internal schemaform pattern — supports branching questions, additional field types, and reuse across products</li>
                  <li>The live preview component sparked a cross-product design conversation: should we unify preview across Compendium, Upsells, and branding?</li>
                  <li>Forms laid the groundwork for price modifiers (dropdown options with per-option pricing), connecting forms directly to revenue impact</li>
                </ul>
              </ExpandableSection>
            </FadeIn>

            {/* ── Reflection ── */}
            <FadeIn className="pt-32">
              <ExpandableSection title="Reflection" id="reflection">
                <h3
                  className="font-medium text-[var(--color-fg)] mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  Worked well
                </h3>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>Building a code prototype early (Vercel, not just Figma) made user testing dramatically more effective. Hotel staff could interact with realistic question types, drag to reorder, and preview the guest experience — which surfaced insights that static mockups wouldn&apos;t have caught.</li>
                  <li>Proposing the full-page redesign early instead of patching the modal was the right call. It required more upfront work but created room for every subsequent feature.</li>
                  <li>Close collaboration with engineering throughout — from design hand-offs to working on schema design to bug bashing before launch. The eng design review wasn&apos;t a handoff-and-walk-away; it was an ongoing conversation.</li>
                  <li>Leveraging patterns from Compendium (translation picker, builder layout, image management) accelerated the Upsells redesign. Cross-product pattern reuse was a conscious design strategy.</li>
                </ul>

                <h3
                  className="font-medium text-[var(--color-fg)] mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  Would change
                </h3>
                <ul className="list-disc pl-5 space-y-2 mb-8">
                  <li>I&apos;d push for the dropdown field type in MVP rather than scoping down to text-only. The scope-down shipped faster, but the immediate post-launch feedback was about dropdown support.</li>
                  <li>I should have anticipated the discoverability issue with form questions in the guest experience earlier. The bottom sheet treatment buried custom questions, and it took a follow-up ticket to explore the full-page treatment.</li>
                  <li>The bug bash process before launch was reactive — I should have established a structured QA framework earlier in the cycle.</li>
                </ul>

                <h3
                  className="font-medium text-[var(--color-fg)] mb-4 tracking-tight"
                  style={typescale.h3}
                >
                  What I learned
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Form design is workflow design. The form itself is the easy part — the hard part is understanding where in the workflow information gets collected, where it surfaces, and what happens when it&apos;s missing.</li>
                  <li>Scoping down features (text-only MVP) and scoping up the container (full-page layout) is a powerful combination. You ship something small inside something that can grow.</li>
                  <li>User testing with real hotel operators — not just internal stakeholders — consistently produces the highest-signal feedback. Hotel Jackson&apos;s &ldquo;Dream come true&rdquo; reaction validated the concept, but their specific feedback shaped the entire roadmap.</li>
                </ul>
              </ExpandableSection>
            </FadeIn>

            {/* ── Visual Gallery ── */}
            <FadeIn as="section" className="scroll-mt-24 pt-32">
              <div id="gallery" className="scroll-mt-24" />
              <h2
                className="text-[var(--color-fg)] mb-8 tracking-tight"
                style={typescale.h2}
              >
                The Work
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FadeIn><ImagePlaceholder description="Full-page upsell creation — add-on with form builder" aspectRatio="16/9" /></FadeIn>
                <FadeIn delay={0.1}><ImagePlaceholder description="Live mobile preview showing guest-facing upsell with form" aspectRatio="16/9" /></FadeIn>
                <FadeIn><ImagePlaceholder description="Guest mobile experience — upsell detail with form questions" aspectRatio="3/4" /></FadeIn>
                <FadeIn delay={0.1}><ImagePlaceholder description="Staff dashboard — request with form responses in side sheet" aspectRatio="3/4" /></FadeIn>
                <FadeIn><ImagePlaceholder description="Form builder — question types configuration" aspectRatio="16/9" /></FadeIn>
                <FadeIn delay={0.1}><ImagePlaceholder description="Manual translations for custom questions" aspectRatio="16/9" /></FadeIn>
                <FadeIn><ImagePlaceholder description="Approve/deny workflow with form response context" aspectRatio="16/9" /></FadeIn>
                <FadeIn delay={0.1}><ImagePlaceholder description="Upsell Variants — variant configuration UI" aspectRatio="16/9" /></FadeIn>
              </div>
            </FadeIn>

            {/* ── Next Project ── */}
            <FadeIn>
              <NextProject
                title="Hotel Check-in"
                subtitle="Modernizing software for the world's largest hotel chains"
                href="/work/checkin"
              />
            </FadeIn>
          </div>
        </div>
        </div>
      </article>
    </>
  );
}

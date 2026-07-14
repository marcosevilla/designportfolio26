"use client";

import ExpandableSection from "@/components/case-study/ExpandableSection";
import NextProject from "@/components/case-study/NextProject";
import PullQuote from "@/components/case-study/PullQuote";
import FadeIn from "@/components/case-study/FadeIn";
import SectionHeading from "@/components/case-study/SectionHeading";
import CaseStudyShell from "@/components/case-study/CaseStudyShell";
import TwoCol from "@/components/TwoCol";
import { typescale } from "@/lib/typography";

const TOC_ITEMS = [
  { id: "gallery", label: "Gallery" },
  { id: "problem", label: "Problem" },
  { id: "solution", label: "Solution" },
  { id: "research", label: "Research" },
  { id: "impact", label: "Impact" },
  { id: "reflection", label: "Reflection" },
];

export default function FBOrderingContent() {
  return (
    <CaseStudyShell tocItems={TOC_ITEMS}>
        {/* Title + Subtitle + Project Details */}
        <div>
          <div>
            <h1 className="text-(--color-fg)" style={{ ...typescale.display, fontFamily: "var(--font-baskerville), Georgia, serif", fontWeight: 700, letterSpacing: "0.02em" }}>F&B Mobile Ordering</h1>
            <p className="mt-3 text-(--color-fg-secondary)">I led the design of a mobile ordering system for hotels: guest ordering, a menu CMS, and a staff fulfillment dashboard. I took it from concept to production in four months.</p>
          </div>
        </div>

        {/* ── Visual Gallery ── */}
        <FadeIn as="section" className="scroll-mt-24 pt-16">
          <SectionHeading id="gallery">Design highlights</SectionHeading>
          {/* Guest ordering flow — screen recording */}
          <FadeIn className="mt-10">
            <video
              src="/videos/fb-guest-flow.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="w-full max-w-[360px] mx-auto rounded-lg block"
            />
          </FadeIn>

          {/* Breakout: wider than the 600px shell column so the dashboard UI is legible */}
          <div className="grid grid-cols-1 gap-8 mt-10 relative left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-[960px]">
            <FadeIn><img src="/images/fb-ordering/fb-ordering-table.png" alt="Staff fulfillment dashboard showing new orders" className="w-full rounded-lg" /></FadeIn>
            <FadeIn delay={0.1}><img src="/images/fb-ordering/fb-ordering-dashboard.png" alt="Staff order detail with approve/deny" className="w-full rounded-lg" /></FadeIn>
          </div>
        </FadeIn>

        {/* ── The Problem ── */}
        <FadeIn as="section" className="scroll-mt-24 pt-24">
          <TwoCol>
            <TwoCol.Left>
              <SectionHeading id="problem">The Problem</SectionHeading>
              <p className="mb-5">
                Hotels lose F&amp;B revenue when guests have to call the front desk to order room service: misheard orders, tied-up staff, and enough friction that many guests just open DoorDash instead. Meanwhile, Canary was losing deals in APAC markets where mobile ordering is table stakes.
              </p>
              <p>
                Canary&#39;s Guest Hub was still a static content product. F&amp;B ordering would make it transactional: a revenue engine, not just an info layer. The discipline was scope: no marketplaces, no kitchen software. Just get a guest&#39;s order to staff efficiently.
              </p>
            </TwoCol.Left>
          </TwoCol>
        </FadeIn>

        {/* ── The Solution ── */}
        <FadeIn as="section" className="scroll-mt-24 pt-32">
          <TwoCol>
            <TwoCol.Left>
              <SectionHeading id="solution">The Solution</SectionHeading>
              <p className="mb-5">
                A mobile-first ordering flow embedded in Canary&#39;s Digital Compendium, from menu browsing to order confirmation, plus a staff dashboard for fulfilling orders in real time. Built on Canary&#39;s existing Upsells rails so engineering could ship fast. Four decisions defined the design:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><span className="font-medium text-(--color-fg)">Menu-first landing:</span> guests land directly on the menu, not a hotel info page. They arrive with intent to order; removing that friction was the biggest conversion lever.</li>
                <li><span className="font-medium text-(--color-fg)">Delivery type drives the experience:</span> one variable (in-room vs. poolside) determines checkout, authentication, and staff workflow. One config instead of dozens of edge cases.</li>
                <li><span className="font-medium text-(--color-fg)">Five system objects as the IA backbone:</span> Ordering Outlets, Menus, Items, Modifier Groups, Orders. Manage items once, compose menus flexibly.</li>
                <li><span className="font-medium text-(--color-fg)">Works with or without a PMS:</span> reservation-linked ordering when integrated, manual entry fallback for everyone else. No POS requirement meant shipping to the whole market.</li>
              </ul>
            </TwoCol.Left>
          </TwoCol>
        </FadeIn>

        {/* ── Research & Discovery ── */}
        <FadeIn className="pt-32">
          <ExpandableSection title="Research & Discovery" id="research">
            <TwoCol>
              <TwoCol.Left>
                <p>
                  Customer interviews with hotel F&amp;B staff, competitive analysis, and usability testing on a fully interactive Next.js prototype I built, which went on to become the primary demo tool for sales calls and GTM enablement. The research drove three calls: no POS requirement (a POS dependency would have blocked 80%+ of potential customers), a staff dashboard sorted by time-elapsed urgency so orders never get missed during peak hours, and a no-download mobile web flow using patterns guests already know.
                </p>
              </TwoCol.Left>
            </TwoCol>
          </ExpandableSection>
        </FadeIn>

        {/* ── Impact & Results ── */}
        <FadeIn className="pt-32">
          <ExpandableSection title="Impact & Results" id="impact">
            <TwoCol>
              <TwoCol.Left>
                <p className="mb-8">
                  F&amp;B Ordering hit GA in February 2026 with two verbal commitments from demos alone and 50 pilot orders validating demand before launch. The delivery-type model became the architectural pattern for all future ordering scenarios (spa, activities, table-side), and APAC enterprise interest is building, with $25K+ in potential ARR from interested properties.
                </p>
              </TwoCol.Left>
            </TwoCol>

            <FadeIn>
              <PullQuote
                quote="Significant value in the bundle, estimating over $2,000/year savings from eliminating physical menus and reducing errors."
                attribution="Chateau Avalon ownership"
              />
            </FadeIn>
          </ExpandableSection>
        </FadeIn>

        {/* ── Reflection ── */}
        <FadeIn className="pt-32">
          <ExpandableSection title="Reflection" id="reflection">
            <TwoCol>
              <TwoCol.Left>
                <ul className="list-disc pl-5 space-y-2">
                  <li><span className="font-medium text-(--color-fg)">Prototype in code, early.</span> Hotel staff testing realistic flows made research dramatically more effective, and the prototype became a genuine GTM asset.</li>
                  <li><span className="font-medium text-(--color-fg)">Find the one variable.</span> The delivery-type insight collapsed dozens of edge cases into a single configurable model. Designing for two audiences (guests ordering, staff fulfilling) means designing the system, not the screens.</li>
                  <li><span className="font-medium text-(--color-fg)">I&#39;d push harder on staff notifications in the MVP.</span> Post-launch feedback from HOMA showed hotels needed immediate alerts, as their team had to keep checking for new orders.</li>
                </ul>
              </TwoCol.Left>
            </TwoCol>
          </ExpandableSection>
        </FadeIn>

        {/* ── Next Project ── */}
        <FadeIn>
          <NextProject
            title="Compendium"
            subtitle="Building a scalable hotel CMS platform from scratch"
            href="/work/compendium"
          />
        </FadeIn>
    </CaseStudyShell>
  );
}

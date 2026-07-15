"use client";

import ExpandableSection from "@/components/case-study/ExpandableSection";
import NextProject from "@/components/case-study/NextProject";
import FadeIn from "@/components/case-study/FadeIn";
import SectionHeading from "@/components/case-study/SectionHeading";
import CaseStudyShell from "@/components/case-study/CaseStudyShell";
import MetaRail from "@/components/case-study/MetaRail";
import Grid, { Col } from "@/components/layout/Grid";
import { typescale } from "@/lib/typography";

const TOC_ITEMS = [
  { id: "gallery", label: "Gallery" },
  { id: "problem", label: "Problem" },
  { id: "solution", label: "Solution" },
  { id: "research", label: "Research" },
  { id: "impact", label: "Impact" },
  { id: "reflection", label: "Reflection" },
];

const META = [
  { label: "Year", values: ["2025–2026"] },
  { label: "Role", values: ["Sole designer"] },
  { label: "Scope", values: ["Guest ordering", "Menu CMS", "Staff dashboard"] },
];

export default function FBOrderingContent() {
  return (
    <CaseStudyShell tocItems={TOC_ITEMS}>
        {/* Title + subtitle with metadata rail (intro-rail) */}
        <Grid preset="intro-rail">
          <Col>
            <h1 className="text-(--color-fg)" style={{ ...typescale.display, fontFamily: "var(--font-baskerville), Georgia, serif", fontWeight: 700, letterSpacing: "0.02em" }}>F&B Mobile Ordering</h1>
            <p className="mt-3 italic text-(--color-fg-tertiary)">Warning: this case study may induce hunger.</p>
            <p className="mt-3 text-(--color-fg-secondary)">I designed a 0-to-1 food &amp; beverage ordering platform for hotels, the newest addition to Canary&#39;s suite of revenue products. Guests&#39; late-night munchies were increasingly going to DoorDash instead of the front desk, so we rebuilt room service to be modern, convenient, and visually enticing. Four months to MVP, $23K in committed ARR five weeks after launch.</p>
          </Col>
          <Col className="mt-8 lg:mt-2">
            <MetaRail items={META} />
          </Col>
        </Grid>

        {/* ── Visual Gallery ── */}
        <FadeIn as="section" className="scroll-mt-24 pt-16">
          <Grid preset="prose">
            <Col>
              <SectionHeading id="gallery">Design highlights</SectionHeading>
            </Col>
          </Grid>
          {/* Guest ordering flow — portrait phone recording. Portrait
              media never goes full-canvas; centered at 4 cols it keeps
              a sane height (~640px). */}
          <FadeIn className="mt-10">
            <Grid>
              <Col md="3-10" lg="5-8">
                <video
                  src="/videos/fb-guest-flow.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full rounded-lg block"
                />
              </Col>
            </Grid>
          </FadeIn>

          {/* Dashboard UI is dense — full canvas each, stacked */}
          <Grid className="mt-10 gap-y-8">
            <Col lg="full"><FadeIn><img src="/images/fb-ordering/fb-ordering-table.png" alt="Staff fulfillment dashboard showing new orders" className="w-full rounded-lg" /></FadeIn></Col>
            <Col lg="full"><FadeIn delay={0.1}><img src="/images/fb-ordering/fb-ordering-dashboard.png" alt="Staff order detail with approve/deny" className="w-full rounded-lg" /></FadeIn></Col>
          </Grid>
        </FadeIn>

        {/* ── The Problem ── */}
        <FadeIn as="section" className="scroll-mt-24 pt-24">
          <Grid preset="prose">
            <Col>
              <SectionHeading id="problem">The Problem</SectionHeading>
              <p className="mb-5">
                One hotel we spoke to ran breakfast on door hangers. Guests forgot to hang them, staff missed pickups, and complaints piled up. At most properties the alternative was the front desk phone: misheard orders, tied-up staff, and enough friction that guests simply gave up. Meanwhile, Canary was losing deals in APAC markets where mobile ordering is table stakes.
              </p>
              <p>
                Canary&#39;s Guest Hub was still a static content product. F&amp;B ordering would make it transactional: a revenue engine, not just an info layer. The discipline was scope: no marketplaces, no kitchen software. Just get a guest&#39;s order to staff efficiently.
              </p>
            </Col>
          </Grid>
        </FadeIn>

        {/* ── The Solution ── */}
        <FadeIn as="section" className="scroll-mt-24 pt-32">
          <Grid preset="prose">
            <Col>
              <SectionHeading id="solution">The Solution</SectionHeading>
              <p className="mb-5">
                We built a mobile-first ordering experience for our guests that served as an extension to our existing guest experience platform. Guests can browse available menu items, add to their carts, and then send their orders to hotel staff easily.
              </p>
              <p className="mb-5">
                To manage inbound orders, we built a dashboard and notification system that enabled operators to easily notify their kitchen staff and complete fulfillment. There were four major decisions that defined the design:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><span className="font-medium text-(--color-fg)">Built upon our existing infrastructure:</span> fast implementation was important in order to go-to-market quickly. We designed mobile ordering as an extension to our existing guest experience and upselling platforms using similar patterns, but tweaked to match food &amp; beverage use cases.</li>
                <li><span className="font-medium text-(--color-fg)">Delivery type drives the experience:</span> hotel customers wanted to go beyond in-room dining in order to expand channels for revenue. We had to design a flow that flexibly allowed for alternative locations such as orders delivered poolside, or to the hotel lounge.</li>
                <li><span className="font-medium text-(--color-fg)">Five system objects as the IA backbone:</span> Ordering Outlets, Menus, Items, Modifier Groups, Orders. Manage items once, compose menus flexibly.</li>
                <li><span className="font-medium text-(--color-fg)">Works with or without a PMS:</span> reservation-linked ordering when integrated, manual entry fallback for everyone else. No POS requirement meant shipping to the whole market.</li>
              </ul>
            </Col>
          </Grid>
        </FadeIn>

        {/* ── Research & Discovery ── */}
        <FadeIn className="pt-32">
          <Grid preset="prose">
            <Col>
              <ExpandableSection title="Research & Discovery" id="research">
                <p>
                  Customer interviews with hotel F&amp;B staff, competitive analysis, and usability testing on a fully interactive Next.js prototype I built, which went on to become the primary demo tool for sales calls and GTM enablement. The research drove three calls: no POS requirement (a POS dependency would have blocked 80%+ of potential customers), a staff dashboard sorted by time-elapsed urgency so orders never get missed during peak hours, and a no-download mobile web flow using patterns guests already know.
                </p>
              </ExpandableSection>
            </Col>
          </Grid>
        </FadeIn>

        {/* ── Impact & Results ── */}
        <FadeIn className="pt-32">
          <Grid preset="prose">
            <Col>
              <ExpandableSection title="Impact & Results" id="impact">
                <p className="mb-8">
                  F&amp;B Ordering hit GA in February 2026 with two verbal commitments from demos alone and 50 pilot orders validating demand before launch. The delivery-type model became the architectural pattern for all future ordering scenarios (spa, activities, table-side), and APAC enterprise interest is building, with $25K+ in potential ARR from interested properties.
                </p>
              </ExpandableSection>
            </Col>
          </Grid>
        </FadeIn>

        {/* ── Reflection ── */}
        <FadeIn className="pt-32">
          <Grid preset="prose">
            <Col>
              <ExpandableSection title="Reflection" id="reflection">
                <ul className="list-disc pl-5 space-y-2">
                  <li><span className="font-medium text-(--color-fg)">Prototype in code, early.</span> Hotel staff testing realistic flows made research dramatically more effective, and the prototype became a genuine GTM asset.</li>
                  <li><span className="font-medium text-(--color-fg)">Find the one variable.</span> The delivery-type insight collapsed dozens of edge cases into a single configurable model. Designing for two audiences (guests ordering, staff fulfilling) means designing the system, not the screens.</li>
                  <li><span className="font-medium text-(--color-fg)">I&#39;d push harder on staff notifications in the MVP.</span> Post-launch feedback from HOMA showed hotels needed immediate alerts, as their team had to keep checking for new orders.</li>
                </ul>
              </ExpandableSection>
            </Col>
          </Grid>
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

"use client";

import ExpandableSection from "@/components/case-study/ExpandableSection";
import ObjectFlowDiagram from "@/components/fb-showcase/ObjectFlowDiagram";
import FadeIn from "@/components/case-study/FadeIn";
import SectionHeading from "@/components/case-study/SectionHeading";
import CaseStudyShell from "@/components/case-study/CaseStudyShell";
import MetaRail from "@/components/case-study/MetaRail";
import Grid, { Col } from "@/components/layout/Grid";
import { typescale } from "@/lib/typography";

const TOC_ITEMS = [
  { id: "solution", label: "Solution" },
  { id: "research", label: "Research" },
  { id: "impact", label: "Impact" },
  { id: "reflection", label: "Reflection" },
];

const META = [
  { label: "Year", values: ["2025–2026"] },
  {
    label: "Role",
    values: ["Sole designer"],
    info: "Built with Nico Garnier (PM) and engineers Joanne Chevalier, Andrea Bradshaw & Luciano Guasco",
  },
  { label: "Scope", values: ["Guest ordering", "Menu CMS", "Staff dashboard"] },
];

export default function FBOrderingContent() {
  return (
    <CaseStudyShell tocItems={TOC_ITEMS}>
        {/* Full-canvas staff-dashboard shot leads the page, above the
            title (Marco's 2026-07-15 feedback pass). */}
        <FadeIn>
          <Grid className="mb-20">
            <Col lg="full">
              {/* Bottom corners rounder than the top — the shot's own
                  baked corner radius peeks past an even 8px clip. */}
              <img
                src="/images/fb-ordering/fb-ordering-dashboard.png"
                alt="Staff order detail with approve/deny"
                className="w-full"
                style={{
                  borderRadius: "8px 8px 18px 18px",
                  // Same 3-stop ambient lift as the DeviceShell specimens.
                  boxShadow:
                    "0 1px 2px rgba(0, 0, 0, 0.05), 0 12px 28px rgba(0, 0, 0, 0.08), 0 32px 56px rgba(0, 0, 0, 0.06)",
                }}
              />
            </Col>
          </Grid>
        </FadeIn>

        {/* Title + subtitle with metadata rail (intro-rail) */}
        <Grid preset="intro-rail">
          <Col>
            <h1 className="text-(--color-fg)" style={{ ...typescale.display, fontFamily: "var(--font-baskerville), Georgia, serif", fontWeight: 700, letterSpacing: "0.02em" }}>F&B Mobile Ordering</h1>
            <p className="mt-3 italic text-(--color-fg-tertiary)">Warning: this case study may induce hunger.</p>
            <p className="mt-3 text-(--color-fg-secondary)">I designed a 0-to-1 food &amp; beverage ordering platform for hotels, the newest addition to Canary&#39;s suite of revenue products. Guests&#39; late-night munchies were increasingly going to DoorDash instead of the front desk, so we rebuilt room service to be modern, convenient, and visually enticing. Four months to MVP, $23K in committed ARR five weeks after launch.</p>
            {/* Problem section folded into the intro (Marco 2026-07-15) */}
            <p className="mt-3 text-(--color-fg-secondary)">One hotel we spoke to ran breakfast on door hangers. Guests forgot to hang them, staff missed pickups, and complaints piled up. At most properties the alternative was the front desk phone: misheard orders, tied-up staff, and enough friction that guests simply gave up. Meanwhile, Canary was losing deals in APAC markets where mobile ordering is table stakes.</p>
            <p className="mt-3 text-(--color-fg-secondary)">Canary&#39;s Guest Hub was still a static content product. F&amp;B ordering would make it transactional: a revenue engine, not just an info layer. The discipline was scope: no marketplaces, no kitchen software. Just get a guest&#39;s order to staff efficiently.</p>
          </Col>
          <Col className="mt-8 lg:mt-2">
            <MetaRail items={META} />
          </Col>
        </Grid>

        {/* ── The Solution ── */}
        <FadeIn as="section" className="scroll-mt-24 pt-32">
          <Grid preset="media-right">
            <Col>
              <SectionHeading id="solution">The Solution</SectionHeading>
              <p className="mb-5">
                We built a mobile-first ordering experience for our guests that served as an extension to our existing guest experience platform. Guests can browse available menu items, add to their carts, and then send their orders to hotel staff easily.
              </p>
              <p className="mb-5">
                To manage inbound orders, we built a dashboard and notification system that enabled operators to easily notify their kitchen staff and complete fulfillment. There were four major decisions that defined the design:
              </p>
            </Col>
            {/* The four decisions run as a numbered list in the media
                column, top-aligned with the first paragraph (88px =
                heading mt-12 + 28px line + mb-3). */}
            <Col className="mt-8 lg:mt-[88px]">
              <ol className="list-decimal pl-5 space-y-2">
                <li><span className="font-medium text-(--color-fg)">Built upon our existing infrastructure:</span> fast implementation was important in order to go-to-market quickly. We designed mobile ordering as an extension to our existing guest experience and upselling platforms using similar patterns, but tweaked to match food &amp; beverage use cases.</li>
                <li><span className="font-medium text-(--color-fg)">Delivery type drives the experience:</span> hotel customers wanted to go beyond in-room dining in order to expand channels for revenue. We had to design a flow that flexibly allowed for alternative locations such as orders delivered poolside, or to the hotel lounge.</li>
                <li><span className="font-medium text-(--color-fg)">Five system objects as the IA backbone:</span> Ordering Outlets, Menus, Items, Modifier Groups, Orders. Manage items once, compose menus flexibly.</li>
                <li><span className="font-medium text-(--color-fg)">Works with or without a PMS:</span> reservation-linked ordering when integrated, manual entry fallback for everyone else. No POS requirement meant shipping to the whole market.</li>
              </ol>
            </Col>
          </Grid>
        </FadeIn>

        {/* ── Object flow diagram ── */}
        <FadeIn className="pt-16">
          <Grid>
            <Col lg="full">
              <ObjectFlowDiagram />
            </Col>
          </Grid>
        </FadeIn>

        {/* ── Research & Discovery ── */}
        <FadeIn className="pt-32">
          <Grid preset="media-right">
            <Col>
              <ExpandableSection title="Research & Discovery" id="research">
                <p>
                  Customer interviews with hotel F&amp;B staff, competitive analysis, and usability testing on a fully interactive Next.js prototype I built, which went on to become the primary demo tool for sales calls and GTM enablement. The research drove three calls: no POS requirement (a POS dependency would have blocked 80%+ of potential customers), a staff dashboard sorted by time-elapsed urgency so orders never get missed during peak hours, and a no-download mobile web flow using patterns guests already know.
                </p>
              </ExpandableSection>
            </Col>
            {/* Placeholder hidden for now (Marco 2026-07-15) — restore when
                the capture lands. Text keeps its 1-5 span via the preset.
              <Col className="mt-8 lg:mt-0">
                <ImagePlaceholder description="Interactive Next.js prototype used in usability tests and sales demos" aspectRatio="16/10" />
              </Col> */}
          </Grid>
        </FadeIn>

        {/* ── Impact & Results ── */}
        <FadeIn className="pt-32">
          <Grid preset="media-right">
            <Col>
              <ExpandableSection title="Impact & Results" id="impact">
                <p className="mb-8">
                  F&amp;B Ordering hit GA in February 2026 with two verbal commitments from demos alone and 50 pilot orders validating demand before launch. The delivery-type model became the architectural pattern for all future ordering scenarios (spa, activities, table-side), and APAC enterprise interest is building, with $25K+ in potential ARR from interested properties.
                </p>
              </ExpandableSection>
            </Col>
            {/* Placeholder hidden for now (Marco 2026-07-15).
              <Col className="mt-8 lg:mt-0">
                <ImagePlaceholder description="Launch metrics: pilot orders, verbal commitments, APAC pipeline" aspectRatio="16/10" />
              </Col> */}
          </Grid>
        </FadeIn>

        {/* ── Reflection ── */}
        <FadeIn className="pt-32">
          <Grid preset="media-right">
            <Col>
              <ExpandableSection title="Reflection" id="reflection">
                <ul className="list-disc pl-5 space-y-2">
                  <li><span className="font-medium text-(--color-fg)">Prototype in code, early.</span> Hotel staff testing realistic flows made research dramatically more effective, and the prototype became a genuine GTM asset.</li>
                  <li><span className="font-medium text-(--color-fg)">Find the one variable.</span> The delivery-type insight collapsed dozens of edge cases into a single configurable model. Designing for two audiences (guests ordering, staff fulfilling) means designing the system, not the screens.</li>
                  <li><span className="font-medium text-(--color-fg)">I&#39;d push harder on staff notifications in the MVP.</span> Post-launch feedback from HOMA showed hotels needed immediate alerts, as their team had to keep checking for new orders.</li>
                </ul>
              </ExpandableSection>
            </Col>
            {/* Placeholder hidden for now (Marco 2026-07-15).
              <Col className="mt-8 lg:mt-0">
                <ImagePlaceholder description="Staff notifications concept / HOMA post-launch feedback" aspectRatio="16/10" />
              </Col> */}
          </Grid>
        </FadeIn>

        {/* ── Next Project — hidden for now (Marco 2026-07-15) ──
        <FadeIn>
          <NextProject
            title="Compendium"
            subtitle="Building a scalable hotel CMS platform from scratch"
            href="/work/compendium"
          />
        </FadeIn> */}
    </CaseStudyShell>
  );
}

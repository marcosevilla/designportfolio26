"use client";

import QuickStats from "@/components/case-study/QuickStats";
import NextProject from "@/components/case-study/NextProject";
import FadeIn from "@/components/case-study/FadeIn";
import SectionHeading from "@/components/case-study/SectionHeading";
import CaseStudyShell from "@/components/case-study/CaseStudyShell";
import StudyMetaRow from "@/components/case-study/StudyMetaRow";
import Grid, { Col } from "@/components/layout/Grid";
import { CONTENT_BAND, CONTENT_BAND_MD } from "@/lib/layout-presets";
import { typescale } from "@/lib/typography";
import type { StudyMeta } from "@/lib/content";

const STATS = [
  { value: "~50", label: "Working prototypes shipped" },
  { value: "8 PRs", label: "Production slice from one prototype" },
  { value: "24 hrs", label: "CEO demo, 400-hotel chain" },
  { value: "This site", label: "Built the same way" },
];

const TOC_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "shipped-from-the-prototype", label: "Shipped from the Prototype" },
  { id: "code-is-the-design", label: "The Code Is the Design" },
  { id: "scaling-the-practice", label: "Scaling the Practice" },
  { id: "the-practice", label: "The Practice Underneath" },
  { id: "what-ive-learned", label: "What I've Learned" },
];

export default function AIWorkflowContent({ meta }: { meta: StudyMeta }) {
  return (
    <CaseStudyShell tocItems={TOC_ITEMS}>
          {/* Title + Subtitle */}
          <Grid>
            <Col md={CONTENT_BAND_MD} lg={CONTENT_BAND}>
            <h1
              className="text-(--color-fg)"
              style={typescale.display}
            >
              Prototypes as the spec
            </h1>
            <StudyMetaRow slug="ai-workflow" {...meta} />
            <p
              className="mt-6 text-(--color-fg-secondary)"
              style={{
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 18,
                lineHeight: "26px",
                letterSpacing: "0.02em",
              }}
            >
              How working prototypes replaced Figma as the engineering
              handoff spec — and closed deals along the way.
            </p>
            </Col>
          </Grid>

          {/* Quick Stats */}
          <FadeIn>
            <QuickStats items={STATS} />
          </FadeIn>

          {/* Overview */}
          <FadeIn as="section" className="scroll-mt-24 pt-24">
            <Grid preset="prose">
              <Col>
                <SectionHeading id="overview">Overview</SectionHeading>
                <p className="mb-5">
                  In February 2026, the CEO asked for a demo for B&amp;B
                  Hôtels — a 400-hotel French chain. The sales call was in 24
                  hours. I shipped a working prototype that night: a QR →
                  Google review → tipping flow, in French, in their brand.
                  The next morning I iterated the payment and review routing
                  while the sales cycle ran.
                </p>
                <p>
                  That turnaround isn&apos;t a party trick — it&apos;s how I
                  work. Over the past year at Canary I shipped roughly 50
                  working prototypes on a personal hub, and they repeatedly
                  replaced Figma as the engineering handoff spec. This page
                  is the receipts.
                </p>
              </Col>
            </Grid>
          </FadeIn>

          {/* Shipped from the Prototype */}
          <FadeIn as="section" className="scroll-mt-24 pt-32">
            <Grid preset="prose">
              <Col>
                <SectionHeading id="shipped-from-the-prototype">
                  Shipped from the Prototype
                </SectionHeading>
                <p className="mb-5">
                  In July 2026, the Upsell Segments redesign shipped to
                  production as an 8-PR vertical slice built directly from my
                  prototype. The PM linked the prototype as engineering&apos;s
                  source of truth — at one point unblocking engineers mid-build
                  by sharing the live prototype URL while I was on a plane.
                </p>
                <p>
                  No redlines, no spec doc, no handoff meeting. The engineers
                  built what the prototype had already proved: real
                  interactions, real edge cases, real copy. When the spec is
                  something you can click, the ambiguity that normally fills a
                  sprint of back-and-forth just isn&apos;t there.
                </p>
              </Col>
            </Grid>
          </FadeIn>

          {/* The Code Is the Design */}
          <FadeIn as="section" className="scroll-mt-24 pt-32">
            <Grid preset="prose">
              <Col>
                <SectionHeading id="code-is-the-design">
                  The Code Is the Design
                </SectionHeading>
                <p className="mb-5">
                  When Eurostars, a 270-property European chain, named a HubOS
                  integration their #1 deal-blocking feature — internally the
                  line was &ldquo;no HubOS integration = no deal&rdquo; — I
                  designed the guest service-request flow as working code
                  instead of static mocks: a 5-step wizard engineers built
                  production from directly.
                </p>
                <p>
                  The design brief shipped with evidence tables and a
                  funnel-completion target above 60%, but the artifact that
                  mattered was the running flow. The pattern extended again in
                  July 2026 to HotSOS service requests, covering a meaningfully
                  larger share of the ticketing base.
                </p>
              </Col>
            </Grid>
          </FadeIn>

          {/* Scaling the Practice */}
          <FadeIn as="section" className="scroll-mt-24 pt-32">
            <Grid preset="prose">
              <Col>
                <SectionHeading id="scaling-the-practice">
                  Scaling the Practice
                </SectionHeading>
                <p className="mb-5">
                  The prototypes live on one Next.js hub — a searchable
                  landing grid across 19 feature areas, automated thumbnails,
                  shared CanaryUI components, and per-feature decision logs.
                  Sales pulled demos from it. Marketing pulled screenshots.
                  PMs linked it in tickets.
                </p>
                <p>
                  In February 2026 I wrote the org&apos;s &ldquo;Prototyping
                  with Claude&rdquo; playbook — repo architecture, prompting
                  principles, guardrails, and the MCP toolchain — so the
                  practice wouldn&apos;t stay a one-person trick. Exec
                  leadership named me ahead of the org&apos;s adoption curve at
                  the March 2026 EPD All Hands, and I mentored designers, PMs,
                  and marketing designers on the workflow.
                </p>
              </Col>
            </Grid>
          </FadeIn>

          {/* The Practice Underneath */}
          <FadeIn as="section" className="scroll-mt-24 pt-32">
            <Grid preset="prose">
              <Col>
                <SectionHeading id="the-practice">
                  The Practice Underneath
                </SectionHeading>
                <p className="mb-5">
                  None of this is a magic prompt — it&apos;s an environment.
                  Claude Code runs in the terminal next to my editor, with
                  persistent per-project memory: every project carries a{" "}
                  <code>CLAUDE.md</code> with its conventions, gotchas, and
                  current state, so each session picks up where the last one
                  left off.
                </p>
                <p className="mb-5">
                  MCP integrations connect it to my actual tools — Linear,
                  Slack, Notion, Figma, Todoist, Gmail — so morning triage
                  happens in one conversation instead of six tabs. And a
                  running <code>lessons.md</code> turns every mistake into a
                  one-line rule tied to a specific failure, so errors
                  don&apos;t repeat across sessions. It compounds.
                </p>
                <p>
                  This portfolio is the same practice pointed at a personal
                  project — the scroll animations, the theme system, the chat
                  bar you might be using right now. I design every decision;
                  AI removes the distance between the idea and the working
                  thing.
                </p>
              </Col>
            </Grid>
          </FadeIn>

          {/* What I've Learned */}
          <FadeIn as="section" className="scroll-mt-24 pt-32">
            <Grid preset="prose">
              <Col>
                <SectionHeading id="what-ive-learned">
                  What I&apos;ve Learned
                </SectionHeading>
                <div className="space-y-8">
                  <div>
                    <p className="font-medium text-(--color-fg) mb-2">
                      Where AI helps most
                    </p>
                    <p>
                      Scaffolding and boilerplate, debugging and tracing errors,
                      exploring unfamiliar codebases, translating design
                      decisions into code, automating repetitive workflows, and
                      maintaining context across long-running projects.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-(--color-fg) mb-2">
                      Where human judgment is irreplaceable
                    </p>
                    <p>
                      Taste, prioritization, knowing what to cut, understanding
                      user psychology, navigating ambiguity, making tradeoffs
                      between competing goals, and deciding when something is
                      good enough to ship.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-(--color-fg) mb-2">
                      The compound effect
                    </p>
                    <p>
                      The biggest value isn&apos;t any single interaction —
                      it&apos;s the accumulation. Persistent context means each
                      session builds on the last. Logged lessons mean the same
                      mistakes don&apos;t repeat. Connected tools mean less time
                      gathering context and more time making decisions. It&apos;s
                      a practice, not a prompt.
                    </p>
                  </div>
                </div>
              </Col>
            </Grid>
          </FadeIn>

          {/* Next Project */}
          <div className="mt-32 pt-16 border-t border-border">
            <NextProject
              title="Canary Food & Beverage Ordering"
              subtitle="A 0-to-1 food & beverage ordering platform for hotels"
              href="/work/canary-food-and-beverage-ordering"
            />
          </div>
    </CaseStudyShell>
  );
}

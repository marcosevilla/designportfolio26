"use client";

import QuickStats from "@/components/case-study/QuickStats";
import NextProject from "@/components/case-study/NextProject";
import FadeIn from "@/components/case-study/FadeIn";
import SectionHeading from "@/components/case-study/SectionHeading";
import CaseStudyShell from "@/components/case-study/CaseStudyShell";
import TwoCol from "@/components/TwoCol";
import { typescale } from "@/lib/typography";

const STATS = [
  { value: "Daily", label: "Claude Code usage" },
  { value: "36+", label: "Cross-session lessons logged" },
  { value: "6", label: "MCP integrations" },
  { value: "This site", label: "Built with AI" },
];

const TOC_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "the-setup", label: "The Setup" },
  { id: "mcp-integrations", label: "MCP Integrations" },
  { id: "self-improving-system", label: "Self-Improving System" },
  { id: "building-real-software", label: "Building Real Software" },
  { id: "what-ive-learned", label: "What I've Learned" },
];

export default function AIWorkflowContent() {
  return (
    <CaseStudyShell tocItems={TOC_ITEMS}>
          {/* Title + Subtitle */}
          <div>
            <h1
              className="tracking-tight text-[var(--color-fg)]"
              style={typescale.display}
            >
              How I Work with AI
            </h1>
            <p
              className="mt-3 text-[var(--color-fg-secondary)]"
              style={{ ...typescale.subtitle, maxWidth: "66%" }}
            >
              AI isn&apos;t a novelty in my workflow — it&apos;s the
              infrastructure. I use Claude Code as a daily development partner,
              connected to my real tools, learning from every session.
            </p>
          </div>

          {/* Quick Stats */}
          <FadeIn>
            <QuickStats items={STATS} />
          </FadeIn>

          {/* Overview */}
          <FadeIn as="section" className="scroll-mt-24 pt-24">
            <TwoCol>
              <TwoCol.Left>
                <SectionHeading id="overview">Overview</SectionHeading>
                <p className="mb-5">
                  Most designers talk about AI as a future possibility. I use it
                  every day as a core part of how I design and build. Over the
                  past year, I&apos;ve developed a practice around Claude Code
                  that goes beyond prompting — it&apos;s a full working
                  environment with persistent context, connected tools, and a
                  self-improving feedback loop.
                </p>
                <p>
                  This page documents that practice: what my setup looks like,
                  how it connects to my real work tools, and what I&apos;ve
                  learned about where AI genuinely helps versus where human
                  judgment is irreplaceable.
                </p>
              </TwoCol.Left>
            </TwoCol>
          </FadeIn>

          {/* The Setup */}
          <FadeIn as="section" className="scroll-mt-24 pt-32">
            <TwoCol>
              <TwoCol.Left>
                <SectionHeading id="the-setup">The Setup</SectionHeading>
                <p className="mb-5">
                  My primary tool is Claude Code — Anthropic&apos;s CLI for
                  Claude that runs in the terminal alongside my editor. It reads
                  files, writes code, runs commands, and maintains context across
                  conversations.
                </p>
                <p className="mb-5">
                  Every project has a <code>CLAUDE.md</code> file that acts as
                  persistent memory — project structure, conventions, known
                  gotchas, and current state. When I start a session, Claude
                  reads this context and picks up where we left off. No
                  re-explaining, no lost context.
                </p>
                <p>
                  I&apos;ve configured custom skills (reusable prompt templates),
                  hooks (automated actions on tool use), and session workflows
                  that reduce the friction of switching between projects. The
                  goal is a working environment where AI handles the scaffolding
                  so I can focus on design decisions.
                </p>
              </TwoCol.Left>
            </TwoCol>
          </FadeIn>

          {/* MCP Integrations */}
          <FadeIn as="section" className="scroll-mt-24 pt-32">
            <TwoCol>
              <TwoCol.Left>
                <SectionHeading id="mcp-integrations">
                  MCP Integrations
                </SectionHeading>
                <p className="mb-5">
                  The Model Context Protocol (MCP) lets Claude connect directly
                  to external services. I&apos;ve wired up six integrations that
                  give Claude access to my actual work tools:
                </p>
                <ul className="space-y-4 mb-5">
                  <li className="flex gap-3">
                    <span className="text-[var(--color-accent)] flex-shrink-0 font-medium">
                      Todoist
                    </span>
                    <span>
                      Task management — Claude can read, create, and organize my
                      tasks across projects
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--color-accent)] flex-shrink-0 font-medium">
                      Linear
                    </span>
                    <span>
                      Engineering tickets — pull assigned issues, check sprint
                      status, update ticket states
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--color-accent)] flex-shrink-0 font-medium">
                      Slack
                    </span>
                    <span>
                      Team communication — search messages, catch up on threads
                      I&apos;ve missed
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--color-accent)] flex-shrink-0 font-medium">
                      Notion
                    </span>
                    <span>
                      Documentation — search and read team docs, product specs,
                      and meeting notes
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--color-accent)] flex-shrink-0 font-medium">
                      Figma
                    </span>
                    <span>
                      Design files — read design context, extract component
                      specs, bridge design to code
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--color-accent)] flex-shrink-0 font-medium">
                      Gmail
                    </span>
                    <span>
                      Email — search and read messages for context during triage
                    </span>
                  </li>
                </ul>
                <p>
                  This isn&apos;t theoretical — I use these daily for morning
                  triage, pulling together context from Slack threads + Linear
                  tickets + Notion docs into a single conversation. It
                  eliminates the tab-switching that fragments attention.
                </p>
              </TwoCol.Left>
            </TwoCol>
          </FadeIn>

          {/* Self-Improving System */}
          <FadeIn as="section" className="scroll-mt-24 pt-32">
            <TwoCol>
              <TwoCol.Left>
                <SectionHeading id="self-improving-system">
                  Self-Improving System
                </SectionHeading>
                <p className="mb-5">
                  The most unusual part of my setup is that it learns from
                  mistakes. I maintain a <code>lessons.md</code> file — a
                  running log of rules generated from real errors. When something
                  goes wrong in a session, I write a rule to prevent it from
                  happening again.
                </p>
                <p className="mb-5">
                  After 36+ logged lessons, the system catches patterns I used
                  to repeat: not checking the backend before summarizing frontend
                  findings, over-engineering simple fixes, forgetting to commit
                  before risky changes. Each rule is one line, tied to a specific
                  failure.
                </p>
                <p>
                  Cross-session memory means Claude starts each conversation
                  already knowing my project conventions, past decisions, and
                  common pitfalls. It&apos;s not perfect, but it&apos;s
                  measurably better than starting from scratch every time — and
                  it compounds over weeks.
                </p>
              </TwoCol.Left>
            </TwoCol>
          </FadeIn>

          {/* Building Real Software */}
          <FadeIn as="section" className="scroll-mt-24 pt-32">
            <TwoCol>
              <TwoCol.Left>
                <SectionHeading id="building-real-software">
                  Building Real Software
                </SectionHeading>
                <p className="mb-5">
                  This portfolio site is the clearest example. It&apos;s a
                  Next.js 14 app with Tailwind, Framer Motion animations, MDX
                  content, and custom interactive components — built
                  collaboratively with Claude Code across dozens of sessions.
                </p>
                <p className="mb-5">
                  That includes the scroll-triggered animations, the theme
                  palette system with 10 color schemes, the Perlin noise
                  background texture, the case study TOC navigation, and the
                  card/list view toggle. I designed each of these, then built
                  them with AI as a development partner.
                </p>
                <p className="mb-5">
                  Beyond the portfolio, I&apos;ve used this workflow to prototype
                  features at work, build internal tools, and contribute code
                  changes that would normally require an engineering partner.
                  As a designer who can ship code with AI assistance, I move
                  faster from concept to implementation.
                </p>
                <p>
                  The key insight: AI doesn&apos;t replace the design thinking.
                  It removes the friction between having an idea and seeing it
                  built. I still make every design decision — layout, typography,
                  interaction patterns, information hierarchy. AI handles the
                  implementation mechanics.
                </p>
              </TwoCol.Left>
            </TwoCol>
          </FadeIn>

          {/* What I've Learned */}
          <FadeIn as="section" className="scroll-mt-24 pt-32">
            <TwoCol>
              <TwoCol.Left>
                <SectionHeading id="what-ive-learned">
                  What I&apos;ve Learned
                </SectionHeading>
                <div className="space-y-8">
                  <div>
                    <p className="font-medium text-[var(--color-fg)] mb-2">
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
                    <p className="font-medium text-[var(--color-fg)] mb-2">
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
                    <p className="font-medium text-[var(--color-fg)] mb-2">
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
              </TwoCol.Left>
            </TwoCol>
          </FadeIn>

          {/* Next Project */}
          <div className="mt-32 pt-16 border-t border-[var(--color-border)]">
            <NextProject
              title="Mobile Ordering for Hotels"
              subtitle="Designing a 0→1 mobile ordering system for hotel F&B"
              href="/work/fb-ordering"
            />
          </div>
    </CaseStudyShell>
  );
}

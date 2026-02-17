"use client";

import QuickStats from "@/components/case-study/QuickStats";
import ImagePlaceholder from "@/components/case-study/ImagePlaceholder";
import ExpandableSection from "@/components/case-study/ExpandableSection";
import SidebarTOCBridge from "@/components/case-study/SidebarTOCBridge";
import TOCObserver from "@/components/case-study/TOCObserver";
import NextProject from "@/components/case-study/NextProject";
import ProgressBar from "@/components/case-study/ProgressBar";
import FadeIn from "@/components/case-study/FadeIn";
import InlineTOC from "@/components/case-study/InlineTOC";
import SectionHeading from "@/components/case-study/SectionHeading";
import TwoCol from "@/components/TwoCol";
import { typescale } from "@/lib/typography";

const STATS = [
  { value: "40%", label: "Faster design-to-dev turnaround" },
  { value: "1", label: "Unified source of truth" },
  { value: "100+", label: "Components documented" },
  { value: "6", label: "Cross-functional team members" },
];

const TOC_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "contributions", label: "Contributions" },
  { id: "solution", label: "Solution" },
  { id: "styles", label: "Styles" },
  { id: "components", label: "Components" },
  { id: "documentation", label: "Documentation" },
  { id: "process", label: "Process" },
  { id: "impact", label: "Impact" },
  { id: "lessons", label: "Lessons" },
];

export default function DesignSystemContent() {
  return (
    <>
      <ProgressBar />
      <SidebarTOCBridge items={TOC_ITEMS} />
      <TOCObserver sectionIds={TOC_ITEMS.map(i => i.id)} />

      <article className="text-[var(--color-fg-secondary)]" style={typescale.body}>
        <InlineTOC />
        <div className="max-w-content mx-auto px-4 sm:px-8 lg:max-w-none lg:px-0 pt-24 lg:pt-[18vh]">

        {/* Title + Subtitle */}
        <TwoCol>
          <TwoCol.Left>
            <h1 className="tracking-tight text-[var(--color-fg)]" style={typescale.display}>Creating a Design System for a Productivity Startup</h1>
            <p className="mt-3 text-[var(--color-fg-secondary)]" style={typescale.subtitle}>Championing and executing a design system and visual language overhaul by securing leadership approval, facilitating design sprints, and collaborating with developers for implementation.</p>
          </TwoCol.Left>
        </TwoCol>

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
                General Task&apos;s mission is to make knowledge workers more productive. I was the first full-time product designer alongside a small, but mighty cross-functional team of 6 developers, a product manager, and a product design intern.
              </p>
              <p className="mb-5">
                Following a successful public beta launch and rebrand, my team looked toward improving our product development cycle. To address inefficiencies, I championed and executed a design system and visual language overhaul by securing leadership approval, facilitating design sprints, and collaborating with developers for implementation.
              </p>
            </TwoCol.Left>
          </TwoCol>

          {/* Callout boxes — full width */}
          <div className="mt-8 p-6 bg-[var(--color-surface-raised)] rounded-lg">
            <p className="mb-2 font-medium text-[var(--color-fg)]">Business Goal</p>
            <p className="text-[var(--color-fg-secondary)] mb-4">
              To streamline and improve the product development cycle in order to ship features at a higher quality bar and with minimal friction.
            </p>
            <p className="mb-2 font-medium text-[var(--color-fg)]">User Goal</p>
            <p className="text-[var(--color-fg-secondary)]">
              Product designers and developers need an intuitive, consistent, and comprehensive system which accelerates the development of feature work.
            </p>
          </div>
        </FadeIn>

        {/* My Contributions */}
        <FadeIn as="section" className="scroll-mt-24 pt-32">
          <TwoCol>
            <TwoCol.Left>
              <SectionHeading id="contributions">My Contributions</SectionHeading>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="text-[var(--color-accent)] flex-shrink-0">📣</span>
                  <span>Gathered feedback from colleagues and leadership</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-accent)] flex-shrink-0">🔬</span>
                  <span>Conducted a full product audit</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-accent)] flex-shrink-0">🗓️</span>
                  <span>Facilitated and scheduled design sprints</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-accent)] flex-shrink-0">💻</span>
                  <span>Designed new visual language and component library alongside my intern</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-accent)] flex-shrink-0">🤝</span>
                  <span>Improved documentation and handoff processes</span>
                </li>
              </ul>
            </TwoCol.Left>
          </TwoCol>
        </FadeIn>

        {/* Our Solution */}
        <FadeIn className="pt-32">
        <ExpandableSection title="Our Solution" id="solution">
          <TwoCol>
            <TwoCol.Left>
              <p className="mb-5">
                With a focus on scalability and efficiency, my team delivered a revamped visual language that would serve as the foundation of our work, and an improved set of documentation, outlining new standard processes.
              </p>
              <p className="mb-8">
                After an intensive period of research, revision, and planning, our team launched a comprehensive overhaul of General Task&apos;s design system. Through this process we refined our design philosophy, enhanced product usability, and improved our development process, guided by the following principles:
              </p>
            </TwoCol.Left>
          </TwoCol>

          <FadeIn className="my-8">
            <ImagePlaceholder
              description="General Task's revamped design system overview"
              aspectRatio="16/9"
            />
          </FadeIn>

          <TwoCol>
            <TwoCol.Left>
              <ul className="space-y-2 mt-6">
                <li className="flex gap-3">
                  <span className="text-[var(--color-accent)]">•</span>
                  <span>Visual consistency and harmony</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-accent)]">•</span>
                  <span>Product usability and accessibility</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-accent)]">•</span>
                  <span>A strong connection to our brand and mission</span>
                </li>
              </ul>
            </TwoCol.Left>
          </TwoCol>
        </ExpandableSection>
        </FadeIn>

        {/* New Styles */}
        <FadeIn className="pt-32">
        <ExpandableSection title="New Styles" id="styles">
          <TwoCol>
            <TwoCol.Left>
              <p className="mb-8">
                We were thoughtful about aligning our new styles with our product vision, striving for visual harmony, better accessibility, and better alignment with our rebrand.
              </p>
            </TwoCol.Left>
          </TwoCol>

          <TwoCol>
            <TwoCol.Left>
              <SectionHeading level={3}>Typography</SectionHeading>
              <p className="mb-8">
                We added type styles optimized for desktop for more flexibility, old styles were amended to address accessibility issues, and naming conventions were updated.
              </p>
            </TwoCol.Left>
          </TwoCol>

          <FadeIn className="my-8">
            <ImagePlaceholder
              description="Typography scale and type styles"
              aspectRatio="16/9"
            />
          </FadeIn>

          <TwoCol>
            <TwoCol.Left>
              <SectionHeading level={3}>Color</SectionHeading>
              <p className="mb-8">
                Using semantic names for colors, rather than generic names or hex codes, made communication more efficient between designers and developers. We expanded our palette to accommodate our brand colors, various backgrounds, as well as semantic colors to indicate status.
              </p>
            </TwoCol.Left>
          </TwoCol>

          <TwoCol>
            <TwoCol.Left>
              <SectionHeading level={3}>Spacing and Grid System</SectionHeading>
              <p>
                Our team previously was not adhering to a pixel grid or had any spacing components. With our new spacing and grid system, we were able to deliver more robust consistency across the product.
              </p>
            </TwoCol.Left>
          </TwoCol>
        </ExpandableSection>
        </FadeIn>

        {/* Component Library */}
        <FadeIn className="pt-32">
        <ExpandableSection title="Updated Component Library" id="components">
          <TwoCol>
            <TwoCol.Left>
              <p className="mb-8">
                With our new set of styles, we refined our components library with a uniformity we were previously lacking. This enhanced library sped up our design process, enabling the team to churn out iterations faster than before.
              </p>
            </TwoCol.Left>
          </TwoCol>

          <FadeIn className="my-8">
            <ImagePlaceholder
              description="Component library showcase"
              aspectRatio="16/9"
            />
          </FadeIn>

          <TwoCol>
            <TwoCol.Left>
              <ul className="space-y-4 mt-6">
                <li>
                  <p className="font-medium text-[var(--color-fg)] mb-1">Templates</p>
                  <p className="text-[var(--color-fg-secondary)]">We created templates out of commonly used components, outlining use cases and sizing specifications.</p>
                </li>
                <li>
                  <p className="font-medium text-[var(--color-fg)] mb-1">New components and interaction states</p>
                  <p className="text-[var(--color-fg-secondary)]">We accounted for error states, destructive actions, and several focus states, creating a more comprehensive library of components to account for a wider variety of use cases.</p>
                </li>
                <li>
                  <p className="font-medium text-[var(--color-fg)] mb-1">Brand alignment</p>
                  <p className="text-[var(--color-fg-secondary)]">Our color palette and design aesthetic fit our product vision and updated brand identity.</p>
                </li>
                <li>
                  <p className="font-medium text-[var(--color-fg)] mb-1">Flexibility</p>
                  <p className="text-[var(--color-fg-secondary)]">Leveraging Figma&apos;s capabilities, we were able to create flexible components that would allow us to efficiently create design iterations.</p>
                </li>
              </ul>
            </TwoCol.Left>
          </TwoCol>

          <FadeIn className="my-8">
            <ImagePlaceholder
              description="Task items redesigned for current and future integrations"
              aspectRatio="16/9"
            />
          </FadeIn>

          <TwoCol>
            <TwoCol.Left>
              <p>
                Task items were redesigned to accommodate our current and future integrations. We decreased padding for increased list item density, and moved the domino grabber outside to avoid moving the checkbox click target.
              </p>
            </TwoCol.Left>
          </TwoCol>
        </ExpandableSection>
        </FadeIn>

        {/* Documentation */}
        <FadeIn className="pt-32">
        <ExpandableSection title="Improved Documentation" id="documentation">
          <TwoCol>
            <TwoCol.Left>
              <p className="mb-8">
                Our updated design document was built in Figma. It gave clear instructions to the team on how to use and update our design system. We kept a change log of items whenever things changed. I received positive feedback from our developers and leadership team that the extra instruction was a huge improvement from our past document which was often ambiguous and hard to navigate.
              </p>
            </TwoCol.Left>
          </TwoCol>

          <FadeIn className="my-8">
            <ImagePlaceholder
              description="Figma design document and documentation structure"
              aspectRatio="16/9"
            />
          </FadeIn>

          <FadeIn className="my-8">
            <ImagePlaceholder
              description="Design tokens documentation"
              aspectRatio="16/9"
            />
          </FadeIn>
        </ExpandableSection>
        </FadeIn>

        {/* Process Overview */}
        <FadeIn className="pt-32">
        <ExpandableSection title="Process Overview" id="process">
          <TwoCol>
            <TwoCol.Left>
              <SectionHeading level={3}>Phase One: Research and Discovery</SectionHeading>
              <p className="mb-5">
                General Task&apos;s UI suffered from inconsistencies, both visually and functionally. We were missing foundational interaction states and had inconsistent components across the app that led to an overall clunky user experience. These were definitely red flags which decreased the quality bar of our app.
              </p>
              <p className="mb-8">
                Designer-to-developer communication was stifled by a lack of a source of truth for our designs. Oftentimes, components were created without defined spacing, color, or typographical specs, leading to inconsistency between projects. Developers often would take matters into their own hands and design components from scratch.
              </p>
            </TwoCol.Left>
          </TwoCol>

          <TwoCol>
            <TwoCol.Left>
              <SectionHeading level={3}>Phase Two: Synthesis and Analysis</SectionHeading>
              <p className="mb-5">
                It started to become obvious to us: we needed a source of truth for designers and developers. Without a fully comprehensive design system, the quality bar of our product would continue to suffer as we kept building new features.
              </p>
              <p className="mb-5">
                After consulting with leadership, developers, and my design intern, we began to ask ourselves guiding questions:
              </p>
              <ul className="space-y-2 mb-8">
                <li className="flex gap-3">
                  <span className="text-[var(--color-accent)]">•</span>
                  <span>How might we improve our design foundations so that we can grow at scale?</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-accent)]">•</span>
                  <span>How might we create a system more accessible to our developers?</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-accent)]">•</span>
                  <span>How might we create a system that encourages more alignment between designers?</span>
                </li>
              </ul>
            </TwoCol.Left>
          </TwoCol>

          <TwoCol>
            <TwoCol.Left>
              <SectionHeading level={3}>Auditing Our Design Library</SectionHeading>
              <p className="mb-5">
                We went through a thorough audit process, analyzing our legacy design library which contained our (quite disheveled) set of product styles and components. We recorded what was missing, found opportunities for improvement, and prioritized which work was most feasible and pertinent within our timeline.
              </p>
            </TwoCol.Left>
          </TwoCol>

          <FadeIn className="my-8">
            <ImagePlaceholder
              description="Design library audit findings"
              aspectRatio="16/9"
            />
          </FadeIn>

          <TwoCol>
            <TwoCol.Left>
              <p className="mb-5">Notable observations from our audit:</p>
              <ul className="space-y-2 mb-8">
                <li className="flex gap-3">
                  <span className="text-[var(--color-accent)]">•</span>
                  <span>We were missing standardized grid system and spacing units.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-accent)]">•</span>
                  <span>We lacked some essential interaction states for a majority of our components.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-accent)]">•</span>
                  <span>We were using an outdated color system which wasn&apos;t aligned with our recently updated branding.</span>
                </li>
              </ul>
            </TwoCol.Left>
          </TwoCol>

          <TwoCol>
            <TwoCol.Left>
              <SectionHeading level={3}>Competitive Analysis</SectionHeading>
              <p>
                I conducted a competitive analysis of popular design systems which gave us inspiration for how we could improve our system and documentation: Google&apos;s Material Design 3, Figma&apos;s UI2, Linear&apos;s design system, and Stripe&apos;s design system.
              </p>
            </TwoCol.Left>
          </TwoCol>
        </ExpandableSection>
        </FadeIn>

        {/* Impact and Results */}
        <FadeIn className="pt-32">
        <ExpandableSection title="Impact and Results" id="impact">
          <div className="space-y-8">
            <TwoCol>
              <TwoCol.Left>
                <SectionHeading level={3}>Faster design and development turnaround</SectionHeading>
                <p>
                  We were able to streamline the design-to-development process, significantly reducing the turnaround time. This was achieved by establishing a reusable component library and predefined design patterns, which minimized the back-and-forth communication, and allowed designers and developers to focus more on innovative features and problem solving.
                </p>
              </TwoCol.Left>
            </TwoCol>
            <TwoCol>
              <TwoCol.Left>
                <SectionHeading level={3}>Shared source of truth</SectionHeading>
                <p>
                  The new design system served as a unified source of truth, making it easier for both designers and developers to stay aligned on product specifications. By maintaining consistency in styles, components, and design principles, misinterpretations and deviations were significantly reduced.
                </p>
              </TwoCol.Left>
            </TwoCol>
            <TwoCol>
              <TwoCol.Left>
                <SectionHeading level={3}>A higher level of visual polish</SectionHeading>
                <p>
                  The consistent use of typography, colors, spacing, and other design elements across all screens and features elevated the aesthetic and usability of the product.
                </p>
              </TwoCol.Left>
            </TwoCol>
          </div>
        </ExpandableSection>
        </FadeIn>

        {/* Lessons */}
        <FadeIn className="pt-32">
        <ExpandableSection title="Lessons & Takeaways" id="lessons">
          <div className="space-y-8">
            <TwoCol>
              <TwoCol.Left>
                <SectionHeading level={3}>Learn fast, fail fast</SectionHeading>
                <p>
                  Working for an early-stage startup taught me how to make the most out of limited time and resources. Since I was trusted with such a large project, and with little prior design systems experience, I had to embrace that I&apos;d have to move quickly and make mistakes. It also showed me I can learn a lot in a short period of time.
                </p>
              </TwoCol.Left>
            </TwoCol>
            <TwoCol>
              <TwoCol.Left>
                <SectionHeading level={3}>Continuous improvement</SectionHeading>
                <p>
                  Design systems are never finished. Although my time with General Task was nearing an end, there were a lot of moving parts within our design system that could&apos;ve used improvement. We had to ensure that there was routine maintenance of our system and alignment with the team to keep everything up-to-date.
                </p>
              </TwoCol.Left>
            </TwoCol>
            <TwoCol>
              <TwoCol.Left>
                <SectionHeading level={3}>Thinking long-term can save you time in the short-term</SectionHeading>
                <p>
                  Our investment into making a sustainable and organized system enabled us to iterate faster than we ever had before. This gave us more space to try new, creative solutions which we didn&apos;t have the bandwidth for before.
                </p>
              </TwoCol.Left>
            </TwoCol>
            <TwoCol>
              <TwoCol.Left>
                <SectionHeading level={3}>Prioritize, prioritize, prioritize</SectionHeading>
                <p>
                  With such limited time it taught me to focus on the most impactful and foundational aspects first, allowing us to move faster through the rest of the project.
                </p>
              </TwoCol.Left>
            </TwoCol>
          </div>
        </ExpandableSection>
        </FadeIn>

        {/* Next Project */}
        <FadeIn>
          <div className="mt-32 pt-16 border-t border-[var(--color-border)]">
            <NextProject
              title="F&B Mobile Ordering"
              subtitle="A mobile, app-less food ordering system for hotel guests"
              href="/work/fb-ordering"
            />
          </div>
        </FadeIn>

        </div>
      </article>
    </>
  );
}

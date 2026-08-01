# Prototypes as the Spec

**How working prototypes replaced Figma as the engineering handoff spec — and closed deals along the way.**

---

```
Company          Canary Technologies (practice) / Personal (this site)
Timeline         2025–2026
Role             Designer + builder
Stack            Claude Code, Next.js, CanaryUI
```

---

### Quick Stats

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  ~50            │  8 PRs          │  24 hrs         │  This site      │
│  Working        │  Production     │  CEO demo for   │  Built the      │
│  prototypes     │  slice from one │  a 400-hotel    │  same way       │
│  shipped        │  prototype      │  chain          │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

---

### The 24-hour demo

In February 2026, Canary's CEO asked for a demo for B&B Hôtels — a 400-hotel French chain. The sales call was in 24 hours. Marco shipped a working prototype that night: a QR → Google review → tipping flow, in French, in B&B's brand. The next morning he iterated the payment and review routing while the sales cycle ran.

---

### Shipped from the prototype

In July 2026, the Upsell Segments redesign shipped to production as an 8-PR vertical slice built directly from Marco's prototype. The PM linked the prototype as engineering's source of truth — at one point unblocking engineers mid-build by sharing the live prototype URL while Marco was on a plane. No redlines, no spec doc, no handoff meeting.

---

### The code is the design

When Eurostars (270-property European chain) named a HubOS integration their #1 deal-blocking feature ("no HubOS integration = no deal"), Marco designed the guest service-request flow as working code instead of static mocks — a 5-step wizard engineers built production from directly. The design brief shipped with evidence tables and a >60% funnel-completion target. The pattern extended in July 2026 to HotSOS service requests.

---

### Scaling the practice

- ~50 prototypes across 19 feature areas on one Next.js hub — searchable landing grid, automated thumbnails, shared CanaryUI components, per-feature decision logs
- Sales pulled demos from the hub; marketing pulled screenshots; PMs linked it in tickets
- Authored the org's "Prototyping with Claude" playbook (Feb 2026): repo architecture, prompting principles, guardrails, MCP toolchain
- Named by exec leadership as ahead of the org's adoption curve at the March 2026 EPD All Hands
- Mentored designers, PMs, and marketing designers on the workflow

---

### The practice underneath

Claude Code runs in the terminal next to the editor with persistent per-project memory (CLAUDE.md files carrying conventions, gotchas, and current state). MCP integrations connect it to real tools — Linear, Slack, Notion, Figma, Todoist, Gmail — so context gathering happens in one conversation. A running lessons.md turns every mistake into a one-line rule tied to a specific failure, so errors don't repeat across sessions.

This portfolio site — the scroll animations, theme system, and this chat bar itself — was built with the same practice.

---

### What Marco learned

- **Where AI helps most:** scaffolding, debugging, exploring unfamiliar codebases, translating design decisions into code, automating repetitive workflows, maintaining context across long-running projects.
- **Where human judgment is irreplaceable:** taste, prioritization, knowing what to cut, user psychology, navigating ambiguity, deciding when something is good enough to ship.
- **The compound effect:** persistent context means each session builds on the last; logged lessons mean mistakes don't repeat; connected tools mean less time gathering context and more time making decisions. It's a practice, not a prompt.

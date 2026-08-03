// Colleague recommendations, transcribed verbatim from Marco's LinkedIn
// profile (2026-08-03). Earlier versions of this file carried condensed
// paraphrases — EJ's in particular stitched together three non-adjacent
// sentences — so the site now holds the complete text and `paragraphs`
// preserves the original breaks.
//
// Source: linkedin.com/in/marcogsevilla → Recommendations (received).
// When a new recommendation comes in, add it here in reverse-chronological
// order; components/Testimonials.tsx handles length differences on its own.

export type Testimonial = {
  /** Full recommendation text, one entry per paragraph as written. */
  paragraphs: string[];
  author: string;
  /** LinkedIn profile — renders the author name as an inline link. */
  href?: string;
  /** Roles shown after the name, e.g. "Design @ Netflix, Design @ LinkedIn". */
  org?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    paragraphs: [
      "Marco is a fantastic designer and a joy to work with. He is curious, thoughtful, resourceful, and has excellent product sense.",
      "One of the best parts of working with Marco is his initiative. He doesn't wait for permission to start gathering user feedback, proposing improvements, and pitching bigger ideas; our products are richer for that. He eagerly experiments with and adopts new tools for design and prototyping that help us rapidly explore and validate not only look, but feel and flow.",
      "Marco helps his colleagues sharpen our own thinking with great questions and clarifications, and also brings in his own original research to further all of our understanding of the opportunities we're working on together. He not only does great work himself, but he makes those around him better as well.",
    ],
    author: "Quinn Duffy",
    href: "https://www.linkedin.com/in/quinnduffy/",
    org: "Product @ Canary, VP of Product @ Alma",
  },
  {
    paragraphs: [
      "What sets Marco apart is his rare ability to balance strategic business thinking with exceptional craft. He never stops at designing elegant interfaces. Marco deeply understands the business context, technical constraints, and real user workflows that make or break complex enterprise products. Every design decision comes with clear rationale, genuine user empathy, and a strong sense of what will actually ship, scale, and survive contact with reality.",
      "Marco is also an outstanding collaborator. He works seamlessly with product, engineering, and leadership, asks the right questions early, and has a gift for turning ambiguity into clarity. Whether he's shaping product vision, untangling edge cases, or gently pushing the team toward better outcomes, he consistently elevates the entire room.",
      "And perhaps most importantly, Marco is just an extremely likable human being. He's genuinely kind, brings great energy to any team, has interesting hobbies, and eats excellent food which, in my opinion, is an underrated but absolutely critical workplace skill. Teams are better, happier, and more effective with Marco on them.",
    ],
    author: "EJ Lee",
    href: "https://www.linkedin.com/in/ejeunjonglee/",
    org: "Product @ Canary, Director of Product @ Bite",
  },
  {
    paragraphs: [
      "When Marco and I first started working together, I was in disbelief that it was his first Product Design role. He's good. And when the workload got intense, as it often can at a startup, he showed up again and again to ensure things were not only done on time, but that they were done well. He does good work, asks good questions, and provides good feedback — you'd be lucky to have him on your team.",
    ],
    author: "Hans van de Bruggen",
    href: "https://www.linkedin.com/in/verbiate",
    org: "Design @ Netflix, Design @ LinkedIn",
  },
  {
    paragraphs: [
      "Marco is a rare, talented designer with an endless stamina for feedback and continuous improvement. Rather than adopting the siloed thinking that so often plagues creatives, Marco works openly and collaboratively, going beyond visual design to help the team tell compelling stories. Marco's awesome to work with.",
    ],
    author: "Kevin Doherty",
    href: "https://www.linkedin.com/in/kpdoh/",
    org: "Marketing @ Alma, Marketing @ August Health",
  },
];

// Colleague testimonials — lifted from the retired Marquee component
// (2026-07-15) so the copy survives independent of any one surface.
// Condensed to one entry per person: each author's quotes merged into
// a single flowing quote (original wording and order preserved, with
// "Marco…" lead-ins added 2026-07-15 so each quote stands alone).

export type Testimonial = {
  text: string;
  author: string;
  /** LinkedIn profile — renders the author name as an inline link. */
  href?: string;
  /** Companies shown after the name, e.g. "Alma, August Health". */
  org?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    text: "Marco is a rare, talented designer with an endless stamina for feedback and continuous improvement.",
    author: "Kevin Doherty",
    href: "https://www.linkedin.com/in/kpdoh/",
    org: "Alma, August Health",
  },
  {
    text: "He showed up again and again to ensure things were not only done on time, but that they were done well. You'd be lucky to have him on your team.",
    author: "Hans van de Bruggen",
    href: "https://www.linkedin.com/in/verbiate",
    org: "Netflix, Blue Apron",
  },
  {
    text: "Marco has the rare ability to balance strategic business thinking with exceptional craft. A gift for turning ambiguity into clarity. Teams are better, happier, and more effective with Marco on them.",
    author: "EJ Lee",
    href: "https://www.linkedin.com/in/ejeunjonglee/",
  },
];

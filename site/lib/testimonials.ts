// Colleague testimonials — lifted from the retired Marquee component
// (2026-07-15) so the copy survives independent of any one surface.
// Rendered as full paragraphs between Select work and Just for fun.

export type Testimonial = {
  text: string;
  author: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    text: "A rare, talented designer with an endless stamina for feedback and continuous improvement.",
    author: "Kevin Doherty",
  },
  {
    text: "He showed up again and again to ensure things were not only done on time, but that they were done well.",
    author: "Hans van de Bruggen",
  },
  {
    text: "You'd be lucky to have him on your team.",
    author: "Hans van de Bruggen",
  },
  {
    text: "Rare ability to balance strategic business thinking with exceptional craft.",
    author: "EJ Lee",
  },
  {
    text: "A gift for turning ambiguity into clarity.",
    author: "EJ Lee",
  },
  {
    text: "Teams are better, happier, and more effective with Marco on them.",
    author: "EJ Lee",
  },
];

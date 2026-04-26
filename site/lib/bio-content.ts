export type Segment = { text: string; href?: string };
export type Paragraph = Segment[];

export const HERO_NAME = "Marco Sevilla";

export const PARAGRAPHS: Paragraph[] = [
  [
    { text: "Product designer in San Francisco. At" },
    { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" },
    { text: ", I design hospitality platforms serving major brands including Marriott, Wyndham, Best Western, and IHG." },
  ],
  [
    { text: "Before Canary, I helped democratize wine discovery for millions of users at" },
    { text: "Vivino", href: "https://www.vivino.com/" },
    { text: ", made animated video production more accessible at" },
    { text: "Vyond", href: "https://www.vyond.com/" },
    { text: ", and built an all-in-one productivity tool for software engineers at" },
    { text: "General Task", href: "https://www.generaltask.com/" },
    { text: "." },
  ],
  [
    { text: "Growing up in the Bay Area, I spent countless hours on PCs my dad custom-built — creating worlds in simulation games, experimenting with video editing and photo manipulation. Those digital playgrounds sparked my fascination with technology as a creative tool and set me on the path to software design." },
  ],
  [
    { text: "Ultimately, my goal is to build beautifully crafted products that give people a sense of ease and expand what's possible. I care deeply about the details — the micro-interactions, the typography, the moments that make software feel human. I'm drawn to emerging technologies and how they'll reshape human creativity — it's what keeps me experimenting and pushing my craft forward." },
  ],
  [
    { text: "Outside of product work, I'm a" },
    { text: "photographer", href: "https://www.marcosevilla.photo/" },
    { text: ", an occasional web developer, and someone who's always experimenting with new tools and ways of making things. When I'm not designing, you'll find me shooting concerts and street photography, singing, or on the pickleball court." },
  ],
  [
    { text: "I'm always open to connecting — whether it's about a role, a project, or just to talk shop. Reach me at" },
    { text: "marcogsevilla@gmail.com", href: "mailto:marcogsevilla@gmail.com" },
    { text: "or find me on" },
    { text: "LinkedIn", href: "https://www.linkedin.com/in/marcogsevilla/" },
    { text: "." },
  ],
];

export const PROMPTS = [
  "What else have you worked on?",
  "How'd you get into design?",
  "What drives your work?",
  "What do you do outside of work?",
  "How can I reach you?",
];

export const MAX_LEVEL = PARAGRAPHS.length;

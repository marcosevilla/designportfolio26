export type Segment = { text: string; href?: string };
export type Paragraph = Segment[];

// ═══════════════════════════════════════════════════════════════════
// Classic Bio Content (for progressive disclosure mode)
// ═══════════════════════════════════════════════════════════════════

export const PARAGRAPHS: Paragraph[] = [
  [
    { text: "With seven years of experience across consumer and enterprise products, I currently work at the intersection of systems thinking and visual craft. At" },
    { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" },
    { text: ", I design platforms that serve millions of hotel guests and staff globally — building everything from 0→1 products to scalable design systems across Marriott, Wyndham, Best Western, and IHG." },
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
export const HEADING_TEXT = "Hi, I'm Marco. I bring clarity to enterprise complexity. Visual craft is how I get there, paired with rigorous problem-framing and systems thinking that scales.";
export const HEADING_WORDS = HEADING_TEXT.split(" ");

// ═══════════════════════════════════════════════════════════════════
// Dynamic Bio Content (for 2D grid mode)
// X-axis: Casual (0) → Professional (5)
// Y-axis: Concise (0) → Verbose (5)
// ═══════════════════════════════════════════════════════════════════

export type GridPosition = { x: number; y: number };

export type BioVariant = {
  x: number;
  y: number;
  heading: string;
  paragraphs: Paragraph[];
};

// Default grid position (roughly matches current bio tone)
export const DEFAULT_GRID_POSITION: GridPosition = { x: 3, y: 3 };

// Generate all 36 bio variants
// TODO: User should edit these placeholders to craft each variant
export const BIO_VARIANTS: BioVariant[] = [
  // Row 0 (y=0, Most Concise)
  { x: 0, y: 0, heading: "Hey! I'm Marco.", paragraphs: [[{ text: "Product designer in SF. I make software that looks good and works even better." }]] },
  { x: 1, y: 0, heading: "Hi, I'm Marco.", paragraphs: [[{ text: "A product designer based in San Francisco. I focus on creating intuitive, visually polished software experiences." }]] },
  { x: 2, y: 0, heading: "I'm Marco Sevilla.", paragraphs: [[{ text: "Product designer in San Francisco specializing in visual design and design systems. Currently at Canary Technologies." }]] },
  { x: 3, y: 0, heading: "Hi, I'm Marco. I design software in San Francisco.", paragraphs: [[{ text: "Product Designer at Canary Technologies. Seven years of experience building consumer and enterprise products." }]] },
  { x: 4, y: 0, heading: "Marco Sevilla — Product Designer", paragraphs: [[{ text: "Seven years of experience across consumer and enterprise software. Currently leading design initiatives at Canary Technologies." }]] },
  { x: 5, y: 0, heading: "Marco Sevilla, Senior Product Designer", paragraphs: [[{ text: "Specializing in design systems and visual craft. Seven years of experience building scalable platforms for global hospitality brands." }]] },

  // Row 1 (y=1)
  { x: 0, y: 1, heading: "Hey there! I'm Marco.", paragraphs: [
    [{ text: "Product designer who loves making software feel delightful. Currently building cool stuff at" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: "for hotels worldwide." }],
  ] },
  { x: 1, y: 1, heading: "Hi, I'm Marco.", paragraphs: [
    [{ text: "I'm a product designer in SF. I work at" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", where I design platforms used by millions of hotel guests across Marriott, Wyndham, and more." }],
  ] },
  { x: 2, y: 1, heading: "I'm Marco Sevilla.", paragraphs: [
    [{ text: "Product designer in San Francisco. At" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", I design hospitality platforms serving major brands including Marriott, Wyndham, Best Western, and IHG." }],
  ] },
  { x: 3, y: 1, heading: "Hi, I'm Marco. I design software in San Francisco.", paragraphs: [
    [{ text: "Product Designer at" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", building platforms for the hospitality industry. Seven years of experience creating both 0→1 products and scalable design systems." }],
  ] },
  { x: 4, y: 1, heading: "Marco Sevilla — Product Designer", paragraphs: [
    [{ text: "With seven years of experience, I design enterprise platforms at" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: "that serve millions of hotel guests globally across Marriott, Wyndham, Best Western, and IHG properties." }],
  ] },
  { x: 5, y: 1, heading: "Marco Sevilla, Senior Product Designer", paragraphs: [
    [{ text: "At" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", I architect design systems and build scalable platforms serving millions across major hospitality brands including Marriott, Wyndham, Best Western, and IHG." }],
  ] },

  // Row 2 (y=2)
  { x: 0, y: 2, heading: "Hey! I'm Marco.", paragraphs: [
    [{ text: "Product designer in SF who's obsessed with making software feel human. Currently at" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", designing for hotels." }],
    [{ text: "Before this, I worked on some fun stuff —" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: "(wine app!)," }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: "(animation), and" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "(productivity)." }],
  ] },
  { x: 1, y: 2, heading: "Hi, I'm Marco.", paragraphs: [
    [{ text: "I'm a product designer based in San Francisco. At" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", I design hospitality platforms used by millions of guests worldwide." }],
    [{ text: "Previously, I designed experiences at" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: "," }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: ", and" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "." }],
  ] },
  { x: 2, y: 2, heading: "I'm Marco Sevilla.", paragraphs: [
    [{ text: "Product designer in San Francisco with seven years of experience. Currently at" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", designing platforms for global hospitality brands." }],
    [{ text: "My background includes design work at" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: "," }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: ", and" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "— spanning consumer apps to enterprise tools." }],
  ] },
  { x: 3, y: 2, heading: "Hi, I'm Marco. I design software in San Francisco.", paragraphs: [
    [{ text: "With seven years of experience across consumer and enterprise products, I currently work at the intersection of systems thinking and visual craft. At" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", I design platforms serving millions globally." }],
    [{ text: "Previously at" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: "," }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: ", and" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "." }],
  ] },
  { x: 4, y: 2, heading: "Marco Sevilla — Product Designer", paragraphs: [
    [{ text: "Seven years of experience building consumer and enterprise software. At" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", I lead design for hospitality platforms serving Marriott, Wyndham, Best Western, and IHG." }],
    [{ text: "Prior experience includes" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: "(consumer wine discovery)," }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: "(video production tools), and" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "(developer productivity)." }],
  ] },
  { x: 5, y: 2, heading: "Marco Sevilla, Senior Product Designer", paragraphs: [
    [{ text: "Seven years of professional experience across consumer and enterprise software development. Currently at" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", leading design initiatives for hospitality platforms deployed across Marriott, Wyndham, Best Western, and IHG properties globally." }],
    [{ text: "Previous roles include Product Designer positions at" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: "," }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: ", and" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "." }],
  ] },

  // Row 3 (y=3)
  { x: 0, y: 3, heading: "Hey! I'm Marco.", paragraphs: [
    [{ text: "Product designer, visual tinkerer, and someone who genuinely cares about making software feel good to use. Based in SF, working at" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: "." }],
    [{ text: "Before Canary, I got to work on some really fun products:" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: "(helping people find great wine)," }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: "(making animation accessible), and" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "(tools for engineers)." }],
    [{ text: "I grew up in the Bay Area tinkering with computers my dad built — making things in simulation games, editing videos, that kind of stuff. That's what got me into design." }],
  ] },
  { x: 1, y: 3, heading: "Hi, I'm Marco. I design software.", paragraphs: [
    [{ text: "I'm a product designer in San Francisco focused on creating software that's both beautiful and intuitive. Currently designing hospitality platforms at" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: "." }],
    [{ text: "My journey includes helping millions discover wine at" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: ", democratizing video creation at" }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: ", and building productivity tools at" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "." }],
    [{ text: "I got into design through years of tinkering with computers growing up in the Bay Area — simulation games, video editing, photo manipulation. Technology as a creative outlet." }],
  ] },
  { x: 2, y: 3, heading: "I'm Marco Sevilla. I design software in San Francisco.", paragraphs: [
    [{ text: "Product designer with seven years of experience across consumer and enterprise products. At" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", I design platforms serving millions of hotel guests globally." }],
    [{ text: "Before Canary, I helped democratize wine discovery at" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: ", made animated video production more accessible at" }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: ", and built productivity tools at" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "." }],
    [{ text: "My path to design started growing up in the Bay Area, spending hours on custom-built PCs creating worlds in simulation games and experimenting with digital media." }],
  ] },
  { x: 3, y: 3, heading: "Hi, I'm Marco. I design software in San Francisco.", paragraphs: [
    [{ text: "With seven years of experience across consumer and enterprise products, I currently work at the intersection of systems thinking and visual craft. At" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", I design platforms that serve millions of hotel guests and staff globally — building everything from 0→1 products to scalable design systems across Marriott, Wyndham, Best Western, and IHG." }],
    [{ text: "Before Canary, I helped democratize wine discovery for millions of users at" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: ", made animated video production more accessible at" }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: ", and built an all-in-one productivity tool for software engineers at" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "." }],
    [{ text: "Growing up in the Bay Area, I spent countless hours on PCs my dad custom-built — creating worlds in simulation games, experimenting with video editing and photo manipulation. Those digital playgrounds sparked my fascination with technology as a creative tool." }],
  ] },
  { x: 4, y: 3, heading: "Marco Sevilla — Product Designer in San Francisco", paragraphs: [
    [{ text: "Seven years of professional experience building consumer and enterprise software. At" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", I design scalable hospitality platforms deployed across major hotel brands including Marriott, Wyndham, Best Western, and IHG, serving millions of guests globally." }],
    [{ text: "Prior to Canary, I contributed to product design at" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: "(consumer wine discovery platform)," }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: "(enterprise video creation), and" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "(developer productivity tooling)." }],
    [{ text: "My foundation in design stems from early exposure to technology in the San Francisco Bay Area, where I developed skills in digital media creation and software interaction design." }],
  ] },
  { x: 5, y: 3, heading: "Marco Sevilla, Senior Product Designer — San Francisco", paragraphs: [
    [{ text: "Seven years of experience delivering consumer and enterprise software solutions. Currently at" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", where I architect design systems and lead product design initiatives for hospitality platforms serving millions of guests across Marriott, Wyndham, Best Western, and IHG properties worldwide." }],
    [{ text: "Professional background includes Product Designer roles at" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: "(scaled wine discovery to millions of users)," }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: "(enterprise video production platform), and" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "(developer productivity software)." }],
    [{ text: "Educational foundation in design and technology developed through extensive hands-on experience with software development and digital media production in the San Francisco Bay Area." }],
  ] },

  // Row 4 (y=4)
  { x: 0, y: 4, heading: "Hey! I'm Marco.", paragraphs: [
    [{ text: "Product designer who's all about making software feel genuinely delightful. Currently in San Francisco, building hospitality tech at" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: "." }],
    [{ text: "I've been lucky to work on some awesome products:" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: "helped me understand how millions of people discover wine," }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: "taught me about creative tools, and" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "let me geek out on developer productivity." }],
    [{ text: "I grew up as a total computer kid in the Bay Area — my dad built PCs and I'd spend hours making stuff in simulation games, editing videos, playing with Photoshop. That curiosity never left." }],
    [{ text: "What really drives me is the craft — those tiny details like micro-interactions and typography that make software feel human. I'm constantly exploring new tech and how it'll change the way we create." }],
  ] },
  { x: 1, y: 4, heading: "Hi, I'm Marco. I design software.", paragraphs: [
    [{ text: "I'm a product designer in San Francisco who cares deeply about visual craft and user experience. At" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", I design platforms used by millions of hotel guests worldwide." }],
    [{ text: "My design journey includes helping people discover wine at" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: ", making video creation accessible at" }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: ", and building tools for engineers at" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "." }],
    [{ text: "I got into design through tinkering — growing up in the Bay Area on custom PCs, creating in simulation games, experimenting with video and photo editing. Technology as a creative medium clicked for me early." }],
    [{ text: "I'm driven by the details: the micro-interactions, typography, and moments that make software feel human. Emerging technology and its impact on creativity is what keeps me pushing forward." }],
  ] },
  { x: 2, y: 4, heading: "I'm Marco Sevilla. I design software in San Francisco.", paragraphs: [
    [{ text: "Product designer with seven years of experience. At" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", I work on hospitality platforms serving major hotel brands worldwide." }],
    [{ text: "Before Canary, I designed consumer experiences at" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: ", creative tools at" }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: ", and productivity software at" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "— spanning B2C and B2B products." }],
    [{ text: "My path to design started in the Bay Area, tinkering with custom-built PCs, creating in simulation games, and experimenting with digital media. That early fascination with technology as a creative tool shaped my career." }],
    [{ text: "I care deeply about craft — the micro-interactions, typography, and details that make software feel human. I'm drawn to emerging technologies and how they'll reshape creative work." }],
  ] },
  { x: 3, y: 4, heading: "Hi, I'm Marco. I design software in San Francisco.", paragraphs: [
    [{ text: "With seven years of experience across consumer and enterprise products, I currently work at the intersection of systems thinking and visual craft. At" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", I design platforms that serve millions of hotel guests and staff globally — building everything from 0→1 products to scalable design systems across Marriott, Wyndham, Best Western, and IHG." }],
    [{ text: "Before Canary, I helped democratize wine discovery for millions of users at" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: ", made animated video production more accessible at" }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: ", and built an all-in-one productivity tool for software engineers at" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "." }],
    [{ text: "Growing up in the Bay Area, I spent countless hours on PCs my dad custom-built — creating worlds in simulation games, experimenting with video editing and photo manipulation. Those digital playgrounds sparked my fascination with technology as a creative tool and set me on the path to software design." }],
    [{ text: "Ultimately, my goal is to build beautifully crafted products that give people a sense of ease and expand what's possible. I care deeply about the details — the micro-interactions, the typography, the moments that make software feel human." }],
  ] },
  { x: 4, y: 4, heading: "Marco Sevilla — Product Designer in San Francisco", paragraphs: [
    [{ text: "Seven years of professional experience delivering consumer and enterprise software. At" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", I lead design for hospitality platforms serving millions across Marriott, Wyndham, Best Western, and IHG properties worldwide." }],
    [{ text: "Prior experience includes" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: "(consumer wine discovery)," }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: "(enterprise video creation), and" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "(developer productivity). This range spans both B2C and B2B product development." }],
    [{ text: "My foundation in design developed in the San Francisco Bay Area through hands-on exploration of technology — from building custom computers to creating digital media. This early exposure to software as a creative medium informed my approach to product design." }],
    [{ text: "My design philosophy centers on craft and attention to detail. I focus on the micro-interactions, typography, and subtle moments that differentiate exceptional software experiences." }],
  ] },
  { x: 5, y: 4, heading: "Marco Sevilla, Senior Product Designer — San Francisco", paragraphs: [
    [{ text: "Seven years of experience across consumer and enterprise software development. Currently at" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", leading design initiatives for hospitality platforms deployed across major hotel brands including Marriott, Wyndham, Best Western, and IHG, serving millions of guests globally." }],
    [{ text: "Professional experience includes Product Designer positions at" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: "(consumer wine discovery platform serving millions)," }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: "(enterprise video production software), and" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "(developer productivity tooling). This portfolio demonstrates proficiency across B2C and B2B product domains." }],
    [{ text: "Design foundation established through early technical education in the San Francisco Bay Area, including hands-on experience with hardware assembly, software development, and digital media production." }],
    [{ text: "Design philosophy emphasizes attention to craft and detail, with particular focus on micro-interactions, typography, and the subtle experiential elements that distinguish high-quality software products." }],
  ] },

  // Row 5 (y=5, Most Verbose)
  { x: 0, y: 5, heading: "Hey there! I'm Marco.", paragraphs: [
    [{ text: "Product designer who's genuinely obsessed with making software feel delightful. I'm based in San Francisco, currently building hospitality tech at" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: "." }],
    [{ text: "I've had the chance to work on some really fun stuff over the years." }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: "taught me how millions of people discover and fall in love with wine," }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: "showed me how creative tools can empower anyone to make awesome animated videos, and" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "let me geek out on productivity tools for fellow software folks." }],
    [{ text: "I grew up as a total computer kid in the Bay Area. My dad built PCs and I'd spend endless hours creating worlds in simulation games, messing with video editing, playing with Photoshop — basically using technology as my creative playground. That curiosity about making things with computers never really left me." }],
    [{ text: "What gets me excited is the craft of it all — those tiny details like micro-interactions and typography that make software feel human instead of robotic. I'm constantly poking at new tech and thinking about how it'll change the way we create things." }],
    [{ text: "When I'm not designing, you'll find me behind a camera doing" }, { text: "photography", href: "https://www.marcosevilla.photo/" }, { text: "(concerts and street stuff mostly), tinkering with web projects, singing, or getting way too competitive on the pickleball court." }],
  ] },
  { x: 1, y: 5, heading: "Hi, I'm Marco. I design software.", paragraphs: [
    [{ text: "I'm a product designer in San Francisco who cares deeply about visual craft and making software that genuinely delights people. Currently designing hospitality platforms at" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: "." }],
    [{ text: "My design journey has taken me through some great products." }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: "helped me understand how to design for millions of users discovering wine," }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: "taught me about creative tools and making video accessible, and" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "let me focus on productivity for developers." }],
    [{ text: "Design found me early — I grew up in the Bay Area tinkering with custom PCs, creating in simulation games, experimenting with video editing and photo manipulation. Technology as a creative medium just clicked for me." }],
    [{ text: "I'm driven by the details: the micro-interactions, the typography, the small moments that make software feel human. I'm also fascinated by emerging tech and how it'll transform creative work." }],
    [{ text: "Outside work, I'm a" }, { text: "photographer", href: "https://www.marcosevilla.photo/" }, { text: "(concerts and street photography), occasional web developer, and someone who's always experimenting. You might also catch me singing or playing pickleball." }],
  ] },
  { x: 2, y: 5, heading: "I'm Marco Sevilla. I design software in San Francisco.", paragraphs: [
    [{ text: "Product designer with seven years of experience. At" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", I design hospitality platforms serving major hotel brands including Marriott, Wyndham, Best Western, and IHG." }],
    [{ text: "Before Canary, I designed consumer experiences at" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: "(wine discovery for millions), creative tools at" }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: "(animated video production), and productivity software at" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "(developer tools). This spans both B2C and B2B product work." }],
    [{ text: "My path to design started in the Bay Area, growing up on custom-built PCs, creating worlds in simulation games, and experimenting with digital media. That early fascination with technology as a creative tool shaped my career path." }],
    [{ text: "I care deeply about craft — the micro-interactions, typography, and details that make software feel human rather than mechanical. I'm drawn to emerging technologies and how they're reshaping creative work." }],
    [{ text: "Outside of design, I'm a" }, { text: "photographer", href: "https://www.marcosevilla.photo/" }, { text: ", an occasional web developer, and someone always experimenting with new tools. When I step away from screens, you'll find me shooting concerts, singing, or on the pickleball court." }],
  ] },
  { x: 3, y: 5, heading: "Hi, I'm Marco. I design software in San Francisco.", paragraphs: [
    [{ text: "With seven years of experience across consumer and enterprise products, I currently work at the intersection of systems thinking and visual craft. At" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", I design platforms that serve millions of hotel guests and staff globally — building everything from 0→1 products to scalable design systems across Marriott, Wyndham, Best Western, and IHG." }],
    [{ text: "Before Canary, I helped democratize wine discovery for millions of users at" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: ", made animated video production more accessible at" }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: ", and built an all-in-one productivity tool for software engineers at" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "." }],
    [{ text: "Growing up in the Bay Area, I spent countless hours on PCs my dad custom-built — creating worlds in simulation games, experimenting with video editing and photo manipulation. Those digital playgrounds sparked my fascination with technology as a creative tool and set me on the path to software design." }],
    [{ text: "Ultimately, my goal is to build beautifully crafted products that give people a sense of ease and expand what's possible. I care deeply about the details — the micro-interactions, the typography, the moments that make software feel human. I'm drawn to emerging technologies and how they'll reshape human creativity — it's what keeps me experimenting and pushing my craft forward." }],
    [{ text: "Outside of product work, I'm a" }, { text: "photographer", href: "https://www.marcosevilla.photo/" }, { text: ", an occasional web developer, and someone who's always experimenting with new tools and ways of making things. When I'm not designing, you'll find me shooting concerts and street photography, singing, or on the pickleball court." }],
  ] },
  { x: 4, y: 5, heading: "Marco Sevilla — Product Designer in San Francisco", paragraphs: [
    [{ text: "Seven years of professional experience building consumer and enterprise software. At" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", I lead design for hospitality platforms serving millions of guests across Marriott, Wyndham, Best Western, and IHG properties worldwide." }],
    [{ text: "Prior experience includes" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: "(consumer wine discovery platform)," }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: "(enterprise video production tools), and" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "(developer productivity software). This portfolio spans both B2C and B2B product development." }],
    [{ text: "My foundation in design developed in the San Francisco Bay Area through extensive hands-on experience with technology — from hardware assembly to digital media production. This early exposure to software as a creative medium informed my approach to product design." }],
    [{ text: "My design philosophy centers on craft and attention to detail. I focus on micro-interactions, typography, and the subtle moments that differentiate exceptional software. I maintain active interest in emerging technologies and their implications for creative work." }],
    [{ text: "Outside professional work, I pursue" }, { text: "photography", href: "https://www.marcosevilla.photo/" }, { text: "(concert and street photography), web development, and ongoing experimentation with creative tools. Additional interests include music and recreational sports." }],
  ] },
  { x: 5, y: 5, heading: "Marco Sevilla, Senior Product Designer — San Francisco", paragraphs: [
    [{ text: "Seven years of professional experience across consumer and enterprise software development. Currently at" }, { text: "Canary Technologies", href: "https://www.canarytechnologies.com/" }, { text: ", where I architect design systems and lead product design initiatives for hospitality platforms deployed across major hotel brands including Marriott, Wyndham, Best Western, and IHG properties worldwide, serving millions of guests annually." }],
    [{ text: "Professional background includes Product Designer positions at" }, { text: "Vivino", href: "https://www.vivino.com/" }, { text: "(scaled consumer wine discovery platform to millions of active users)," }, { text: "Vyond", href: "https://www.vyond.com/" }, { text: "(enterprise video production software), and" }, { text: "General Task", href: "https://www.generaltask.com/" }, { text: "(developer productivity tooling). This experience demonstrates comprehensive proficiency across both B2C and B2B product domains." }],
    [{ text: "Design and technology foundation established through formative experiences in the San Francisco Bay Area, including hands-on engagement with hardware assembly, software development, and digital media production. This early exposure to technology as a creative medium informed a design philosophy centered on the intersection of technical capability and human experience." }],
    [{ text: "Professional design philosophy emphasizes meticulous attention to craft and detail, with particular focus on micro-interactions, typography, and the experiential elements that distinguish exceptional software products. Maintains active engagement with emerging technologies and their implications for the future of creative work and human-computer interaction." }],
    [{ text: "Professional interests extend to" }, { text: "photography", href: "https://www.marcosevilla.photo/" }, { text: "(specializing in concert and street photography), web development, and continuous exploration of creative tools and methodologies. Additional pursuits include music performance and recreational athletics." }],
  ] },
];

// Helper function to get a variant by grid coordinates
export function getVariant(x: number, y: number): BioVariant | undefined {
  return BIO_VARIANTS.find(v => v.x === x && v.y === y);
}

// Helper function to get the 4 surrounding variants for interpolation
export function getSurroundingVariants(x: number, y: number): {
  topLeft: BioVariant;
  topRight: BioVariant;
  bottomLeft: BioVariant;
  bottomRight: BioVariant;
} | null {
  const floorX = Math.floor(Math.max(0, Math.min(5, x)));
  const floorY = Math.floor(Math.max(0, Math.min(5, y)));
  const ceilX = Math.min(5, floorX + 1);
  const ceilY = Math.min(5, floorY + 1);

  const topLeft = getVariant(floorX, floorY);
  const topRight = getVariant(ceilX, floorY);
  const bottomLeft = getVariant(floorX, ceilY);
  const bottomRight = getVariant(ceilX, ceilY);

  if (!topLeft || !topRight || !bottomLeft || !bottomRight) {
    return null;
  }

  return { topLeft, topRight, bottomLeft, bottomRight };
}

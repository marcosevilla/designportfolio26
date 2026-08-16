# Machine & Page — Aesthetic Direction Brief

**Date:** 2026-08-16
**Status:** Revision A — research gathered, no decisions made yet
**Brief:** Vintage computing crossed with print + editorial sensibility, for the portfolio redesign
**Stated reference:** [makingsoftware.com](https://www.makingsoftware.com/) (Dan Hollick) — as a touchstone to go *beyond*, not copy

Companion artifact: `machine-and-page.html` (self-contained, open in a browser — all ornament rendered live in CSS/Unicode)
Published version: https://claude.ai/code/artifact/3554dbdd-337d-466d-a7b7-39d38d4ab71b

---

## 1.0 — Position

### The thesis

Almost every "retro computing" site simulates a **screen**: scanlines, blinking cursor, phosphor green, typing animation in the hero. It's a costume — once you've seen three, you've seen the mechanism.

The direction here is different, and the difference is the whole competitive advantage: **simulate a document, not a screen.**

- The computing lives in the **information architecture** — numbered sections, revision blocks, spec tables, figure plates, part numbers, monospaced data columns.
- The typography stays **properly editorial** — real text serif, real measure, real baseline discipline, real hierarchy.

That split is why Making Software reads as a book rather than a demo. It's also where to go further: Hollick leaned the type toward the machine (Departure Mono throughout); the opening is to lean it toward the page.

> **One-sentence version:** the machine supplies the structure; print supplies the typography. If a decision is about *how information is organized*, ask a 1978 field service manual. If it's about *how words are set*, ask a type foundry.

### Three dials to set before gathering anything

"Vintage computing" spans four decades of unrelated visual registers. Pick one coordinate on each and hold it.

| Dial | Options |
|---|---|
| **Era** | 1960s mainframe (austere, all-caps, punch cards) → 1970s minicomputer (DEC/Data General, spot color, isometric line art) → 1980s micro (friendly, illustrated, consumer) → 1990s workstation (NeXT/SGI, grayscale chrome, dense manuals) |
| **Register** | Consumer manual (warm, illustrated, second person) · Field/service manual (dense, tabular, procedural) · Specification sheet (austere, numeric, no persuasion) · Sales brochure (photographic, aspirational) |
| **Medium** | Offset w/ one spot color · Mimeograph/ditto (purple, bleeding) · Photocopy/zine (high contrast, degraded) · Dot-matrix on greenbar · Microfiche (negative) · Blueline/diazo print |

**Recommendation (disagree if it doesn't fit):** 1970s minicomputer × field service manual × offset with one spot color. Densest and most typographically confident of the four eras, justifies tables/plates/callouts, and almost nobody is mining it — everyone goes straight for 1980s micro because it's the nostalgic one.

### Candidate names for the direction

- **Field Manual** — plainest, most defensible, instantly explains the numbered sections and spec tables
- **Technical Editorial** — reads as a discipline rather than a costume; good if recruiters should read it as rigor
- **Machine Set** — a typesetting pun (machine composition) that also names the split
- **Documentation-core** — internet-native; works as a tag, weak as positioning

---

## 2.0 — Vocabulary

### 2.1 Movements to borrow from

| Name | What it is | What to take |
|---|---|---|
| **International Typographic Style** | Swiss, 1950s–60s. Müller-Brockmann, Ruder, Hofmann. Objective grid, ragged-right, sans-serif, photography over illustration. | Grid logic; rules as hierarchy. Full scan of *Grid Systems in Graphic Design* is on the Internet Archive. |
| **HfG Ulm** | Ulm School of Design, 1953–68. Max Bill, Otl Aicher. Produced Braun's design language and the 1972 Munich Olympics system. | The idea that a *system* is the deliverable. Closest historical precedent for "design system as visual identity." |
| **Technical illustration** | Exploded isometric views, callout leaders, part numbers, dimension lines, cutaways. | Richest untapped seam. Callout leaders and figure numbers give ornament that *means something*. |
| **Cassette futurism** | Coined term for chunky beige CRT-and-toggle-switch retro-tech sci-fi — *Alien*'s Nostromo, *Severance*, Teenage Engineering. Also "the used future." | Material honesty and worn surfaces. Mostly useful as a **search term**. |
| **Technical Mono / code brutalism** | The current (2025–26) trend name for mono-everywhere, high-contrast, CLI-flavored layouts. Ubiquitous in dev-tool branding. | Know it to differentiate *from* it. This is the crowded lane; the serif body text is the exit. |
| **Neubrutalism** | Coined 2022 by Michał Malewicz. Thick borders, hard shadows, saturated flats, visible gridlines. | Name it to rule it out — it's the trend closest to this one and what sloppy execution gets mistaken for. |
| **Vernacular / found typography** | Unselfconscious design of forms, invoices, timetables, punch cards, receipts. | Most underused source. A 1974 IBM order form has more character than any deliberate "retro" font. |
| **Whole Earth Catalog** | Stewart Brand, 1968–72. "Access to tools." Dense, self-published, typewriter-set, generous. | Density as generosity — permission to put a lot on a page when the content earns it. |
| **Tufte-ism** | Data–ink ratio, small multiples, sparklines, sidenotes instead of footnotes. | Sidenotes and figure discipline. The marginal note is the most manual-feeling device available on the web. |
| **Riso / mimeograph / zine** | Limited spot palettes, misregistration, visible texture, photocopy degradation. | Texture that reads as *process* rather than filter. Misregistration is the cheapest way to make a flat page feel printed. |
| **1-bit / dithered** | Pure B&W via error diffusion. Currently surging as a counter-move to AI's infinite-resolution smoothness. | The photography treatment. See §4.3. |

### 2.2 Print & editorial terms

Use these to specify typography instead of gesturing at it.

`folio` (page number + furniture) · `running head` · `recto/verso` · `measure` (line length; 55–75ch for reading) · `baseline grid` · `modular grid` · `gutter` · `hairline rule` · `kicker/eyebrow` (small label above headline) · `dek/standfirst` (summary below headline) · `lede` · `pull quote` · `drop cap` · `sidenote/marginalia` · `callout` · `plate` (numbered full figure) · `colophon` · `spot color` · `registration mark` · `crop mark` · `knockout/reverse-out` · `overprint` · `misregistration` · `tabular figures` · `oldstyle figures` · `small caps` · `optical margin alignment` · `rag` · `widow/orphan`

### 2.3 Computing & screen terms

`glyph cell` · `character grid` (80×24) · `semigraphics` · `box-drawing characters` (U+2500–257F) · `block elements` (U+2580–259F: ░▒▓█) · `ASCII/ANSI art` · `teletext` (24×40, 8 colors) · `videotex` (Minitel, Prestel) · `phosphor` (P1 green, P3 amber, P4 white) · `raster/scanline` · `bitmap font` · `hinting` · `dot-matrix` · `greenbar` · `tractor feed` · `punch card` (80 columns — origin of the 80-char line) · `mark-sense form` · `OCR-A/OCR-B` · `TUI` · `mode line` · `duospace` · `texture healing`

### 2.4 How to say it out loud

- "A field manual for design work — the structure of technical documentation, set with the typography of a magazine."
- "Vintage computing without the costume. The machine is in the information architecture, not the CSS filters."
- "Monospace does the labeling; a serif does the reading."
- "Everything numbered is actually a sequence. Everything in a table is actually tabular."
- "1970s minicomputer documentation, one spot color, no nostalgia."

---

## 3.0 — Typefaces

Three roles, not two: a **mono** for labels/data/captions/structure, a **text serif** for actual reading, and optionally a **display face** for personality. Most retro-computing sites collapse all three into one pixel font — which is why they run out of range.

### 3.1 Mono workhorses (the spine)

| Face | Foundry | Lic. | Note |
|---|---|---|---|
| [Berkeley Mono (TX-02)](https://usgraphics.com/products/berkeley-mono) | U.S. Graphics Co. | Paid | Most-coveted mono right now. 1970s machine-readable objectivity × humanist warmth. Works on a magazine cover *and* in a terminal — precisely the brief. |
| [MD IO](https://mass-driver.com/typefaces/md-io/) | Mass-Driver | Paid | Rutherford Craze's technical mono. Idiosyncratic, engineered, much less seen than Berkeley. 16 styles. |
| [Söhne Mono](https://klim.co.nz/fonts/soehne-mono/) | Klim | Paid | "Akzidenz-Grotesk framed through the reality of Helvetica." Most editorially neutral mono there is — adds no era. |
| GT America Mono | Grilli Type | Paid | Swiss precision + American grotesque warmth. Good if the Swiss lineage should be explicit. |
| Apercu Mono | Colophon | Paid | Rounded, friendly. Mono texture without coldness. |
| **Fragment Mono** | — | **Free** | Arguably the best free mono for editorial use. **Start here before spending money.** |
| [Geist Mono](https://vercel.com/font) | Vercel | Free | Sharper than JetBrains Mono, but increasingly the default dev-tool look — the crowded choice. |
| [Monaspace](https://github.com/githubnext/monaspace) | GitHub | Free | Five metric-compatible voices + "texture healing." Change tone across a site while every column still aligns. Underrated. |
| Commit Mono | Eigil Nikolajsen | Free | Deliberately neutral, parametrically customizable — you can generate your own cut. |
| [Sligoil](https://velvetyne.fr/fonts/sligoil/) | Velvetyne | Free | Libre mono with genuine character (designed for subtitling). The free pick with the most personality. |

### 3.2 Pixel & bitmap — handle with care

Most over-used family in the aesthetic, and the signature of the reference site. Use as an **accent** (section marker, figure label, logotype), never body text.

| Face | Foundry | Lic. | Note |
|---|---|---|---|
| [Departure Mono](https://departuremono.com/) | Helena Zhang | Free | ⚠️ **This is the Making Software face.** Beautiful (775 glyphs, small caps, oldstyle figures, box-drawing) but using it puts you one step from derivative. Know it, pick something else. |
| [NeueBit + Mondwest](https://pangrampangram.com/products/bitmap-fonts) | Pangram Pangram | Trial/Paid | Brutalist bitmap pack. **Mondwest** (a pixelated *serif*) is the interesting one — bitmap that still reads as print. |
| [Bitcount](https://bitcount.typenetwork.com/) | TYPETR | Paid | Petr van Blokland's variable bitmap system — 300 styles from one file. Most technically ambitious bitmap type in existence. |
| MS Sans / W95FA / Chicago revivals | various | Free | The actual system fonts of the era. More honest than "retro-inspired." |
| monogram | datagoblin | Free | Tiny clean pixel mono (itch.io). Good where 8px must actually be legible. |

### 3.3 Display & character

| Face | Foundry | Lic. | Note |
|---|---|---|---|
| [MD Nichrome](https://mass-driver.com/typefaces/md-nichrome/) | Mass-Driver | Paid | Based on 1970s–80s sci-fi paperback typography. 8 weights, infra-light to ultra-black. **If you want one face carrying all the era-signal so everything else stays neutral, this is it.** |
| [Redaction](https://www.redaction.us/) | Kaphar/Betts/Mickel | **Free** | A serif in five degradation levels, built to simulate print decay — literally a typeface *about* the printing process. Deeply on-theme, almost nobody uses it. |
| OCR-A / OCR-B | — | Free | The genuine machine-readable faces (OCR-B: Frutiger, 1968). Logotype or single label only. |
| Lettra Mono / Model Mono | Pangram Pangram | Paid | Lettra is a monospaced *serif* — typewriter charm, modular spacing. Mono texture without terminal cliché. |
| [Velvetyne catalogue](https://velvetyne.fr/) | Velvetyne | Free | French libre foundry. Terminal Grotesque, Basteleur, Compagnon, Fungal. Open-source — you could fork one and make it yours. |

### 3.4 Editorial serifs — the half that beats everyone else

| Face | Lic. | Note |
|---|---|---|
| **Charter** (Matthew Carter) | Free | Designed 1987 specifically for 300dpi laser printers — a serif engineered *for the machine*. Thematically perfect, ships on macOS. **The artifact page is set in it.** |
| Source Serif (Adobe) | Free | Sturdy, neutral, wide coverage. Safe pick when Charter feels too warm. |
| Newsreader (Production Type) | Free | Variable, built for screen reading, genuinely editorial. Optical size axis is a real advantage at display sizes. |
| Signifier / Editorial New | Paid | High-contrast display serifs. "Fashion magazine meets spec sheet." Large sizes only. |
| Times New Roman | Free | Not a joke. Used deliberately and set well it reads as *found document*. Riskiest and most interesting option. |

### Three pairings worth testing

1. **Berkeley Mono + Charter** — straight down the middle. Technical labels, warm reading text, both engineered for output devices. Hardest to get wrong.
2. **MD Nichrome + Söhne Mono + Source Serif** — era-signal lives entirely in the display face; everything else neutral. Most range, most work to hold together.
3. **Sligoil + Redaction** — all-free, all-strange, all-print. Riskiest and most likely to be genuinely yours.

### Where to find more

[Velvetyne](https://velvetyne.fr/) (libre, experimental) · [UNCUT.wtf](https://uncut.wtf/) (140+ contemporary free) · [Fontshare](https://www.fontshare.com/) (ITF, free commercial) · [Future Fonts](https://www.futurefonts.xyz/) (buy indie early + cheap, updates free) · [Fontstand](https://fontstand.com/) (rent monthly before committing) · [Fonts In Use](https://fontsinuse.com/) · [Wakamai Fondue](https://wakamaifondue.com/) (drop in a font, see every feature)

---

## 4.0 — Ornament & material

Ornament here should be **functional in origin** — borrow devices whose original job you can name. A registration mark exists because plates need aligning. That's the difference between texture and decoration.

### 4.1 Box drawing & semigraphics
Unicode U+2500–257F (light `┌┬┐├┼┤`, heavy `┏━┓`, double `╔═╗`, rounded `╭╮╰╯`) and block elements U+2580–259F (`░▒▓█ ▀▄▌▐`). **Only aligns in a monospaced face, and glyph coverage varies** — Departure Mono, Berkeley Mono and most terminal faces cover the block; many editorial monos don't. Test before committing.

### 4.2 Rules & measurement
A hierarchy of exactly **three rule weights** carries an entire site. More than four and the hierarchy stops reading. Library: hairline (default divider) · heavy (section boundary) · double (document boundary) · dotted (subordinate break) · leader (`····· 4.0`, for contents) · tick rule (measurement/scale).

### 4.3 Dither — which algorithm when

- **Atkinson** — the classic Macintosh algorithm. Blows out highlights, crushes shadows. High-contrast and graphic. *This is the one that looks like 1984.* Best for portraits and hero images.
- **Floyd–Steinberg** — standard error diffusion. Most tonal detail, most faithful. Best when you still need to read the subject.
- **Bayer (ordered)** — fixed threshold matrix, so tileable and stable under animation. **The only one for backgrounds and patterns.**
- **Blue noise** — most organic, least patterned. Texture without an obvious grid.

> **Concert photography note:** Atkinson dithering on the live-music work would be a genuinely distinctive treatment and solves "portfolio images all look like everyone else's portfolio images" in one move.

### 4.4 Press & process marks
Rubber stamps (`REV A`, `DRAFT`, `OBSOLETE`, `FIG. 4-2`, `SHEET 1 OF 3`), registration marks (⊕), crop marks, color bars, sheet ticks. **Highest-risk ornament here** — one is a wink, three is a theme, six is a costume shop. Budget one per page.

### 4.5 Phosphor, used correctly
P1 green (`#33FF33` family), P3 amber (`#FFB000`), P4 white. **The trap is using them as a glow on black** — that's the screen costume. The interesting move is inverting: use amber or phosphor green as a **spot ink on paper**. Same reference, opposite reading, immediately outside the crowded lane.

### 4.6 Icon & pictogram sources
Susan Kare's original Macintosh icon language ([her 1982 sketchbook is in MoMA's collection](https://www.moma.org/collection/works/188382) — graph paper, one square per pixel) · Otl Aicher's Munich 1972 pictograms · ISO/IEC equipment symbols · ANSI hazard triangles · technical drawing symbol sets. All *systems*, which is why they beat any icon library.

---

## 5.0 — Reference sites

### 5.1 Touchstones

| Site | Take | Leave |
|---|---|---|
| [makingsoftware.com](https://www.makingsoftware.com/) | The diagram-as-argument — every illustration does explanatory work no paragraph could. Also the chaptered-manual IA; it's a book and it commits. | The pixel-font-everywhere decision and the palette. This is the layer you replace with real editorial typography. |
| [berkeleygraphics.com](https://berkeleygraphics.com/) | Purest technical-manual aesthetic on the web (U.S. Graphics Co.'s design manual + drawing work). **Closer to the actual target than Making Software is.** | The severity — house style with no warmth; a portfolio needs a person in it. |
| [wiki.xxiivv.com](https://wiki.xxiivv.com/) / [100r.co](https://100r.co/) | Hundred Rabbits. Hand-built, constraint-driven, genuinely idiosyncratic. Best argument that density can be generous. | Total opacity — built for its authors, not visitors. You need an on-ramp they don't. |
| [solar.lowtechmagazine.com](https://solar.lowtechmagazine.com/) | Dithering used for a *reason* (energy budget); default typefaces used deliberately. Proof that constraint reads as conviction. | The literal austerity — it's a manifesto about power consumption, which isn't your argument. |
| [ciechanowski.com](https://ciechanowski.com/) | Gold standard for figures. What "technical editorial" looks like at the highest level. | The scope — months per piece. Steal the figure discipline, not the production model. |
| [teenage.engineering](https://teenage.engineering/) | Product-manual-as-marketing. Exploded views, part callouts, spec tables as the seductive part rather than the fine print. | Hardware context — their aesthetic is downstream of physical objects. |
| [mass-driver.com](https://mass-driver.com/) | A foundry site that reads like an engineering document. **Closest structural model to what you're building.** Look at how specimen tables, spec data and long-form writing coexist. | Not much. |
| [panic.com](https://panic.com/) | Playful retro-computing done commercially and well. Proof the register can be warm. | Color saturation and whimsy — a software company's voice, not a designer's. |

### 5.2 Where to keep finding more
[Are.na](https://www.are.na/) — search `technical manual`, `documentation design`, `terminal`, `spec sheet`. Best signal-to-noise of any visual platform and **the right place to build the moodboard itself.** · [Fonts In Use](https://fontsinuse.com/) — "software" and "manuals" tags · [Httpster](https://httpster.net/), [The Colophon](https://thecolophon.com/), [Lapa Ninja](https://www.lapa.ninja/) — all featured Making Software, so adjacent picks are a good vein · [Typewolf](https://www.typewolf.com/) · [Letterform Archive](https://letterformarchive.org/) — digitized books at extraordinary resolution

### 5.3 Do-not-copy list
Not bad sites — **solved** sites. Resembling these gets read as genre exercise, not point of view:
- Terminal-simulator portfolios where you type `whoami` to see the about page
- CRT scanline and screen-curvature overlays
- Matrix rain, glitch-text hover, typing-cursor heroes
- Neubrutalist template sites (thick black borders, hard offset shadows, one saturated flat)
- Anything where the retro layer is a filter on an otherwise conventional layout

> **The tell they share:** the aesthetic is on the *surface* and the structure underneath is a normal 2020s portfolio. Yours should be the opposite — genuinely document-shaped structure, restrained surface treatment.

---

## 6.0 — Source archives (raw material)

Everything in §5 is secondary — other people's interpretations. These are primary sources, and a moodboard built from primary material will always be more distinctive.

| Archive | What's there |
|---|---|
| **[bitsavers.org](http://bitsavers.org/)** | ⭐ **Start here.** Tens of thousands of scanned DEC, IBM, HP, Data General, Xerox, Burroughs manuals/brochures/spec sheets. Unindexed and ugly to browse, which is exactly why the imagery isn't everywhere yet. `/pdf/dec/` and `/pdf/ibm/` alone will fill a moodboard. |
| [Internet Archive — Computer Magazines](https://archive.org/details/computermagazines) | Full runs of Byte, Creative Computing, Dr. Dobb's. Byte's covers (Robert Tinney illustrations) are a whole aesthetic on their own. |
| [vintageapple.org](https://vintageapple.org/) | Scanned Apple manuals, Macworld, full Byte archive. The 1984 Macintosh manuals are the canonical "friendly consumer manual" register. |
| [guidebookgallery.org](https://guidebookgallery.org/) | Historical GUI screenshots — System 1, Windows 1.0, NeXTSTEP, Amiga Workbench, GEM. Icons at original resolution. |
| [computerhistory.org](https://www.computerhistory.org/) | Hundreds of high-res brochure PDFs. Better production quality than bitsavers, smaller selection. |
| [Internet Archive — Whole Earth Catalog](https://archive.org/details/wholeearth) | Complete scans. Study spreads for how much information a page can hold while staying navigable. |
| [oldcomputerbooks.com](https://www.oldcomputerbooks.com/) | A dealer, so listings are *photographed* — useful for covers, bindings, physical condition, which flat scans lose. |
| [Letterform Archive](https://letterformarchive.org/) | Digitized type specimens at very high resolution. Best possible reference for how a type table should be set. |

---

## 7.0 — Production tools

**Dither & halftone:** [Dither It](https://ditherit.com/) (fast, good defaults) · [MagicPattern Dither Generator](https://www.magicpattern.design/tools/dither-generator) (6 algorithms incl. ASCII) · [Turbo Dither](https://www.turbodither.com/) · Photoshop: `Image → Mode → Grayscale` then `Bitmap` with *Halftone Screen* or *Diffusion Dither* — still the most controllable route for print-quality output.

**ASCII & text art:** [Monodraw](https://monodraw.helftone.com/) (macOS, paid — only serious ASCII diagram editor) · [ASCIIFlow](https://asciiflow.com/) (free, browser, fine for boxes/arrows) · [TAAG](http://patorjk.com/software/taag/) for figlet banners

**CSS techniques:**

| Effect | Technique |
|---|---|
| Pixel scaling | `image-rendering: pixelated` |
| Overprint | `mix-blend-mode: multiply` |
| Misregistration | duplicate text layer, offset 1–2px, `mix-blend-mode: darken` + second hue |
| Photocopy edge | SVG `feTurbulence` + `feDisplacementMap`, low `baseFrequency` |
| Tabular data | `font-variant-numeric: tabular-nums` (non-negotiable in any table of figures) |
| Small caps | `font-variant-caps: small-caps` — only if the face has *true* small caps |
| Headline rag | `text-wrap: balance` on headings, `text-wrap: pretty` on body |
| Dither fields | `radial-gradient` (dot %), `repeating-conic-gradient` (checker), `repeating-linear-gradient` (greenbar/scanline) — see `machine-and-page.html` Plate 03 for working CSS |

**Type evaluation:** [Wakamai Fondue](https://wakamaifondue.com/) (every feature/axis/glyph in a font file — essential before buying) · [Fontstand](https://fontstand.com/) (rent a month, live with it first)

---

## 8.0 — How this goes wrong

1. **The screen costume.** Scanlines, curvature, blinking cursor. Cheapest signal available, reads as cheap. If a treatment could be applied to any website as a filter, it isn't design.
2. **Monospace body text.** Kills reading speed and kills the print half of the brief. Mono for labels/captions/data/structure; a serif carries anything longer than a sentence.
3. **Green on black.** Fully over-owned. If you want phosphor, invert it — amber ink on paper stock.
4. **Numbering that isn't a sequence.** 01/02/03 on three unordered things is decoration pretending to be structure. In a manual aesthetic, structure must be honest or the conceit collapses.
5. **Every ornament at once.** Box drawing *and* dither *and* stamps *and* registration marks *and* greenbar. Pick two devices, use them consistently.
6. **Nostalgia with no system.** Set the three dials and hold them. "Generally old-computery" produces a moodboard nobody can build from.
7. **Being legible as derivative.** Departure Mono + chaptered manual structure + explanatory diagrams = Making Software, and everyone in the target audience has seen it.
8. **Forgetting it's a portfolio.** The work is the hero; the manual is the container. This direction is unusually good at eating its own content.

---

## 9.0 — Next moves

1. **Set the three dials.** One era, one register, one medium — written down in one sentence. Ten minutes, makes every later decision cheap.
2. **Pull twenty spreads from bitsavers.** Not curated, not pretty — twenty screenshots of real manual pages matching the dial settings, dumped into an Are.na channel. **Primary sources only; no other designers' work in this pass.**
3. **Make one spread, not a system.** Pick three typefaces, design a single project page — one case study, real content, real images. If the aesthetic survives one real page it'll survive the site. If not, you've lost a day instead of three weeks.

> **Failure mode to watch:** this direction rewards building a system, and building a system *feels* productive. One finished project page beats a complete design system every time — the system can be reverse-engineered from the page, but the page can't be reverse-engineered from the system.

---

## Open questions for next session

- Which coordinate on each of the three dials? (Nothing decided yet.)
- Budget for paid type — Berkeley Mono is ~$75, MD IO/Nichrome and Klim are more. Fontstand rental is the cheap way to test first.
- Does this direction survive contact with the existing portfolio content, or does it need the case studies rewritten to suit a manual structure?
- Relationship to the existing Figma mirror — does the aesthetic get built in Figma first or in code first?

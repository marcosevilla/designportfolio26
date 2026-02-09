# Case Study Page Design Research
## Visual & UX Design Patterns for Product Design Portfolio Case Studies

*Compiled: February 2, 2026*

---

## Table of Contents

1. [Page Layout & Structure](#1-page-layout--structure)
2. [Visual Hierarchy & Typography](#2-visual-hierarchy--typography)
3. [Image & Media Presentation](#3-image--media-presentation)
4. [Interactive Elements](#4-interactive-elements)
5. [Mobile Responsiveness](#5-mobile-responsiveness)
6. [Hero / Header Patterns](#6-hero--header-patterns)
7. [Navigation Within Case Studies](#7-navigation-within-case-studies)
8. [Specific Examples from Top Designers](#8-specific-examples-from-top-designers)
9. [Common Mistakes & Anti-Patterns](#9-common-mistakes--anti-patterns)
10. [Performance Considerations](#10-performance-considerations)

---

## 1. Page Layout & Structure

### Reading Width & Content Container
- **Optimal line length:** 50-75 characters per line, with **66 characters** being the ideal sweet spot for extended reading (Robert Bringhurst, Baymard Institute).
- **CSS implementation:** Use `max-width: 66ch` or `max-width: 34em` for body text containers. This fixes the measure regardless of text size.
- **WCAG 1.4.8** states lines should be 80 or fewer characters for accessibility.
- Body text containers typically sit at **680-780px max-width** for comfortable reading, while full-bleed imagery breaks out to 100vw.

### Section Spacing & Rhythm
- Use a **consistent vertical spacing system** — e.g., 8px base unit with multipliers (24, 48, 96, 128px between sections).
- Paragraph spacing should be approximately **1.39x the line-height** for clear paragraph delineation.
- Generous white space is the foundation of visual hierarchy in case studies. A "soothing color palette, consistent typography, brief copy, abundant whitespace, and coordinated visuals" create relief for readers.
- Alternate between **contained text sections** and **full-bleed visual sections** to create breathing room and visual variety.

### Layout Patterns
- **Narrow text / wide imagery:** Body text in a centered ~700px column, with images breaking out to ~1200px or full viewport width. This is the dominant pattern among top portfolios.
- **Full-bleed image sections** act as visual "chapter breaks" between text-heavy sections.
- **Two-column layouts** work well for before/after comparisons, side-by-side mockups, or pairing an image with annotation text.
- **Asymmetric grids** (e.g., 60/40 splits) for combining imagery with explanatory captions.

### Content Structure (Visual, Not Written)
A typical visual rhythm for a case study page:
```
[Full-bleed hero image with title overlay]
[Metadata bar: role, timeline, team, tools]
[Brief intro text — narrow column]
[Full-bleed or wide image — final product showcase]
[Section heading + body text — narrow column]
[Medium-width process image with caption]
[Section heading + body text — narrow column]
[Full-bleed comparison or gallery]
[Pull quote or key metric callout — wide, centered]
[Section heading + body text — narrow column]
[Device mockup presentation — contained]
[Results / impact section with metrics]
[Next project link / footer]
```

---

## 2. Visual Hierarchy & Typography

### Font Size Ratios
- **Body text:** 18-22px (18px minimum; many top portfolios use 20-22px for comfortable reading on screens).
- **Headings:** Use a modular scale. Common ratios:
  - H1 (case study title): 48-72px
  - H2 (section headers): 32-40px
  - H3 (sub-sections): 24-28px
  - Captions/metadata: 14-16px
- Limit to **3 distinct type sizes** to maintain a strong hierarchy without overwhelming.

### Line Height
- **Body text:** 1.5-1.6 line-height for long-form reading.
- **Headings:** 1.1-1.35 line-height (tighter for large display text).
- Longer measures need more line-height; shorter measures can tolerate less.

### Typography Patterns
- **Section differentiation:** Use size, weight, and spacing — not just color — to create hierarchy. Test in grayscale to verify hierarchy works without color.
- **Pull quotes / callouts:** Larger font size (28-36px), different weight or style (italic, light weight), generous padding, sometimes with a left border accent or background color.
- **Captions:** Smaller (14-16px), lighter color or reduced opacity, placed directly below images with minimal gap (8-12px).
- **Metadata labels:** Uppercase, small (12-14px), letter-spaced, often in a muted color. Values in regular weight below.
- **Key metrics / impact numbers:** Oversized (48-80px), bold weight, accent color. Often displayed in a grid or row.

### Font Choices
- Most top portfolios use **1-2 font families** — typically a sans-serif for everything (Inter, Graphik, Suisse Intl, Manrope) or a serif/sans-serif pairing for editorial feel.
- Consistency across the entire portfolio site matters more than novelty.

### Responsive Typography
- Use `clamp()` for fluid type scaling: e.g., `font-size: clamp(1.125rem, 1rem + 0.5vw, 1.375rem)`.
- Use relative units (rem/em) throughout so users can scale text to 200% per WCAG.

---

## 3. Image & Media Presentation

### Image Display Patterns
1. **Full-bleed (100vw):** Best for hero images, mood shots, and dramatic visual breaks. Creates cinematic impact.
2. **Wide contained (~1200px):** For primary mockups and key screens. Sits wider than text but within a max container.
3. **Text-width (~700px):** For inline process artifacts, sketches, diagrams. Stays within the reading column.
4. **Side-by-side (50/50 or 60/40):** For before/after comparisons, variant explorations, or pairing image + annotation.

### Device Mockups & Frames
- Use device mockups for **banner images and homepage thumbnails** — fully realistic devices provide context.
- For **inline case study images**, use minimal/flat device frames or browser chrome — the device is just a frame, not the focus.
- Show **4-10 key mockup screens** per case study (per Lead Product Designer Natalia Veretenyk).
- Tools: Rotato (animated 3D mockups), Figma device mockup components, minimal CSS browser frames.

### Image-to-Text Ratio
- Aim for **60-80% text and 20-40% images** as a rough guide.
- Use carousels or slideshows for additional images to keep layout clean.
- Every image needs context — never dump images without captions or surrounding explanation.

### Process Artifacts
- Show the messy middle: sketches, sticky notes, whiteboard photos, wireframes, user flows.
- Present these at **text-width or slightly wider**, with clear captions explaining what's being shown.
- Before/after comparisons work best **side-by-side on desktop**, stacked vertically on mobile, with clear labels.

### Video & Animation
- Short video clips or GIFs for interaction demos, micro-animations, prototype walkthroughs.
- Keep videos short (10-30 seconds), autoplay muted with controls available.
- Embedded Figma prototypes can showcase interactive flows inline.

---

## 4. Interactive Elements

### Scroll-Triggered Animations
- **Scrollytelling** makes case studies feel participatory: text and images reveal progressively as users scroll.
- Elements react to scroll position, revealing content in stages with rich visuals or micro-animations.
- Chrome's scroll-driven animation APIs enable smooth, performant scroll effects directly in CSS.
- Best for **single-theme narratives** with strong visuals and a clear beginning-to-end journey.
- Animation duration: **200-500ms** is ideal. 200-300ms for smaller elements.

### Recommended Interactive Patterns
- **Fade-in on scroll:** Sections and images gently fade/slide in as they enter the viewport. Subtle and widely used.
- **Parallax depth:** Background images moving at different scroll speeds. Use sparingly — can feel dated if overdone.
- **Before/after sliders:** Interactive comparison of old vs new designs. Highly effective for redesign case studies.
- **Embedded prototypes:** Figma embeds, ProtoPie, or recorded prototype videos for demonstrating interactions.
- **Progress bar:** A thin bar at the top of the page showing reading progress (see Navigation section).
- **Expandable sections:** Accordion-style "read more" for detailed process sections, keeping the main flow scannable.

### Accessibility Requirements
- **Always respect `prefers-reduced-motion`** — provide fallbacks for users who disable animations.
- Ensure keyboard navigation works throughout.
- Lazy-load media, compress assets, test on modest devices.
- Never let immersion block content — always provide straightforward paths to the same information.

### Tools for Building Interactive Case Studies
- **Framer:** Drag-and-drop responsive interactive animations, Figma import.
- **Webflow:** Visual website builder with scroll interactions, CMS for case studies.
- **ProtoPie:** Scroll-based animations with parallax and 3D renders.
- **CSS Scroll-driven Animations:** Native browser API, no JavaScript needed.

---

## 5. Mobile Responsiveness

### Layout Adaptations
- Desktop: Content spreads with ample whitespace, side-by-side layouts, large imagery.
- Tablet: Balanced middle ground, may retain some side-by-side patterns.
- Mobile: **Vertically stacked**, compact. Side-by-side images become stacked. Text container becomes near-full-width with padding.

### Image Scaling
- Use `max-width: 100%; height: auto` for all images.
- Serve different image sizes via `srcset` and `<picture>` elements — don't send 1920px desktop images to 360px mobile screens.
- Full-bleed images on desktop can become **edge-to-edge on mobile** (no padding) for maximum impact on small screens.

### Touch Considerations
- Touch targets: minimum **44x44px** for all tappable elements.
- Replace hover states with tap-and-hold or simply remove hover-dependent interactions.
- Navigation links and TOC items need generous tap areas.
- Consider horizontal scrolling carousels for image galleries (with swipe gestures).

### Typography on Mobile
- Body text may need to stay at **16-18px** on mobile (vs 20-22px desktop) to maintain readable line lengths.
- Headings scale down but should still create clear hierarchy.
- Use `clamp()` for smooth fluid scaling between breakpoints.

### Performance on Mobile
- Mobile networks are often slower — optimize images aggressively.
- Reduce or disable heavy scroll animations on mobile for battery and performance.
- Consider reducing the number of images shown on mobile (progressive disclosure).

---

## 6. Hero / Header Patterns

### Dominant Pattern: Full-Bleed Hero with Overlaid Title
The most common and effective pattern for case study pages:
- **Full-bleed hero image** (or solid brand color background) filling the viewport or near-viewport height.
- **Project title** overlaid in large type (48-72px+).
- **Brief one-line description** below the title.
- "Go hard or go home" — show screens of the final design as an appetizer, not everything, just the parts you're most proud of.

### Metadata Display
Immediately below the hero (or integrated into it), display project metadata in a clean grid or inline row:
- **Role:** "Lead Product Designer" / "UX Design, Visual Design, Prototyping"
- **Timeline:** "Jan - Jun 2025" or "12 weeks"
- **Team:** "2 designers, 3 engineers" or list of roles
- **Company/Client:** Name + optional logo
- **Tools:** Figma, Framer, etc.
- **Platform:** iOS, Web, etc.

Style: Labels in uppercase, small (12-14px), letter-spaced, muted. Values below in regular weight.

### TL;DR / Executive Summary
Some designers include a 2-3 sentence summary immediately after metadata, giving busy reviewers the gist before they commit to reading. This is especially valuable given that hiring managers spend ~60 seconds per case study.

### Alternative Hero Patterns
- **Title card with no image:** Clean, typographic-focused hero. Project title very large, metadata below, first image comes after scrolling.
- **Split hero:** Title and metadata on one side, hero mockup on the other.
- **Video hero:** Looping video background showing the product in use.
- **Colored background hero:** Solid or gradient brand color with mockup floating on top.

---

## 7. Navigation Within Case Studies

### Sticky Table of Contents (Sidebar)
- **Best placement: sidebar** — a left or right sidebar column with `position: sticky`, common in documentation-style layouts.
- **NN/g caution:** When placed in the main body of content, sticky TOCs often compete with global navigation and users frequently fail to notice them. A non-sticky TOC in the body can work; a sticky TOC works best in a dedicated sidebar.
- Highlight the current section as the user scrolls (intersection observer pattern).
- CSS-Tricks documents the "sticky TOC with scrolling active states" pattern.

### Progress Indicators
- A **thin progress bar** at the very top of the page (2-4px height), filling left-to-right as the user scrolls. Unobtrusive and informative.
- Some sites use the **cursor itself** as a progress indicator or show percentage complete.
- Documents with TOCs see **27% longer engagement times** and **18% higher CTR** in search (AFFiNE data).

### Section Anchors
- Each major section (Problem, Process, Solution, Results) gets an anchor ID.
- Clicking TOC links smooth-scrolls to the section with a slight offset for sticky headers.

### Next/Previous Project Links
- At the bottom of every case study, include a **prominent "Next Project" link** (and optionally "Previous").
- This is critical for keeping reviewers in your portfolio rather than bouncing.
- Can be a full-width card with the next project's hero image, title, and brief description.

### Other Navigation Elements
- **Back-to-top button:** Appears after scrolling past the fold. Small, fixed in bottom-right corner.
- **Breadcrumbs:** "Home > Work > Project Name" — simple orientation, especially useful if someone lands directly on a case study from a search result or shared link.
- **Estimated reading time:** Displayed near the top. Helps readers decide whether to commit now or bookmark.

---

## 8. Specific Examples from Top Designers

### Rauno Freiberg (rauno.me) — Staff Design Engineer, Vercel
- Previously at The Browser Company (Arc).
- Portfolio is a masterclass in **interaction design and craft**: dynamic backgrounds that respond to mouse movement, unconventional navigation, piano-key click sounds.
- Built with **Next.js, TypeScript, SCSS**, hosted on Vercel.
- Philosophy: "A designer whose medium is code." Works at the intersection of design and engineering.
- Created `cmdk` (millions of weekly downloads) and the course "Devouring Details."
- His site demonstrates that for design engineering roles, **the portfolio itself is the case study**.

### Karolis Kosas (karoliskosas.com) — Product Designer, Stripe
- Handpicked by Nice Portfolio as one of "the nicest design portfolios on the web."
- Clean, minimal design with strong case study structure.
- Case studies (e.g., /cinemaclub/) demonstrate "strong processes and communicate the value behind the design."
- Shows deep understanding of user mental models.

### Tobias van Schneider (vanschneider.com) — Co-founder, Semplice
- Created Semplice, a portfolio system built specifically for case studies.
- His writing on case study design is canonical: "A visual guide to writing portfolio case studies."
- Key principles:
  - Senior designers tell stories, not essays. Say in 500 words what others need 1,000 for.
  - Show personality, not just process.
  - First 2-3 seconds on your page determine if a recruiter stays or leaves.
  - Find the balance between image dumps (no context) and text walls (no visuals).

### Stripe Designer Portfolios
- Stripe designers are known for clean, minimal, detail-obsessed portfolios.
- Designer Fund's "Embedding Design into the Fiber of Fintech" explores Stripe's design culture.
- The design quality bar at Stripe sets expectations for portfolio craft.

### Notable Portfolio Resources
- **[Pafolios](https://pafolios.com/)** — 685+ curated portfolio examples.
- **[Bestfolios](https://bestfolios.medium.com/)** — "7 Inspiring Case Studies That Every Designer Should Read."
- **[DesignerUp](https://designerup.co/blog/10-exceptional-product-design-portfolios-with-case-study-breakdowns/)** — 10 exceptional portfolios with breakdowns.
- **[SiteBuilderReport](https://www.sitebuilderreport.com/inspiration/ux-portfolios)** — 30+ inspiring UX portfolio examples.

### Platform Choices
- **Custom-built (Next.js, Astro, etc.):** Maximum control, best for design engineers. Rauno, many Vercel/Linear designers.
- **Framer:** Expressive interactions, Figma import, good for visual designers who want polish without code.
- **Webflow:** Visual builder with CMS, good for managing multiple case studies.
- **Semplice (WordPress):** Purpose-built for portfolio case studies.
- **Notion:** Free, easy, but generic look. Good for process documentation, less impressive for visual craft.

---

## 9. Common Mistakes & Anti-Patterns

### Visual & UX Mistakes

1. **Walls of text with no visual breaks.** Long paragraphs with no images, pull quotes, or spacing variations. Readers lose interest immediately.

2. **Tiny, low-quality images.** Screenshots that are too small to read or poorly compressed. If someone can't see the detail in your UI work, the case study fails its purpose.

3. **Image dumps with no context.** Pages of beautiful mockups with zero explanation. Without captions and surrounding narrative, images are meaningless.

4. **Poor visual design of the portfolio itself.** "If you can't make your own portfolio look good, hiring managers will rightly think twice." Senior designers spend at least 50% of their time on presentation.

5. **Inconsistent styling.** Different spacing, font sizes, or color treatments across case studies. The portfolio should feel like a cohesive product.

6. **No visual hierarchy.** All text the same size and weight. No differentiation between sections. Readers can't scan.

7. **Slow-loading pages.** Too many high-res images, heavy animations, unoptimized assets. Hiring managers won't wait.

8. **Broken links and dead prototypes.** Links to prototypes that no longer work, or old Invision/Marvel URLs. Use screenshots instead of relying on external tools.

9. **Missing next/previous navigation.** Case study ends with no way to continue browsing. Reviewers bounce instead of seeing more work.

10. **Not mobile-optimized.** Many reviewers first encounter your portfolio on their phone (from a message, email, or social media link). If it doesn't work on mobile, you've lost them.

### Content Mistakes (Brief, for Context)
- Skipping straight to final designs without showing process.
- Not showing results or impact.
- Too many case studies (diluting quality) or too few.
- Typos and formatting errors ("unforgivable" per hiring managers).
- Generic language ("crafting solutions through strategic storytelling").

### Key Stat
**Hiring managers spend ~60 seconds per case study.** Your visual design needs to support rapid scanning. The first 2-3 seconds determine if they stay.

---

## 10. Performance Considerations

### Image Optimization
- **Modern formats:** Use WebP or AVIF. Significant file size reduction over JPEG/PNG with equal or better quality.
- **Responsive images:** Use `srcset` and `<picture>` to serve appropriate sizes per device. Never send 1920px images to mobile.
- **Compression:** Use tools like Squoosh, Sharp, ImageOptim, or image CDNs (imgix, Cloudinary) for automatic optimization.
- **Lossless for portfolios:** For design work where detail matters, use lossless compression to preserve fine details while reducing file size.

### Lazy Loading
- Use `loading="lazy"` on all images **below the fold** — zero-JavaScript, high-impact.
- **Never lazy-load the hero image (LCP element).** This is the single biggest performance mistake. The hero should load eagerly and ideally be preloaded.
- Preload hero images with `<link rel="preload" as="image">` for faster LCP.

### Preventing Layout Shift (CLS)
- **Always set `width` and `height` attributes** on `<img>` elements (or use `aspect-ratio` in CSS).
- Use **low-quality image placeholders (LQIP)** or BlurHash while images load.
- Skeleton states for sections that load dynamically.

### Page Weight Budget
- Aim for **< 3MB total page weight** for a case study page (before lazy loading kicks in).
- Above-the-fold content should be under **1MB**.
- Use a CDN for global delivery — serves images from the closest server to the user.

### Animation Performance
- Prefer **CSS animations over JavaScript** where possible.
- Use CSS `scroll-driven animations` API for scroll effects — fewer main thread resources.
- Avoid layout-triggering animations (transform and opacity are cheapest).
- Disable or reduce animations on mobile and for `prefers-reduced-motion`.

### Testing
- Test on real devices, especially mid-range Android phones.
- Use Lighthouse, WebPageTest, or PageSpeed Insights to audit.
- Check Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms.

---

## Actionable Recommendations Summary

### Must-Haves
1. **Narrow text column (~66ch) with breakout images.** The single most impactful layout decision.
2. **Full-bleed hero** with project title, one-liner, and mockup preview.
3. **Metadata block** (role, timeline, team, tools) right after the hero.
4. **Consistent vertical rhythm** — pick a spacing scale and stick to it.
5. **Large, high-quality images** with captions. Use device mockups for context.
6. **Mobile-optimized** — test on actual phones.
7. **Next project link** at the bottom of every case study.
8. **Fast loading** — optimize images, lazy load below the fold, preload hero.
9. **Clear visual hierarchy** — test in grayscale.
10. **Scannable layout** — someone should get the gist by scrolling quickly.

### Nice-to-Haves
1. Sticky sidebar TOC with active state highlighting.
2. Reading progress bar at the top.
3. Subtle scroll-triggered fade-in animations (respect reduced motion).
4. Before/after interactive sliders for redesign work.
5. Embedded Figma prototypes or short video demos.
6. Estimated reading time.
7. BlurHash placeholders for images while loading.
8. Breadcrumb navigation.

### Avoid
1. Heavy parallax or gratuitous animation.
2. Lazy-loading the hero image.
3. Images without captions or context.
4. More than 2 font families.
5. Line lengths over 80 characters.
6. Links to external prototypes that may break.
7. Identical visual treatment for all content (no hierarchy).
8. Page weight over 5MB.

---

## Sources

### Articles & Guides
- [Tobias van Schneider — A Visual Guide to Writing Portfolio Case Studies](https://vanschneider.medium.com/a-visual-guide-to-writing-portfolio-case-studies-ad5dbc513f37)
- [DesignerUp — 10 Exceptional Product Design Portfolios](https://designerup.co/blog/10-exceptional-product-design-portfolios-with-case-study-breakdowns/)
- [UXfolio — Ultimate UX Case Study Template (2026)](https://blog.uxfol.io/ux-case-study-template/)
- [UXfolio — UX Portfolio Design Tips](https://blog.uxfol.io/ux-portfolio-design-tips/)
- [IxDF — How to Create Visuals for Your UX Case Study](https://www.interaction-design.org/literature/article/how-to-create-visuals-for-your-ux-case-study)
- [IxDF — 7 Design Portfolio Mistakes Costing You Jobs](https://www.interaction-design.org/literature/article/avoid-design-portfolio-mistakes-costing-jobs)
- [UX Playbook — 11 Common Portfolio Mistakes](https://uxplaybook.org/articles/11-common-ux-portfolio-mistakes-and-solutions)
- [Learn UI Design — 4 Most Common Portfolio Mistakes](https://www.learnui.design/blog/portfolio-mistakes.html)
- [NN/g — Table of Contents Design Guide](https://www.nngroup.com/articles/table-of-contents/)
- [NN/g — Good Visual Design](https://www.nngroup.com/articles/good-visual-design/)
- [Smashing Magazine — Typographic Design Patterns](https://www.smashingmagazine.com/2013/05/typographic-design-patterns-practices-case-study-2013/)
- [Smashing Magazine — The Humble img Element and Core Web Vitals](https://www.smashingmagazine.com/2021/04/humble-img-element-core-web-vitals/)
- [Baymard Institute — Optimal Line Length for Readability](https://baymard.com/blog/line-length-readability)
- [web.dev — Performance Effects of Too Much Lazy Loading](https://web.dev/articles/lcp-lazy-loading)
- [CSS-Tricks — Sticky TOC with Scrolling Active States](https://css-tricks.com/sticky-table-of-contents-with-scrolling-active-states/)
- [Framer — 11 Animation Techniques for UX](https://www.framer.com/blog/website-animation-examples/)
- [Chrome Developers — Scroll-Driven Animations Performance](https://developer.chrome.com/blog/scroll-animation-performance-case-study)
- [Imarc — A Case Study in Readable Typography](https://www.imarc.com/blog/case-study-in-readable-typography)

### Portfolio Examples & Inspiration
- [Rauno Freiberg (Vercel)](https://rauno.me)
- [Karolis Kosas (Stripe)](https://karoliskosas.com)
- [Tobias van Schneider / Semplice](https://vanschneider.com)
- [Pafolios — 685+ Portfolio Examples](https://pafolios.com/)
- [SiteBuilderReport — 30+ UX Portfolios](https://www.sitebuilderreport.com/inspiration/ux-portfolios)
- [Bestfolios — 7 Inspiring Case Studies](https://bestfolios.medium.com/7-inspiring-case-studies-that-every-designer-should-read-6dd53a75bd0c)
- [Toptal — Best UX Designer Portfolios](https://www.toptal.com/designers/ux/ux-designer-portfolios)
- [Designlab — 10 UX/UI Portfolio Examples](https://designlab.com/blog/10-ux-ui-design-portfolios)

### Tools & Templates
- [Figma — Case Study Templates](https://www.figma.com/templates/case-study/)
- [Figma — iPhone Mockups for Case Study](https://www.figma.com/community/file/1262141818062902499)
- [Figma — Portfolio Hero Sections](https://www.figma.com/community/file/1431573260502833392)
- [Dribbble — Product Design Case Study Template](https://dribbble.com/resources/product-design-case-study)
- [Rotato — Portfolio Mockup Animations](https://rotato.app/for/portfolio)
- [Supercharge Design — No-Code Portfolio Websites (2026)](https://supercharge.design/blog/no-code-portfolio-websites-2025)

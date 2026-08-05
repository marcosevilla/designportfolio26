/**
 * Company → inline logo mark for the case-study metadata row.
 *
 * Only Canary has a mark today (public/images/inline-chips/ also holds
 * vivino.svg and vyond.svg, both unreferenced — leave them). Companies
 * absent from this map render a monogram instead — that is the intended
 * fallback, not a gap to paper over with a placeholder image.
 *
 * This file stays JSX-free and React-free on purpose: scripts/test-study-meta.ts
 * imports it directly via ts-node/tsx without a React runtime. The actual
 * mark artwork lives in components/case-study/CanaryMark.tsx (a client
 * component, so its currentColor strokes can follow the row's text color
 * across themes) — StudyMetaRow picks the mark component itself once it
 * knows a company has one.
 */
const MARKS: Record<string, true> = {
  Canary: true,
};

export function hasMark(company: string): boolean {
  return MARKS[company] === true;
}

/**
 * Company → logo mark for the case-study metadata row.
 *
 * Only Canary has an SVG today (public/images/inline-chips/ also holds
 * vivino.svg and vyond.svg, both unreferenced). Companies absent from this
 * map render a monogram instead — that is the intended fallback, not a gap
 * to paper over with a placeholder image.
 */
const LOGOS: Record<string, string> = {
  Canary: "/images/inline-chips/canary.svg",
};

export function logoFor(company: string): string | null {
  return LOGOS[company] ?? null;
}

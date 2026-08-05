/**
 * Canary's inline mark for the case-study metadata row.
 *
 * Geometry copied verbatim from public/images/inline-chips/canary.svg
 * (viewBox, every path's `d`, both stroke widths, stroke-miterlimit,
 * fill: none, and stroke-linecap: round on the paths that had it). The
 * only thing that changed is the stroke color: the source file hardcodes
 * `stroke: #fff`, which is invisible on the light theme — an <img> can't
 * recolor an external SVG. Using `currentColor` here instead lets the mark
 * inherit whatever text color its container sets, so it stays visible
 * across the light theme, the dark theme, and all 9 accent themes.
 */
export default function CanaryMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 531.45 531.45" className={className} aria-hidden="true">
      <circle
        cx="265.73"
        cy="265.73"
        r="259.9"
        fill="none"
        stroke="currentColor"
        strokeWidth={11.64}
        strokeMiterlimit={10}
      />
      <g fill="none" stroke="currentColor" strokeWidth={18.64} strokeMiterlimit={10} strokeLinecap="round">
        <path d="m254.95,419.24s-15.27,47.16-14.37,60.63c0,0-17.52-143.72-179.65-130.92,0,0,38.4,128.22,201.88,132.94,163.7,4.72,210.86-132.49,210.86-132.49,0,0-68.72-9.66-119.69,28.74" />
        <path d="m187.13,468.42s4.04-27.17,10.33-41.54" />
        <path d="m310.86,425.31s-14.37,30.32-14.37,54.34c0,0-11.9-63.78-47.16-107.79" />
        <path d="m216.55,375.01s19.09-30.32,35.03-46.26" />
        <path d="m285.26,294.39s85.33-67.14,178.08-53.45" />
        <path d="m346.79,468.42s-3.14-40.65-33.46-98.13" />
        <path d="m282.12,374.33s60.63-90.27,191.55-77.47" />
        <path d="m283.69,329.65s-70.29-94.09-209.96-89.38" />
        <path d="m210.26,336.83s-64.67-50.98-152.48-39.07" />
      </g>
    </svg>
  );
}

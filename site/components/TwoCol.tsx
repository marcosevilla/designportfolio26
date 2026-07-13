interface TwoColProps {
  children: React.ReactNode;
  className?: string;
}

// Single-column since the 2026-07 case-study redesign: Left (prose) and
// Right (media) now stack in flow, matching the site-wide 600px column.
// The compound API is kept so existing call sites don't need rewrites.
function TwoColRoot({ children, className }: TwoColProps) {
  return <div className={`flex flex-col gap-6 ${className || ""}`}>{children}</div>;
}

function TwoColLeft({ children, className }: TwoColProps) {
  return <div className={className}>{children}</div>;
}

function TwoColRight({ children, className }: TwoColProps) {
  return <div className={className}>{children}</div>;
}

const TwoCol = Object.assign(TwoColRoot, {
  Left: TwoColLeft,
  Right: TwoColRight,
});

export default TwoCol;

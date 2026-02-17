interface TwoColProps {
  children: React.ReactNode;
  className?: string;
}

function TwoColRoot({ children, className }: TwoColProps) {
  return (
    <div className={`lg:grid lg:grid-cols-2 lg:gap-x-10 ${className || ""}`}>
      {children}
    </div>
  );
}

function TwoColLeft({ children, className }: TwoColProps) {
  return <div className={`lg:col-span-1 ${className || ""}`}>{children}</div>;
}

function TwoColRight({ children, className }: TwoColProps) {
  return <div className={`lg:col-span-1 ${className || ""}`}>{children}</div>;
}

const TwoCol = Object.assign(TwoColRoot, {
  Left: TwoColLeft,
  Right: TwoColRight,
});

export default TwoCol;

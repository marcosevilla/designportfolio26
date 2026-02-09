import { typescale } from "@/lib/typography";

export default function PullQuote({
  quote,
  attribution,
}: {
  quote: string;
  attribution?: string;
}) {
  return (
    <blockquote className="my-10 pl-6 border-l-[3px] border-[var(--color-accent)]">
      <p className="text-[var(--color-fg)] italic" style={typescale.pullQuote}>
        &ldquo;{quote}&rdquo;
      </p>
      {attribution && (
        <cite className="block mt-3 text-[14px] text-[var(--color-fg-tertiary)] not-italic">
          — {attribution}
        </cite>
      )}
    </blockquote>
  );
}

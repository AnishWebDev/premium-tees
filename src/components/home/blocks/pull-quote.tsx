type PullQuoteProps = {
  quote: string;
  attribution?: string;
  eyebrow?: string;
};

/** Large editorial quote band. */
export function PullQuote({ quote, attribution, eyebrow }: PullQuoteProps) {
  if (!quote?.trim()) return null;

  return (
    <section
      className="border-b border-[var(--border)]"
      aria-label="Featured quote"
    >
      <div className="container-tight py-16 sm:py-20">
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
            {eyebrow}
          </p>
        ) : null}
        <blockquote className="font-display mt-4 max-w-4xl text-3xl font-semibold leading-snug tracking-tight text-[var(--foreground)] sm:text-5xl">
          “{quote}”
        </blockquote>
        {attribution ? (
          <footer className="mt-6 text-sm text-[var(--muted-foreground)]">
            — {attribution}
          </footer>
        ) : null}
      </div>
    </section>
  );
}

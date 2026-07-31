type Pillar = {
  title: string;
  body: string;
};

type ValuePillarsProps = {
  pillars: Pillar[];
};

/** Clean merchandising pillars — no icons, no cards. */
export function ValuePillars({ pillars }: ValuePillarsProps) {
  if (pillars.length === 0) return null;

  return (
    <section
      className="border-b border-[var(--border)] bg-[var(--background)]"
      aria-labelledby="value-pillars-heading"
    >
      <h2 id="value-pillars-heading" className="sr-only">
        What we stand for
      </h2>
      <div className="container-tight grid gap-10 py-14 sm:grid-cols-3 sm:gap-8 sm:py-16">
        {pillars.map((pillar) => (
          <div key={pillar.title}>
            <h3 className="font-display text-lg font-semibold tracking-tight text-[var(--foreground)]">
              {pillar.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {pillar.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

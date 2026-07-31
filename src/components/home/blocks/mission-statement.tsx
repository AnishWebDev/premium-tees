import Link from "next/link";

type MissionStatementProps = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
};

/** Plain-text brand mission — no imagery. */
export function MissionStatement({
  eyebrow,
  title,
  body,
  ctaLabel,
  ctaHref,
}: MissionStatementProps) {
  return (
    <section
      className="border-y border-[var(--border)] bg-[var(--muted)]"
      aria-labelledby="mission-heading"
    >
      <div className="container-tight max-w-3xl py-16 text-center sm:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
          {eyebrow}
        </p>
        <h2
          id="mission-heading"
          className="font-display mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl"
        >
          {title}
        </h2>
        <p className="mt-5 text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg">
          {body}
        </p>
        <Link href={ctaHref} className="theme-link mt-8 inline-block text-sm">
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}

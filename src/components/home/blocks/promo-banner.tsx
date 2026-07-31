import Link from "next/link";

type PromoBannerProps = {
  eyebrow?: string;
  title: string;
  href: string;
  ctaLabel?: string;
};

/** High-contrast commerce promo strip. */
export function PromoBanner({
  eyebrow,
  title,
  href,
  ctaLabel = "Shop now",
}: PromoBannerProps) {
  return (
    <aside
      className="bg-[var(--foreground)] text-[var(--background)]"
      aria-label="Promotion"
    >
      <div className="container-tight flex flex-col items-start justify-between gap-4 py-5 sm:flex-row sm:items-center">
        <div>
          {eyebrow ? (
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--background)]/80">
              {eyebrow}
            </p>
          ) : null}
          <p className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </p>
        </div>
        <Link
          href={href}
          className="text-sm font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--background)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--foreground)]"
        >
          {ctaLabel}
        </Link>
      </div>
    </aside>
  );
}

import Link from "next/link";
import Image from "next/image";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";

export type TrailHeroProps = {
  eyebrow?: string;
  brand?: string;
  headline: string;
  subheadline?: string;
  imageUrl: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** e.g. "4.8 / 5 · 4,000+ customer reviews" */
  trustLine?: string;
  trustHref?: string;
  trustLinkLabel?: string;
};

/** Sloth Hiking Club–style outdoor hero: big type, warm copy, social proof. */
export function TrailHero({
  eyebrow,
  brand,
  headline,
  subheadline,
  imageUrl,
  ctaLabel = "Shop tees",
  ctaHref = "/shop",
  trustLine,
  trustHref,
  trustLinkLabel = "See who’s wearing us",
}: TrailHeroProps) {
  const lines = headline.split("\n").filter(Boolean);

  return (
    <section
      className="border-b border-[var(--border)] bg-[var(--background)]"
      aria-labelledby="trail-hero-heading"
    >
      <div className="container-tight grid items-center gap-10 py-10 lg:grid-cols-2 lg:gap-14 lg:py-14">
        <div className="order-2 lg:order-1">
          {(eyebrow || brand) && (
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
              {eyebrow || brand}
            </p>
          )}
          <h1
            id="trail-hero-heading"
            className="font-display mt-3 text-4xl font-semibold leading-[1.02] tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl"
          >
            {lines.map((line, i) => (
              <span key={i} className={i > 0 ? "block" : undefined}>
                {line}
              </span>
            ))}
          </h1>
          {subheadline ? (
            <p className="mt-5 max-w-md whitespace-pre-line text-base leading-relaxed text-[var(--muted-foreground)]">
              {subheadline}
            </p>
          ) : null}
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          </div>
          {trustLine ? (
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-6">
              <StarRating rating={5} size="sm" />
              <p className="text-sm text-[var(--muted-foreground)]">{trustLine}</p>
              {trustHref ? (
                <Link href={trustHref} className="theme-link text-sm font-medium">
                  {trustLinkLabel}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="relative order-1 aspect-[5/4] overflow-hidden rounded-2xl bg-[var(--muted)] sm:aspect-[4/3] lg:order-2 lg:aspect-[4/5]">
          <Image
            src={imageUrl}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

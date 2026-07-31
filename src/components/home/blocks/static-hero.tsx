import Link from "next/link";
import Image from "next/image";
import type { HeroData } from "@/lib/site-content";
import { Button } from "@/components/ui/button";

type StaticHeroProps = {
  content: HeroData;
};

/** Everlane-style: short static image, calm copy, no parallax/video. */
export function StaticHero({ content }: StaticHeroProps) {
  return (
    <section
      className="border-b border-[var(--border)] bg-[var(--background)]"
      aria-labelledby="static-hero-heading"
    >
      <div className="container-tight grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <div className="order-2 lg:order-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
            {content.brand}
          </p>
          <h1
            id="static-hero-heading"
            className="font-display mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl"
          >
            {content.headline}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--muted-foreground)]">
            {content.subheadline}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href={content.primaryCtaHref}>{content.primaryCtaLabel}</Link>
            </Button>
            {content.secondaryCtaLabel ? (
              <Button size="lg" variant="outline" asChild>
                <Link href={content.secondaryCtaHref}>
                  {content.secondaryCtaLabel}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
        <div className="relative order-1 aspect-[4/5] overflow-hidden bg-[var(--muted)] sm:aspect-[5/4] lg:order-2 lg:aspect-[4/5]">
          <Image
            src={content.imageUrl}
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

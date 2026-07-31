import Link from "next/link";
import type { HeroData, SiteData } from "@/lib/site-content";
import { Button } from "@/components/ui/button";

type EditorialMastheadProps = {
  site: SiteData;
  hero: HeroData;
};

/** SSENSE-style: type-first masthead, no hero media. */
export function EditorialMasthead({ site, hero }: EditorialMastheadProps) {
  return (
    <section
      className="border-b border-[var(--foreground)] bg-[var(--background)]"
      aria-labelledby="editorial-masthead-heading"
    >
      <div className="container-tight py-16 sm:py-24 lg:py-28">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--border)] pb-6">
          <p className="font-display text-sm uppercase tracking-[0.28em] text-[var(--foreground)]">
            {site.name}
          </p>
          <p className="max-w-sm text-right text-xs leading-relaxed text-[var(--muted-foreground)]">
            {site.description}
          </p>
        </div>
        <h1
          id="editorial-masthead-heading"
          className="font-display mt-10 max-w-5xl text-5xl font-semibold leading-[0.95] tracking-tight text-[var(--foreground)] sm:text-7xl lg:text-8xl"
        >
          {hero.headline}
        </h1>
        <div className="mt-10 flex flex-col gap-8 border-t border-[var(--border)] pt-8 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg">
            {hero.subheadline}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href={hero.primaryCtaHref}>{hero.primaryCtaLabel}</Link>
            </Button>
            {hero.secondaryCtaLabel ? (
              <Button size="lg" variant="ghost" asChild>
                <Link href={hero.secondaryCtaHref}>{hero.secondaryCtaLabel}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

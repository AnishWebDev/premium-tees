import { StaticHero } from "@/components/home/blocks/static-hero";
import { ValuePillars } from "@/components/home/blocks/value-pillars";
import { MissionStatement } from "@/components/home/blocks/mission-statement";
import { InlineNewsletter } from "@/components/home/blocks/inline-newsletter";
import { ContentAccordion } from "@/components/home/blocks/content-accordion";
import { ProductCard } from "@/components/product/product-card";
import { Testimonials } from "@/components/home/testimonials";
import type { HomeTemplateProps } from "@/components/home/templates/types";
import Link from "next/link";

/**
 * Everlane-style clarity.
 * Split static hero, pillars, tight 4-up grid, text categories, mission, reviews.
 * No marquee, parallax, carousel, or horizontal scroll.
 */
export function SimpleHome({
  content,
  featured,
  categories,
}: HomeTemplateProps) {
  const products = featured.slice(0, 4);

  const pillars = content.about.values.slice(0, 3).map((v) => ({
    title: v.title,
    body: v.body,
  }));

  return (
    <>
      <StaticHero content={content.hero} />
      <ValuePillars pillars={pillars} />

      {products.length > 0 && (
        <section className="section-padding">
          <div className="container-tight">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
                  {content.home.essentials.title}
                </h2>
                <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)]">
                  {content.home.essentials.subtitle}
                </p>
              </div>
              <Link href="/shop" className="theme-link text-sm">
                Shop all
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
              {products.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={i < 2}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="border-t border-[var(--border)]">
          <div className="container-tight py-12 sm:py-16">
            <h2 className="font-display text-xl font-semibold tracking-tight text-[var(--foreground)]">
              {content.home.categories.title}
            </h2>
            <ul className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/shop?category=${category.slug}`}
                    className="flex items-center justify-between gap-4 py-4 text-[var(--foreground)] transition-opacity hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
                  >
                    <span className="font-display text-lg sm:text-xl">
                      {category.name}
                    </span>
                    <span className="text-sm text-[var(--muted-foreground)]">
                      Shop →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <MissionStatement
        eyebrow={content.home.story.eyebrow}
        title={content.home.story.title}
        body={content.home.story.body}
        ctaLabel={content.home.story.ctaLabel}
        ctaHref={content.home.story.ctaHref}
      />

      <Testimonials content={content.testimonials} />
      <ContentAccordion
        title={content.faq.title}
        subtitle={content.faq.subtitle}
        items={content.faq.items.slice(0, 5)}
      />
      <InlineNewsletter content={content.newsletter} variant="light" />
    </>
  );
}

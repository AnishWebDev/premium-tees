import { MediaHero } from "@/components/home/blocks/media-hero";
import { PromoBanner } from "@/components/home/blocks/promo-banner";
import { CategoryPills } from "@/components/home/blocks/category-pills";
import { ProductShelf } from "@/components/home/blocks/product-shelf";
import { InlineNewsletter } from "@/components/home/blocks/inline-newsletter";
import { ContentAccordion } from "@/components/home/blocks/content-accordion";
import { CategoriesSection } from "@/components/home/categories-section";
import { InstagramGallery } from "@/components/home/instagram-gallery";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/shared/section-heading";
import type { HomeTemplateProps } from "@/components/home/templates/types";
import Link from "next/link";

/**
 * Nike-style shop density.
 * Media hero, promo, category pills, multiple shelves/grids, social + newsletter.
 * Most product content of any template.
 */
export function CommerceHome({
  content,
  featured,
  bestSellers,
  newArrivals,
  categories,
}: HomeTemplateProps) {
  return (
    <>
      <MediaHero content={content.hero} />

      <PromoBanner
        eyebrow="This week"
        title={content.home.essentials.subtitle}
        href="/shop"
        ctaLabel={content.hero.primaryCtaLabel}
      />

      <CategoryPills categories={categories} title="Quick shop" />

      <ProductShelf
        products={bestSellers}
        title={content.home.bestSellers.title}
        subtitle={content.home.bestSellers.subtitle}
        linkHref="/shop?sort=best"
        linkLabel="Shop bestsellers"
      />

      {featured.length > 0 && (
        <section className="border-y border-[var(--border)] bg-[var(--muted)] section-padding">
          <div className="container-tight">
            <SectionHeading
              title={content.home.essentials.title}
              subtitle={content.home.essentials.subtitle}
              linkHref="/shop"
              linkLabel="View all"
            />
            <div className="product-grid mt-10">
              {featured.slice(0, 8).map((product, i) => (
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

      <ProductShelf
        products={newArrivals}
        title={content.home.newArrivals.title}
        subtitle={content.home.newArrivals.subtitle}
        linkHref="/shop?sort=new"
        linkLabel="Shop new"
      />

      <CategoriesSection
        categories={categories}
        title={content.home.categories.title}
        subtitle={content.home.categories.subtitle}
      />

      <section className="border-t border-[var(--border)]">
        <div className="container-tight flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              {content.home.story.eyebrow}
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
              {content.home.story.title}
            </h2>
            <p className="mt-2 max-w-lg text-sm text-[var(--muted-foreground)]">
              {content.home.story.body}
            </p>
          </div>
          <Link href={content.home.story.ctaHref} className="theme-link text-sm">
            {content.home.story.ctaLabel}
          </Link>
        </div>
      </section>

      <ContentAccordion
        title={content.faq.title}
        subtitle={content.faq.subtitle}
        items={content.faq.items.slice(0, 4)}
      />

      <InstagramGallery content={content.instagram} />
      <InlineNewsletter content={content.newsletter} variant="band" />
    </>
  );
}

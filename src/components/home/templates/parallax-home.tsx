import Link from "next/link";
import { Hero } from "@/components/home/hero";
import { ChapterBand } from "@/components/home/blocks/chapter-band";
import { LookTile } from "@/components/home/blocks/look-tile";
import {
  HorizontalScroll,
  HorizontalScrollItem,
  Marquee,
  Reveal,
} from "@/components/effects";
import type { HomeTemplateProps } from "@/components/home/templates/types";

/**
 * Cinematic / Apple-fashion pace.
 * Sparse content, full-viewport chapters, looks without product grids or newsletter.
 */
export function ParallaxHome({ content, featured, categories }: HomeTemplateProps) {
  const marquee = [...content.home.marqueeItems, content.site.name];
  const looks = featured.slice(0, 5);
  const secondImage =
    categories[0]?.image ||
    content.home.story.imageUrl ||
    content.hero.imageUrl;

  return (
    <>
      <Hero content={content.hero} />
      <Marquee items={marquee} durationSec={36} />

      <ChapterBand
        image={content.home.story.imageUrl}
        chapter="01 — Craft"
        title={content.home.story.title}
        body={content.home.story.body}
        ctaLabel={content.home.story.ctaLabel}
        ctaHref={content.home.story.ctaHref}
        align="left"
      />

      {looks.length > 0 && (
        <section className="bg-[var(--foreground)] py-16 text-[var(--background)] sm:py-24">
          <div className="container-tight">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.28em] opacity-60">
                {content.home.essentials.title}
              </p>
              <h2 className="font-display mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-5xl">
                {content.home.essentials.subtitle}
              </h2>
            </Reveal>
          </div>
          <div className="mt-12">
            <HorizontalScroll label={content.home.essentials.title}>
              {looks.map((product, i) => (
                <HorizontalScrollItem
                  key={product.id}
                  className="max-w-none w-[72vw] sm:w-[42vw] lg:w-[28vw]"
                >
                  <LookTile
                    product={product}
                    priority={i < 1}
                    className="aspect-[3/4] w-full"
                  />
                </HorizontalScrollItem>
              ))}
            </HorizontalScroll>
          </div>
          <div className="container-tight mt-10">
            <Link
              href="/shop"
              className="text-sm underline underline-offset-4 opacity-80 transition-opacity hover:opacity-100"
            >
              Enter the shop
            </Link>
          </div>
        </section>
      )}

      <ChapterBand
        image={secondImage}
        chapter="02 — Wear"
        title={content.hero.headline}
        body={content.hero.subheadline}
        ctaLabel={content.hero.primaryCtaLabel}
        ctaHref={content.hero.primaryCtaHref}
        align="right"
      />
    </>
  );
}

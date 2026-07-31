import { Carousel } from "@/components/effects";
import { ImageMosaic } from "@/components/home/blocks/image-mosaic";
import { LookTile } from "@/components/home/blocks/look-tile";
import { StackedPanels } from "@/components/home/blocks/stacked-panels";
import { EmbedFrame } from "@/components/home/blocks/embed-frame";
import { InstagramGallery } from "@/components/home/instagram-gallery";
import type { HomeTemplateProps } from "@/components/home/templates/types";

const FALLBACK =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1600&q=80";

/**
 * Aritzia / campaign lookbook.
 * Carousel → mosaic → full-bleed stacked panels → look tiles (no prices) → Instagram.
 * Almost no commerce chrome; image-led throughout.
 */
export function LookbookHome({
  content,
  featured,
  categories,
}: HomeTemplateProps) {
  const slides = [
    {
      id: "hero",
      image: content.hero.imageUrl,
      title: content.hero.headline,
      subtitle: content.hero.subheadline,
    },
    {
      id: "story",
      image: content.home.story.imageUrl,
      title: content.home.story.title,
      subtitle: content.home.story.body,
    },
    ...categories.slice(0, 2).map((c) => ({
      id: c.id,
      image: c.image ?? FALLBACK,
      title: c.name,
      subtitle: c.description ?? "Explore the collection",
    })),
  ];

  const mosaicCells = [
    {
      id: "story",
      image: content.home.story.imageUrl,
      title: content.home.story.title,
      href: content.home.story.ctaHref,
      span: "tall" as const,
    },
    ...categories.slice(0, 3).map((c, i) => ({
      id: c.id,
      image: c.image ?? FALLBACK,
      title: c.name,
      href: `/shop?category=${c.slug}`,
      span: (i === 0 ? "wide" : "square") as "wide" | "square",
    })),
    ...featured.slice(0, 2).map((p) => ({
      id: p.id,
      image: p.images[0]?.url ?? FALLBACK,
      title: p.name,
      href: `/product/${p.slug}`,
      span: "square" as const,
    })),
  ].slice(0, 6);

  const panels = categories.slice(0, 3).map((c) => ({
    id: c.id,
    image: c.image ?? content.hero.imageUrl,
    title: c.name,
    subtitle: c.description ?? content.home.categories.subtitle,
    href: `/shop?category=${c.slug}`,
  }));

  const looks = featured.slice(0, 4);

  return (
    <>
      <Carousel slides={slides} autoPlayMs={5500} />

      <ImageMosaic
        cells={mosaicCells}
        eyebrow="Campaign"
        title={content.home.essentials.title}
      />

      <StackedPanels panels={panels} />

      {looks.length > 0 && (
        <section className="bg-[var(--background)] py-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {looks.map((product, i) => (
              <LookTile
                key={product.id}
                product={product}
                priority={i < 2}
                className="aspect-[4/5] min-h-[55vh] w-full sm:min-h-[70vh]"
              />
            ))}
          </div>
        </section>
      )}

      <EmbedFrame
        eyebrow="Film"
        title="Campaign film"
        src={content.hero.videoUrl || ""}
        caption="Set a YouTube or Vimeo URL in Admin → Hero video for this embed."
      />

      <InstagramGallery content={content.instagram} />
    </>
  );
}

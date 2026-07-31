import Link from "next/link";
import Image from "next/image";
import { SectionHeading } from "@/components/shared/section-heading";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
};

type CategoriesSectionProps = {
  categories: Category[];
  title?: string;
  subtitle?: string;
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
  "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80",
  "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
];

export function CategoriesSection({
  categories,
  title = "Shop by category",
  subtitle = "Curated collections for every part of your wardrobe.",
}: CategoriesSectionProps) {
  if (categories.length === 0) return null;

  return (
    <section className="section-padding bg-[var(--muted)]">
      <div className="container-tight">
        <SectionHeading
          title={title}
          subtitle={subtitle}
          linkLabel="All collections"
          linkHref="/collections"
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => {
            const image =
              category.image ?? FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

            return (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-200"
              >
                <Image
                  src={image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-neutral-950/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-display text-xl font-semibold text-white">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-white/70">
                      {category.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

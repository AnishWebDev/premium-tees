import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/products";
import { SITE_NAME } from "@/lib/constants";
import { SectionHeading } from "@/components/shared/section-heading";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Collections",
  description: `Explore curated collections of premium tees at ${SITE_NAME}.`,
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
  "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80",
  "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
  "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
  "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80",
];

export default async function CollectionsPage() {
  const categories = await getCategories();

  return (
    <section className="section-padding">
      <div className="container-tight">
        <SectionHeading
          title="Collections"
          subtitle="Curated categories designed for everyday wear — refined fits, premium fabrics, minimal branding."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const image =
              category.image ?? FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

            return (
              <Link
                key={category.id}
                href={`/collections/${category.slug}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--muted)]"
              >
                <Image
                  src={image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-neutral-950/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <h2 className="font-display text-2xl font-semibold text-white">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-white/75">
                      {category.description}
                    </p>
                  )}
                  <p className="mt-3 text-xs uppercase tracking-widest text-white/60">
                    {category._count.products}{" "}
                    {category._count.products === 1 ? "product" : "products"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductReviews } from "@/components/product/product-reviews";
import { RelatedProducts } from "@/components/product/related-products";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { ProductViewTracker } from "@/components/product/product-view-tracker";
import type { ProductCardData } from "@/types";

export const revalidate = 60;

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  const title = product.metaTitle ?? product.name;
  const description =
    product.metaDesc ?? product.shortDesc ?? product.description.slice(0, 160);
  const image = product.images[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      type: "website",
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    alternates: {
      canonical: `${SITE_URL}/product/${slug}`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id);

  const cardData: ProductCardData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    compareAt: product.compareAt,
    shortDesc: product.shortDesc,
    featured: product.featured,
    bestSeller: product.bestSeller,
    newArrival: product.newArrival,
    images: product.images.map((img) => ({ url: img.url, alt: img.alt })),
    category: { name: product.category.name, slug: product.category.slug },
    averageRating: product.averageRating,
    reviewCount: product.reviews.length,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDesc ?? product.description,
    image: product.images.map((img) => img.url),
    sku: product.variants[0]?.sku,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.variants.some(
          (v) => (v.inventory?.quantity ?? 0) - (v.inventory?.reserved ?? 0) > 0
        )
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    ...(product.reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.averageRating.toFixed(1),
        reviewCount: product.reviews.length,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductViewTracker product={cardData} />

      <section className="section-padding">
        <div className="container-tight">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <ProductGallery
              images={product.images.map((img) => ({
                url: img.url,
                alt: img.alt,
              }))}
              name={product.name}
            />
            <ProductInfo product={product} />
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--background)]">
        <div className="container-tight section-padding">
          <ProductReviews productId={product.id} reviews={product.reviews} />
        </div>
      </section>

      <RelatedProducts products={related} />
      <RecentlyViewed excludeId={product.id} />
    </>
  );
}

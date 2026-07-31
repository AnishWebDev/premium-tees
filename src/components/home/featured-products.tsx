import type { ProductCardData } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/shared/section-heading";

type FeaturedProductsProps = {
  products: ProductCardData[];
  title?: string;
  subtitle?: string;
};

export function FeaturedProducts({
  products,
  title = "Featured",
  subtitle = "Our most-loved essentials, chosen for fit and feel.",
}: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="container-tight">
        <SectionHeading
          title={title}
          subtitle={subtitle}
          linkLabel="View all"
          linkHref="/shop"
        />
        <div className="product-grid mt-10">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 2} />
          ))}
        </div>
      </div>
    </section>
  );
}

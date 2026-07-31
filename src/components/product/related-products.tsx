import type { ProductCardData } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/shared/section-heading";

type RelatedProductsProps = {
  products: ProductCardData[];
  title?: string;
};

export function RelatedProducts({
  products,
  title = "You may also like",
}: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="section-padding border-t border-[var(--border)]">
      <div className="container-tight">
        <SectionHeading title={title} linkLabel="Shop all" linkHref="/shop" />
        <div className="product-grid mt-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

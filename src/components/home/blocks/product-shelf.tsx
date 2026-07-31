import Link from "next/link";
import type { ProductCardData } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import {
  HorizontalScroll,
  HorizontalScrollItem,
} from "@/components/effects";

type ProductShelfProps = {
  products: ProductCardData[];
  title: string;
  subtitle?: string;
  linkHref?: string;
  linkLabel?: string;
};

/** Dense horizontal commerce shelf. */
export function ProductShelf({
  products,
  title,
  subtitle,
  linkHref = "/shop",
  linkLabel = "View all",
}: ProductShelfProps) {
  if (products.length === 0) return null;

  const headingId = `shelf-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section className="py-12 sm:py-16" aria-labelledby={headingId}>
      <div className="container-tight mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id={headingId}
            className="font-display text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl"
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {subtitle}
            </p>
          ) : null}
        </div>
        <Link href={linkHref} className="theme-link text-sm">
          {linkLabel}
        </Link>
      </div>
      <HorizontalScroll label={title}>
        {products.map((product, i) => (
          <HorizontalScrollItem key={product.id}>
            <ProductCard product={product} priority={i < 1} />
          </HorizontalScrollItem>
        ))}
      </HorizontalScroll>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { ProductCardData } from "@/types";
import { formatPrice } from "@/lib/utils";

type ProductRowListProps = {
  products: ProductCardData[];
  title?: string;
  linkHref?: string;
  linkLabel?: string;
};

/** Magazine product index — rows instead of cards. */
export function ProductRowList({
  products,
  title = "Index",
  linkHref = "/shop",
  linkLabel = "Shop all",
}: ProductRowListProps) {
  if (products.length === 0) return null;

  const headingId = "product-index-heading";

  return (
    <section
      className="border-b border-[var(--border)]"
      aria-labelledby={headingId}
    >
      <div className="container-tight py-10 sm:py-14">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <h2
            id={headingId}
            className="font-display text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl"
          >
            {title}
          </h2>
          <Link href={linkHref} className="theme-link text-sm">
            {linkLabel}
          </Link>
        </div>
        <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {products.map((product) => {
            const image = product.images[0];
            return (
              <li key={product.id}>
                <Link
                  href={`/product/${product.slug}`}
                  className="group grid grid-cols-[4.5rem_1fr_auto] items-center gap-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 sm:grid-cols-[5.5rem_1fr_auto_auto] sm:gap-8"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-[var(--muted)]">
                    {image ? (
                      <Image
                        src={image.url}
                        alt=""
                        fill
                        sizes="88px"
                        className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg tracking-tight text-[var(--foreground)] sm:text-xl">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                      {product.category.name}
                    </p>
                  </div>
                  <p className="hidden text-sm text-[var(--muted-foreground)] sm:block">
                    {product.shortDesc?.slice(0, 48) || "Essential"}
                  </p>
                  <p className="text-sm font-medium tabular-nums text-[var(--foreground)]">
                    <span className="sr-only">Price </span>
                    {formatPrice(product.price)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

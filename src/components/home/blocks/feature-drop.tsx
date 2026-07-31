import Link from "next/link";
import Image from "next/image";
import type { ProductCardData } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type FeatureDropProps = {
  product: ProductCardData;
  eyebrow?: string;
  body?: string;
};

/** Single oversized product moment for editorial layouts. */
export function FeatureDrop({
  product,
  eyebrow = "Featured drop",
  body,
}: FeatureDropProps) {
  const image = product.images[0];
  const secondary = product.images[1];

  return (
    <section
      className="border-b border-[var(--border)]"
      aria-labelledby="feature-drop-heading"
    >
      <div className="container-tight grid gap-0 lg:grid-cols-2">
        <div className="relative min-h-[60vh] bg-[var(--muted)] lg:min-h-[80vh]">
          {image ? (
            <Image
              src={image.url}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="flex flex-col justify-center border-t border-[var(--border)] px-4 py-16 sm:px-8 lg:border-l lg:border-t-0 lg:px-14">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
            {eyebrow}
          </p>
          <h2
            id="feature-drop-heading"
            className="font-display mt-4 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl"
          >
            {product.name}
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--muted-foreground)]">
            {body || product.shortDesc || "A considered essential, built to last."}
          </p>
          <p className="mt-6 text-lg font-medium tabular-nums text-[var(--foreground)]">
            {formatPrice(product.price)}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href={`/product/${product.slug}`}>View product</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/shop">Browse edit</Link>
            </Button>
          </div>
          {secondary ? (
            <div className="relative mt-12 hidden aspect-[4/3] max-w-sm overflow-hidden bg-[var(--muted)] lg:block">
              <Image
                src={secondary.url}
                alt=""
                fill
                sizes="320px"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { ProductCardData } from "@/types";
import { cn } from "@/lib/utils";

type LookTileProps = {
  product: ProductCardData;
  priority?: boolean;
  className?: string;
};

/** Campaign look tile — image dominates, minimal product chrome. */
export function LookTile({
  product,
  priority = false,
  className = "",
}: LookTileProps) {
  const image = product.images[0];

  return (
    <Link
      href={`/product/${product.slug}`}
      aria-label={`Shop the look: ${product.name}`}
      className={cn(
        "group relative block overflow-hidden bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
        className
      )}
    >
      {image ? (
        <Image
          src={image.url}
          alt=""
          fill
          sizes="(max-width: 768px) 80vw, 40vw"
          priority={priority}
          className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.04]"
        />
      ) : null}
      <div
        className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/25 to-transparent"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/85">
          {product.category.name}
        </p>
        <h3 className="font-display mt-1 text-xl font-semibold text-white sm:text-2xl">
          {product.name}
        </h3>
        <p className="mt-2 text-xs font-medium text-white/90 underline underline-offset-4">
          Shop the look
        </p>
      </div>
    </Link>
  );
}

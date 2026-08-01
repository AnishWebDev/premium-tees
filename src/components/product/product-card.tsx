"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { ProductCardData } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";

type ProductCardProps = {
  product: ProductCardData;
  priority?: boolean;
  /** On wishlist page: show remove control and drop item from list immediately */
  wishlistMode?: "default" | "remove";
  onWishlistRemoved?: (productId: string) => void;
};

export function ProductCard({
  product,
  priority = false,
  wishlistMode = "default",
  onWishlistRemoved,
}: ProductCardProps) {
  const { data: session } = useSession();
  const isSaved = useWishlistStore((s) => s.productIds.includes(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const [hovered, setHovered] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const primaryImage = product.images[0];
  const secondaryImage = product.images[1];
  const displayImage =
    hovered && secondaryImage ? secondaryImage : primaryImage;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      toast.error("Sign in to save items to your wishlist.");
      return;
    }

    setWishlistLoading(true);
    try {
      const action = await toggleWishlist(product.id);
      if (action === "added") {
        toast.success("Added to wishlist");
      } else {
        toast.success("Removed from wishlist");
        onWishlistRemoved?.(product.id);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setWishlistLoading(false);
    }
  };

  const showWishlistAlways = wishlistMode === "remove" || isSaved;

  return (
    <div className="group transition-transform duration-300 hover:scale-[1.015]">
      <Link
        href={`/product/${product.slug}`}
        className="block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[var(--muted)]">
          {displayImage ? (
            <Image
              src={displayImage.url}
              alt={displayImage.alt ?? product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--muted-foreground)]">
              No image
            </div>
          )}

          <Button
            type="button"
            variant="secondary"
            size="icon"
            disabled={wishlistLoading}
            aria-label={
              wishlistMode === "remove" || isSaved
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            className={cn(
              "absolute right-3 top-3 h-9 w-9 rounded-full bg-white/90 text-neutral-950 shadow-sm backdrop-blur-sm transition-opacity",
              showWishlistAlways ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            onClick={handleWishlist}
          >
            {wishlistMode === "remove" ? (
              <Trash2 className="h-4 w-4" />
            ) : (
              <Heart
                className={cn("h-4 w-4", isSaved && "fill-red-500 text-red-500")}
              />
            )}
          </Button>

          {product.newArrival && (
            <span className="absolute left-3 top-3 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-neutral-950">
              New
            </span>
          )}
        </div>

        <div className="mt-4 space-y-1">
          <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
            {product.category.name}
          </p>
          <h3 className="text-sm font-medium text-[var(--foreground)]">{product.name}</h3>

          {product.averageRating !== undefined && product.averageRating > 0 && (
            <StarRating rating={product.averageRating} />
          )}

          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-sm font-medium text-[var(--foreground)]">
              {formatPrice(product.price)}
            </span>
            {product.compareAt && product.compareAt > product.price && (
              <span className="text-sm text-[var(--muted-foreground)] line-through">
                {formatPrice(product.compareAt)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

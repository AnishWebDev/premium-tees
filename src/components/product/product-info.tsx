"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Minus, Plus, Heart } from "lucide-react";
import { toast } from "sonner";
import { SIZES } from "@/lib/constants";
import { useCartStore } from "@/lib/stores/cart-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { formatPrice, stockStatus, cn } from "@/lib/utils";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type ProductVariant = {
  id: string;
  size: string;
  color: string;
  colorHex: string | null;
  price: number | null;
  inventory: { quantity: number; reserved: number } | null;
};

type ProductInfoProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAt: number | null;
    description: string;
    material: string | null;
    fit: string | null;
    care: string | null;
    averageRating?: number;
    reviews?: unknown[];
    variants: ProductVariant[];
    images: { url: string; alt: string | null }[];
  };
};

export function ProductInfo({ product }: ProductInfoProps) {
  const { data: session } = useSession();
  const addItem = useCartStore((s) => s.addItem);
  const isSaved = useWishlistStore((s) => s.productIds.includes(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const colors = useMemo(
    () => [...new Set(product.variants.map((v) => v.color))],
    [product.variants]
  );

  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const sizesForColor = useMemo(() => {
    const sizes = product.variants
      .filter((v) => v.color === selectedColor)
      .map((v) => v.size);
    return SIZES.filter((s) => sizes.includes(s));
  }, [product.variants, selectedColor]);

  const selectedVariant = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const stock = selectedVariant
    ? stockStatus(
        selectedVariant.inventory?.quantity ?? 0,
        selectedVariant.inventory?.reserved ?? 0
      )
    : null;

  const unitPrice = selectedVariant?.price ?? product.price;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select a size and color.");
      return;
    }
    if (stock?.status === "out") {
      toast.error("This variant is out of stock.");
      return;
    }

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      slug: product.slug,
      price: unitPrice,
      image: product.images[0]?.url ?? "",
      size: selectedVariant.size,
      color: selectedVariant.color,
      colorHex: selectedVariant.colorHex,
      quantity,
      maxStock: stock?.available ?? 1,
    });

    toast.success("Added to cart");
  };

  const handleWishlist = async () => {
    if (!session?.user) {
      toast.error("Sign in to save items to your wishlist.");
      return;
    }

    setLoading(true);
    try {
      const action = await toggleWishlist(product.id);
      toast.success(
        action === "added" ? "Added to wishlist" : "Removed from wishlist"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const specs = [
    { label: "Material", value: product.material },
    { label: "Fit", value: product.fit },
    { label: "Care", value: product.care },
  ].filter((s) => s.value);

  return (
    <div className="flex flex-col">
      <div className="space-y-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
          {product.name}
        </h1>

        {product.averageRating !== undefined && product.averageRating > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={product.averageRating} size="md" />
            {product.reviews && (
              <span className="text-sm text-[var(--muted-foreground)]">
                ({product.reviews.length} reviews)
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="text-xl font-medium text-[var(--foreground)]">
            {formatPrice(unitPrice)}
          </span>
          {product.compareAt && product.compareAt > unitPrice && (
            <span className="text-lg text-[var(--muted-foreground)] line-through">
              {formatPrice(product.compareAt)}
            </span>
          )}
        </div>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-[var(--muted-foreground)]">
        {product.description}
      </p>

      {specs.length > 0 && (
        <dl className="mt-8 space-y-3 border-t border-[var(--border)] pt-8">
          {specs.map((spec) => (
            <div key={spec.label} className="grid grid-cols-3 gap-4 text-sm">
              <dt className="font-medium text-[var(--foreground)]">{spec.label}</dt>
              <dd className="col-span-2 text-[var(--muted-foreground)]">{spec.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-8 space-y-6 border-t border-[var(--border)] pt-8">
        {colors.length > 0 && (
          <div>
            <Label className="mb-3 block">Color — {selectedColor}</Label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color">
              {colors.map((color) => {
                const variant = product.variants.find((v) => v.color === color);
                return (
                  <button
                    key={color}
                    type="button"
                    role="radio"
                    aria-checked={selectedColor === color}
                    onClick={() => {
                      setSelectedColor(color);
                      setSelectedSize("");
                    }}
                    className={cn(
                      "flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                      selectedColor === color
                        ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                        : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                    )}
                  >
                    {variant?.colorHex && (
                      <span
                        className="h-4 w-4 rounded-full border border-[var(--border)]"
                        style={{ backgroundColor: variant.colorHex }}
                        aria-hidden
                      />
                    )}
                    {color}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {sizesForColor.length > 0 && (
          <div>
            <Label className="mb-3 block">Size</Label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
              {sizesForColor.map((size) => {
                const variant = product.variants.find(
                  (v) => v.color === selectedColor && v.size === size
                );
                const available =
                  (variant?.inventory?.quantity ?? 0) -
                  (variant?.inventory?.reserved ?? 0);
                const disabled = available <= 0;

                return (
                  <button
                    key={size}
                    type="button"
                    role="radio"
                    aria-checked={selectedSize === size}
                    disabled={disabled}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "flex h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-40",
                      selectedSize === size
                        ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                        : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {stock && (
          <p
            className={cn(
              "text-sm",
              stock.status === "out" && "text-red-600",
              stock.status === "low" && "text-amber-700",
              stock.status === "in" && "text-[var(--muted-foreground)]"
            )}
          >
            {stock.label}
          </p>
        )}

        <div>
          <Label className="mb-3 block">Quantity</Label>
          <div className="inline-flex items-center rounded-xl border border-[var(--border)]">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-11 w-11 items-center justify-center rounded-l-xl hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="flex h-11 w-12 items-center justify-center text-sm font-medium">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() =>
                setQuantity((q) =>
                  Math.min(q + 1, stock?.available ?? 20)
                )
              }
              disabled={stock?.status === "out"}
              className="flex h-11 w-11 items-center justify-center rounded-r-xl hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="flex-1"
            onClick={handleAddToCart}
            disabled={!selectedVariant || stock?.status === "out"}
          >
            Add to cart
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleWishlist}
            disabled={loading}
            aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn("h-4 w-4", isSaved && "fill-red-500 text-red-500")}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}

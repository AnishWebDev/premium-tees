"use client";

import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type StickyAddToCartBarProps = {
  productName: string;
  unitPrice: number;
  selectedVariant: boolean;
  disabled: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
};

export function StickyAddToCartBar({
  productName,
  unitPrice,
  selectedVariant,
  disabled,
  onAddToCart,
  onBuyNow,
}: StickyAddToCartBarProps) {
  if (!selectedVariant) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] p-4 backdrop-blur-xl lg:hidden"
      role="region"
      aria-label="Add to cart"
    >
      <div className="container-tight flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--foreground)]">{productName}</p>
          <p className="text-sm text-[var(--muted-foreground)]">{formatPrice(unitPrice)}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="lg" variant="secondary" onClick={onBuyNow} disabled={disabled}>
            Buy now
          </Button>
          <Button size="lg" onClick={onAddToCart} disabled={disabled}>
            Add to cart
          </Button>
        </div>
      </div>
    </div>
  );
}

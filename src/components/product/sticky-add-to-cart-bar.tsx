"use client";

import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type StickyAddToCartBarProps = {
  productName: string;
  unitPrice: number;
  needsSize: boolean;
  selectedVariant: boolean;
  disabled: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onPromptSize: () => void;
};

export function StickyAddToCartBar({
  productName,
  unitPrice,
  needsSize,
  selectedVariant,
  disabled,
  onAddToCart,
  onBuyNow,
  onPromptSize,
}: StickyAddToCartBarProps) {
  if (!needsSize && !selectedVariant) return null;

  const handleAdd = () => {
    if (needsSize) {
      onPromptSize();
      return;
    }
    onAddToCart();
  };

  const handleBuy = () => {
    if (needsSize) {
      onPromptSize();
      return;
    }
    onBuyNow();
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] p-4 backdrop-blur-xl lg:hidden"
      role="region"
      aria-label="Add to cart"
    >
      <div className="container-tight flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--foreground)]">{productName}</p>
          {needsSize ? (
            <p className="text-sm text-[var(--muted-foreground)]">Choose a size above</p>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">{formatPrice(unitPrice)}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="lg" variant="secondary" onClick={handleBuy} disabled={disabled && !needsSize}>
            {needsSize ? "Size" : "Buy now"}
          </Button>
          <Button size="lg" onClick={handleAdd} disabled={disabled && !needsSize}>
            {needsSize ? "Size" : "Add to cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}

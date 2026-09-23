"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RemoteImage } from "@/components/shared/remote-image";
import { Minus, Plus, ShoppingBag, Trash2, Bookmark, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { PromoCodeField } from "@/components/cart/promo-code-field";
import {
  DEFAULT_COMMERCE_CONFIG,
  type CommerceConfig,
} from "@/lib/commerce";
import {
  DEFAULT_SHIPPING_METHOD,
  SHOW_SHIPPING_METHOD_UI,
} from "@/lib/constants";
import {
  formatPrice,
  calculateTax,
  cn,
} from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type CartViewProps = {
  commerce?: CommerceConfig;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function CartView({
  commerce: commerceProp,
  emptyTitle = "Your cart is empty",
  emptyDescription = "Explore our collection and find your next favorite tee.",
}: CartViewProps) {
  const [commerce, setCommerce] = useState<CommerceConfig>(
    commerceProp ?? DEFAULT_COMMERCE_CONFIG
  );

  const {
    items,
    discount,
    shippingMethod,
    removeItem,
    updateQuantity,
    saveForLater,
    moveToCart,
    setShippingMethod,
    getSubtotal,
    getActiveItems,
    getSavedItems,
  } = useCartStore();

  useEffect(() => {
    if (commerceProp) {
      setCommerce(commerceProp);
      return;
    }

    fetch("/api/store/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.commerce) setCommerce(data.commerce);
      })
      .catch(() => undefined);
  }, [commerceProp]);

  const activeItems = getActiveItems();
  const savedItems = getSavedItems();
  const subtotal = getSubtotal();

  const activeShippingMethod = SHOW_SHIPPING_METHOD_UI
    ? shippingMethod
    : DEFAULT_SHIPPING_METHOD;
  const shippingCost =
    subtotal >= commerce.freeShippingThreshold
      ? 0
      : commerce.shippingMethods.find((m) => m.id === activeShippingMethod)?.price ?? 0;

  const tax = calculateTax(subtotal - discount, commerce.gstRate);
  const total = Math.max(0, subtotal - discount + shippingCost + tax);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel="Shop now"
        actionHref="/shop"
      />
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-7">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--foreground)]">
          Cart
        </h1>

        {activeItems.length > 0 && (
          <ul className="mt-8 divide-y divide-neutral-200">
            {activeItems.map((item) => (
              <li key={item.id} className="flex gap-4 py-6 first:pt-0">
                <Link
                  href={`/product/${item.slug}`}
                  className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-[var(--muted)]"
                >
                  {item.image && (
                    <RemoteImage
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/product/${item.slug}`}
                        className="theme-link text-sm"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                        {item.color} · {item.size}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
                    <div className="inline-flex items-center rounded-lg border border-[var(--border)]">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center hover:bg-[var(--muted)]"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="flex h-9 w-8 items-center justify-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center hover:bg-[var(--muted)]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => saveForLater(item.id)}
                      className="inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                      Save for later
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-red-600"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {savedItems.length > 0 && (
          <div className="mt-12 border-t border-[var(--border)] pt-12">
            <h2 className="text-sm font-medium text-[var(--foreground)]">Saved for later</h2>
            <ul className="mt-6 divide-y divide-neutral-200">
              {savedItems.map((item) => (
                <li key={item.id} className="flex gap-4 py-6 first:pt-0">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--muted)]">
                    {item.image && (
                      <RemoteImage
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{item.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {item.color} · {item.size}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveToCart(item.id)}
                    >
                      Move to cart
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="lg:col-span-5">
        <div className="rounded-2xl border border-[var(--border)] p-6 sm:p-8">
          <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
            Order summary
          </h2>

          <div className="mt-6 space-y-4">
            <PromoCodeField subtotal={subtotal} />

            {SHOW_SHIPPING_METHOD_UI ? (
              <div>
                <Label className="text-xs uppercase tracking-wider">Shipping</Label>
                <div className="mt-2 space-y-2" role="radiogroup" aria-label="Shipping method">
                  {commerce.shippingMethods.map((method) => {
                    const price =
                      subtotal >= commerce.freeShippingThreshold ? 0 : method.price;
                    return (
                      <label
                        key={method.id}
                        className={cn(
                          "flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors",
                          shippingMethod === method.id
                            ? "border-[var(--foreground)] bg-[var(--muted)]"
                            : "border-[var(--border)] hover:border-[var(--border)]"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            value={method.id}
                            checked={shippingMethod === method.id}
                            onChange={() => setShippingMethod(method.id)}
                            className="accent-[var(--foreground)]"
                          />
                          <div>
                            <span className="font-medium text-[var(--foreground)]">
                              {method.label}
                            </span>
                            <span className="block text-xs text-[var(--muted-foreground)]">
                              {method.days}
                            </span>
                          </div>
                        </div>
                        <span className="text-[var(--foreground)]">
                          {price === 0 ? "Free" : formatPrice(price)}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {subtotal > 0 && subtotal < commerce.freeShippingThreshold && (
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    Add {formatPrice(commerce.freeShippingThreshold - subtotal)} more for free
                    shipping
                  </p>
                )}
              </div>
            ) : null}

          </div>

          <dl className="mt-8 space-y-3 border-t border-[var(--border)] pt-6 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--muted-foreground)]">Subtotal</dt>
              <dd className="font-medium text-[var(--foreground)]">{formatPrice(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-700">
                <dt>Discount</dt>
                <dd>−{formatPrice(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-[var(--muted-foreground)]">Shipping</dt>
              <dd className="font-medium text-[var(--foreground)]">
                {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--muted-foreground)]">
                Tax (est. {Math.round(commerce.gstRate * 100)}% GST)
              </dt>
              <dd className="font-medium text-[var(--foreground)]">{formatPrice(tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-[var(--border)] pt-3 text-base">
              <dt className="font-medium text-[var(--foreground)]">Total</dt>
              <dd className="font-semibold text-[var(--foreground)]">{formatPrice(total)}</dd>
            </div>
          </dl>

          <Button asChild size="lg" className="mt-8 w-full" disabled={activeItems.length === 0}>
            <Link href="/checkout">
              Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

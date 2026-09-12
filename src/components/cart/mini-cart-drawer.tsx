"use client";

import Link from "next/link";
import { RemoteImage } from "@/components/shared/remote-image";
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type MiniCartDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MiniCartDrawer({ open, onOpenChange }: MiniCartDrawerProps) {
  const { getActiveItems, getSubtotal, removeItem, updateQuantity } = useCartStore();
  const items = getActiveItems();
  const subtotal = getSubtotal();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-label="Shopping cart"
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[var(--border)] bg-[var(--background)] shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300"
          )}
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
            <DialogPrimitive.Title className="font-display text-lg font-semibold text-[var(--foreground)]">
              Your cart
              {items.length > 0 && (
                <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">
                  ({items.reduce((n, i) => n + i.quantity, 0)} items)
                </span>
              )}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="rounded-full p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <ShoppingBag className="h-12 w-12 text-[var(--muted-foreground)]" aria-hidden />
              <p className="mt-4 font-medium text-[var(--foreground)]">Your cart is empty</p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Add something you love — we&apos;ll keep it here.
              </p>
              <Button asChild className="mt-6" onClick={() => onOpenChange(false)}>
                <Link href="/shop">Shop now</Link>
              </Button>
            </div>
          ) : (
            <>
              <ul className="flex-1 overflow-y-auto px-6 py-4" aria-label="Cart items">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4 border-b border-[var(--border)] py-4 last:border-0">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={() => onOpenChange(false)}
                      className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--muted)]"
                    >
                      {item.image && (
                        <RemoteImage
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={() => onOpenChange(false)}
                            className="theme-link text-sm font-medium"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                            {item.color} · {item.size}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                      <div className="mt-auto flex items-center gap-2 pt-2">
                        <div className="inline-flex items-center rounded-lg border border-[var(--border)]">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="flex h-8 w-7 items-center justify-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="ml-auto rounded p-1.5 text-[var(--muted-foreground)] hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-[var(--border)] px-6 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Subtotal</span>
                  <span className="text-lg font-semibold text-[var(--foreground)]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <Button asChild size="lg" className="w-full" onClick={() => onOpenChange(false)}>
                    <Link href="/checkout">
                      Checkout
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => onOpenChange(false)}
                  >
                    <Link href="/cart">View cart</Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

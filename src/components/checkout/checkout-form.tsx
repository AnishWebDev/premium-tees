"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";
import { SHIPPING_METHODS } from "@/lib/constants";
import { useCartStore } from "@/lib/stores/cart-store";
import { formatPrice, calculateTax, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

type CheckoutFormProps = {
  /** Staff-only dummy paid checkout when Razorpay is not configured */
  demoMode?: boolean;
};

export function CheckoutForm({ demoMode = false }: CheckoutFormProps) {
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);

  const {
    getActiveItems,
    getSubtotal,
    couponCode,
    discount,
    shippingMethod,
    setShippingMethod,
  } = useCartStore();

  const items = getActiveItems();
  const subtotal = getSubtotal();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema) as never,
    defaultValues: {
      email: session?.user?.email ?? "",
      shippingCountry: "IN",
      billingCountry: "IN",
      sameAsBilling: true,
      shippingMethod,
      couponCode: couponCode ?? undefined,
    },
  });

  const sameAsBilling = watch("sameAsBilling");
  const selectedShipping = watch("shippingMethod");
  const shippingState = watch("shippingState");

  const shippingCost =
    SHIPPING_METHODS.find((m) => m.id === selectedShipping)?.price ?? 79;
  const tax = calculateTax(subtotal - discount, shippingState);
  const total = Math.max(0, subtotal - discount + shippingCost + tax);

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const onSubmit = async (data: CheckoutInput) => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          shippingCountry: data.shippingCountry || "IN",
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            name: item.name,
            price: item.price,
            size: item.size,
            color: item.color,
            image: item.image,
          })),
        }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Checkout failed");

      if (body.demo) {
        useCartStore.getState().clearCart();
        toast.success("Demo order placed (no real payment)");
        window.location.href =
          body.redirectUrl || `/checkout/success?order=${body.orderNumber}`;
        return;
      }

      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay) {
        throw new Error("Could not load Razorpay Checkout");
      }

      const rzp = new window.Razorpay({
        key: body.key,
        amount: body.amount,
        currency: body.currency,
        name: body.name,
        description: `Order ${body.orderNumber}`,
        order_id: body.razorpayOrderId,
        prefill: {
          name: data.shippingName,
          email: body.email,
          contact: body.contact,
        },
        theme: { color: "#18181b" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: body.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyBody = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyBody.error || "Payment verification failed");
            }
            useCartStore.getState().clearCart();
            window.location.href =
              verifyBody.redirectUrl || `/checkout/success?order=${body.orderNumber}`;
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Payment verification failed");
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.message("Payment cancelled");
            setSubmitting(false);
          },
        },
      });

      rzp.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">
        Your cart is empty.{" "}
        <a href="/shop" className="theme-link">
          Continue shopping
        </a>
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-12 lg:grid-cols-12">
      <div className="space-y-10 lg:col-span-7">
        <section>
          <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
            Contact
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {session?.user
              ? `Signed in as ${session.user.email}`
              : "Checkout as a guest or sign in for faster checkout."}
          </p>
          <div className="mt-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              className="mt-2"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
            Shipping address
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="shippingName">Full name</Label>
              <Input id="shippingName" className="mt-2" {...register("shippingName")} />
              {errors.shippingName && (
                <p className="mt-1 text-xs text-red-600">{errors.shippingName.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="shippingLine1">Address</Label>
              <Input id="shippingLine1" className="mt-2" {...register("shippingLine1")} />
              {errors.shippingLine1 && (
                <p className="mt-1 text-xs text-red-600">{errors.shippingLine1.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="shippingLine2">Apartment, suite, etc. (optional)</Label>
              <Input id="shippingLine2" className="mt-2" {...register("shippingLine2")} />
            </div>
            <div>
              <Label htmlFor="shippingCity">City</Label>
              <Input id="shippingCity" className="mt-2" {...register("shippingCity")} />
              {errors.shippingCity && (
                <p className="mt-1 text-xs text-red-600">{errors.shippingCity.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="shippingState">State</Label>
              <Input id="shippingState" className="mt-2" {...register("shippingState")} />
              {errors.shippingState && (
                <p className="mt-1 text-xs text-red-600">{errors.shippingState.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="shippingZip">PIN code</Label>
              <Input id="shippingZip" className="mt-2" {...register("shippingZip")} />
              {errors.shippingZip && (
                <p className="mt-1 text-xs text-red-600">{errors.shippingZip.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="shippingCountry">Country</Label>
              <Input
                id="shippingCountry"
                className="mt-2"
                defaultValue="IN"
                {...register("shippingCountry")}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">India (IN) — UPI & cards via Razorpay</p>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="shippingPhone">Phone (for UPI / delivery)</Label>
              <Input id="shippingPhone" type="tel" className="mt-2" {...register("shippingPhone")} />
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3">
            <Checkbox
              id="sameAsBilling"
              checked={sameAsBilling}
              onCheckedChange={(checked) =>
                setValue("sameAsBilling", checked === true)
              }
            />
            <Label htmlFor="sameAsBilling" className="cursor-pointer">
              Billing address same as shipping
            </Label>
          </div>

          {!sameAsBilling && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="billingName">Full name</Label>
                <Input id="billingName" className="mt-2" {...register("billingName")} />
                {errors.billingName && (
                  <p className="mt-1 text-xs text-red-600">{errors.billingName.message}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="billingLine1">Address</Label>
                <Input id="billingLine1" className="mt-2" {...register("billingLine1")} />
                {errors.billingLine1 && (
                  <p className="mt-1 text-xs text-red-600">{errors.billingLine1.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="billingCity">City</Label>
                <Input id="billingCity" className="mt-2" {...register("billingCity")} />
                {errors.billingCity && (
                  <p className="mt-1 text-xs text-red-600">{errors.billingCity.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="billingState">State</Label>
                <Input id="billingState" className="mt-2" {...register("billingState")} />
                {errors.billingState && (
                  <p className="mt-1 text-xs text-red-600">{errors.billingState.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="billingZip">ZIP</Label>
                <Input id="billingZip" className="mt-2" {...register("billingZip")} />
                {errors.billingZip && (
                  <p className="mt-1 text-xs text-red-600">{errors.billingZip.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="billingCountry">Country</Label>
                <Input id="billingCountry" className="mt-2" {...register("billingCountry")} />
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
            Shipping method
          </h2>
          <div className="mt-4 space-y-2" role="radiogroup" aria-label="Shipping method">
            {SHIPPING_METHODS.map((method) => (
              <label
                key={method.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm",
                  selectedShipping === method.id
                    ? "border-[var(--foreground)] bg-[var(--muted)]"
                    : "border-[var(--border)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    value={method.id}
                    {...register("shippingMethod")}
                    onChange={() => {
                      setValue("shippingMethod", method.id);
                      setShippingMethod(method.id);
                    }}
                    className="accent-neutral-950"
                  />
                  <div>
                    <span className="font-medium">{method.label}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">{method.days}</span>
                  </div>
                </div>
                <span>{formatPrice(method.price)}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <Label htmlFor="notes">Order notes (optional)</Label>
          <Textarea
            id="notes"
            className="mt-2"
            placeholder="Delivery instructions, gift message, etc."
            {...register("notes")}
          />
        </section>
      </div>

      <div className="lg:col-span-5">
        <div className="sticky top-24 rounded-2xl border border-[var(--border)] p-6 sm:p-8">
          <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
            Order summary
          </h2>

          <ul className="mt-6 space-y-4">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 text-sm">
                <span className="text-[var(--muted-foreground)]">
                  {item.name}{" "}
                  <span className="text-[var(--muted-foreground)]">
                    × {item.quantity}
                  </span>
                </span>
                <span className="shrink-0 font-medium text-[var(--foreground)]">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-2 border-t border-[var(--border)] pt-6 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--muted-foreground)]">Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-700">
                <dt>Discount</dt>
                <dd>−{formatPrice(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-[var(--muted-foreground)]">Shipping</dt>
              <dd>{formatPrice(shippingCost)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--muted-foreground)]">Tax (est.)</dt>
              <dd>{formatPrice(tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-[var(--border)] pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>

          <Button type="submit" size="lg" className="mt-8 w-full" disabled={submitting}>
            {submitting
              ? "Processing…"
              : demoMode
                ? "Complete demo checkout"
                : "Pay with UPI / Card"}
          </Button>

          <p className="mt-4 text-center text-xs text-[var(--muted-foreground)]">
            {demoMode
              ? "Staff demo — order is marked paid without Razorpay"
              : "Secure checkout powered by Razorpay — UPI, cards & more"}
          </p>
        </div>
      </div>
    </form>
  );
}

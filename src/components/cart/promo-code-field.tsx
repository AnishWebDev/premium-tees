"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PromoCodeFieldProps = {
  subtotal: number;
  /** Called when a code is applied or removed (e.g. sync checkout form). */
  onCouponChange?: (code: string | undefined) => void;
  labelClassName?: string;
};

export function PromoCodeField({
  subtotal,
  onCouponChange,
  labelClassName = "text-xs uppercase tracking-wider",
}: PromoCodeFieldProps) {
  const { data: session } = useSession();
  const { couponCode, discount, setCoupon } = useCartStore();
  const [promoInput, setPromoInput] = useState(couponCode ?? "");
  const [promoLoading, setPromoLoading] = useState(false);

  useEffect(() => {
    setPromoInput(couponCode ?? "");
  }, [couponCode]);

  const applyPromo = async () => {
    if (!promoInput.trim()) return;

    setPromoLoading(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoInput.trim(),
          subtotal,
          ...(session?.user?.email ? { email: session.user.email } : {}),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Invalid promo code");

      setCoupon(body.code, body.discount);
      onCouponChange?.(body.code);
      toast.success(`Promo applied — ${formatPrice(body.discount)} off`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid promo code");
      setCoupon(null, 0);
      onCouponChange?.(undefined);
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setPromoInput("");
    setCoupon(null, 0);
    onCouponChange?.(undefined);
  };

  return (
    <div>
      <Label htmlFor="promo-code" className={labelClassName}>
        Promo code
      </Label>
      <div className="mt-2 flex gap-2">
        <Input
          id="promo-code"
          value={promoInput}
          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
          placeholder="Enter code"
          disabled={!!couponCode}
          autoComplete="off"
        />
        {couponCode ? (
          <Button type="button" variant="outline" onClick={removePromo}>
            Remove
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={applyPromo}
            disabled={promoLoading || !promoInput.trim()}
          >
            {promoLoading ? "…" : "Apply"}
          </Button>
        )}
      </div>
      {couponCode && discount > 0 && (
        <p className="mt-2 text-xs text-green-700 dark:text-green-400">
          {couponCode} applied — {formatPrice(discount)} off
        </p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/stores/cart-store";
import { Button } from "@/components/ui/button";

type BuyAgainButtonProps = {
  orderId: string;
};

export function BuyAgainButton({ orderId }: BuyAgainButtonProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [loading, setLoading] = useState(false);

  const handleBuyAgain = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/buy-again`, {
        method: "POST",
      });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Could not add items to cart");
      }

      for (const item of body.items) {
        addItem(item);
      }

      toast.success(
        body.items.length === 1
          ? "1 item added to cart"
          : `${body.items.length} items added to cart`
      );
      router.push("/cart");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleBuyAgain}
      disabled={loading}
    >
      <RotateCcw className="h-4 w-4" />
      {loading ? "Adding…" : "Buy again"}
    </Button>
  );
}

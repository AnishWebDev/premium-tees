import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Cart",
  description: `Review your cart at ${SITE_NAME}.`,
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <section className="section-padding">
      <div className="container-tight">
        <CartView />
      </div>
    </section>
  );
}

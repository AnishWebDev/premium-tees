import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { getSiteIdentity } from "@/lib/site-identity";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteIdentity();
  return {
    title: "Cart",
    description: `Review your cart at ${site.name}.`,
    robots: { index: false, follow: false },
  };
}

export default function CartPage() {
  return (
    <section className="section-padding">
      <div className="container-tight">
        <CartView />
      </div>
    </section>
  );
}

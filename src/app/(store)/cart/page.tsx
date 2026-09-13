import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { getCmsBlock } from "@/lib/cms-content";
import { getCommerceConfig } from "@/lib/commerce";
import { getSiteIdentity } from "@/lib/site-identity";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteIdentity();
  return {
    title: "Cart",
    description: `Review your cart at ${site.name}.`,
    robots: { index: false, follow: false },
  };
}

export default async function CartPage() {
  const [commerce, storeCopy] = await Promise.all([
    getCommerceConfig(),
    getCmsBlock("storeCopy"),
  ]);

  return (
    <section className="section-padding">
      <div className="container-tight">
        <CartView
          commerce={commerce}
          emptyTitle={storeCopy.cartEmptyTitle}
          emptyDescription={storeCopy.cartEmptyDescription}
        />
      </div>
    </section>
  );
}

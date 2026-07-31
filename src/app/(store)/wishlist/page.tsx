import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { WishlistContent } from "./wishlist-content";

export const metadata: Metadata = {
  title: "Wishlist",
  description: `Your saved items at ${SITE_NAME}.`,
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <section className="section-padding">
      <div className="container-tight">
        <WishlistContent />
      </div>
    </section>
  );
}

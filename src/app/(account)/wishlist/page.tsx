import type { Metadata } from "next";
import { WishlistContent } from "@/components/account/wishlist-content";

export const metadata: Metadata = {
  title: "Wishlist",
  robots: { index: false, follow: false },
};

export default function AccountWishlistPage() {
  return <WishlistContent />;
}

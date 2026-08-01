"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useWishlistStore } from "@/lib/stores/wishlist-store";

/** Loads wishlist product ids when the signed-in user changes. */
export function WishlistSessionSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    const nextUserId = session?.user?.id ?? null;
    const { userId, setUserId, clear, fetchWishlist } = useWishlistStore.getState();

    if (userId === nextUserId && useWishlistStore.getState().loaded) return;

    setUserId(nextUserId);

    if (nextUserId) {
      void fetchWishlist();
    } else {
      clear();
    }
  }, [session?.user?.id, status]);

  return null;
}

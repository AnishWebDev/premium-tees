"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { clearRecentlyViewedForUser } from "@/lib/hooks/use-recently-viewed";
import { useCartStore } from "@/lib/stores/cart-store";

/**
 * Keeps browser-local cart / recently-viewed scoped to the signed-in user.
 * - Guest → login: keep cart items, assign owner
 * - User A → logout / User B: clear so accounts don’t share state
 */
export function CartSessionSync() {
  const { data: session, status } = useSession();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const api = useCartStore.persist;
    if (!api?.hasHydrated || !api?.onFinishHydration) {
      setHydrated(true);
      return;
    }

    setHydrated(api.hasHydrated());
    return api.onFinishHydration(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated || status === "loading") return;

    const nextUserId = session?.user?.id ?? null;
    const { userId, setUserId, clearCart } = useCartStore.getState();

    if (userId === nextUserId) return;

    // Leaving a signed-in session (logout or switch account)
    if (userId !== null && userId !== nextUserId) {
      clearCart();
      clearRecentlyViewedForUser(userId);
    }

    setUserId(nextUserId);
  }, [hydrated, session?.user?.id, status]);

  return null;
}

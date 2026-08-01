"use client";

import { create } from "zustand";

type WishlistState = {
  userId: string | null;
  productIds: string[];
  loaded: boolean;
  loading: boolean;
  setUserId: (userId: string | null) => void;
  setProductIds: (productIds: string[]) => void;
  clear: () => void;
  fetchWishlist: () => Promise<void>;
  isSaved: (productId: string) => boolean;
  count: () => number;
  toggle: (productId: string) => Promise<"added" | "removed">;
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  userId: null,
  productIds: [],
  loaded: false,
  loading: false,

  setUserId: (userId) => set({ userId }),

  setProductIds: (productIds) => set({ productIds, loaded: true }),

  clear: () => set({ productIds: [], loaded: true, loading: false }),

  isSaved: (productId) => get().productIds.includes(productId),

  count: () => get().productIds.length,

  fetchWishlist: async () => {
    const { userId } = get();
    if (!userId) {
      set({ productIds: [], loaded: true });
      return;
    }

    set({ loading: true });
    try {
      const res = await fetch("/api/wishlist");
      if (!res.ok) throw new Error("Failed to load wishlist");
      const data = await res.json();
      const ids = (data.wishlist ?? []).map(
        (item: { productId: string }) => item.productId
      );
      set({ productIds: ids, loaded: true });
    } catch {
      set({ loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  toggle: async (productId) => {
    const wasSaved = get().isSaved(productId);
    const nextAction: "added" | "removed" = wasSaved ? "removed" : "added";

    // Optimistic update
    set((state) => ({
      productIds:
        nextAction === "added"
          ? [...state.productIds, productId]
          : state.productIds.filter((id) => id !== productId),
    }));

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not update wishlist");
      }
      const data = await res.json();
      const action = data.action === "removed" ? "removed" : "added";

      // Reconcile if server disagrees with optimistic guess
      if (action !== nextAction) {
        set((state) => ({
          productIds:
            action === "added"
              ? state.productIds.includes(productId)
                ? state.productIds
                : [...state.productIds, productId]
              : state.productIds.filter((id) => id !== productId),
        }));
      }

      return action;
    } catch (error) {
      // Revert optimistic update
      set((state) => ({
        productIds:
          wasSaved
            ? state.productIds.includes(productId)
              ? state.productIds
              : [...state.productIds, productId]
            : state.productIds.filter((id) => id !== productId),
      }));
      throw error;
    }
  },
}));

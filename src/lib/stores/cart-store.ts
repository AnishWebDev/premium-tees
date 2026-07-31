"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LocalCartItem = {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  size: string;
  color: string;
  colorHex?: string | null;
  quantity: number;
  savedForLater: boolean;
  maxStock: number;
};

type CartState = {
  /** Signed-in user who owns this cart; null = guest cart */
  userId: string | null;
  items: LocalCartItem[];
  couponCode: string | null;
  discount: number;
  shippingMethod: "standard" | "express" | "overnight";
  addItem: (item: Omit<LocalCartItem, "id" | "savedForLater">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  saveForLater: (id: string) => void;
  moveToCart: (id: string) => void;
  setCoupon: (code: string | null, discount: number) => void;
  setShippingMethod: (method: "standard" | "express" | "overnight") => void;
  setUserId: (userId: string | null) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  getActiveItems: () => LocalCartItem[];
  getSavedItems: () => LocalCartItem[];
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      userId: null,
      items: [],
      couponCode: null,
      discount: 0,
      shippingMethod: "standard",

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.variantId === item.variantId && !i.savedForLater
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === existing.id
                  ? {
                      ...i,
                      quantity: Math.min(i.quantity + item.quantity, i.maxStock),
                    }
                  : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                id: `${item.variantId}-${Date.now()}`,
                savedForLater: false,
              },
            ],
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(quantity, i.maxStock) } : i
          ),
        }));
      },

      saveForLater: (id) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, savedForLater: true } : i
          ),
        }));
      },

      moveToCart: (id) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, savedForLater: false } : i
          ),
        }));
      },

      setCoupon: (code, discount) => set({ couponCode: code, discount }),

      setShippingMethod: (method) => set({ shippingMethod: method }),

      setUserId: (userId) => set({ userId }),

      clearCart: () =>
        set({
          items: [],
          couponCode: null,
          discount: 0,
          shippingMethod: "standard",
        }),

      getSubtotal: () =>
        get()
          .getActiveItems()
          .reduce((sum, item) => sum + item.price * item.quantity, 0),

      getItemCount: () =>
        get()
          .getActiveItems()
          .reduce((sum, item) => sum + item.quantity, 0),

      getActiveItems: () => get().items.filter((i) => !i.savedForLater),

      getSavedItems: () => get().items.filter((i) => i.savedForLater),
    }),
    { name: "premium-tees-cart" }
  )
);

/** Clear local cart (and recently viewed) then bind cart to the session identity. */
export function resetCartForUser(userId: string | null) {
  const previous = useCartStore.getState().userId;
  useCartStore.getState().clearCart();
  useCartStore.getState().setUserId(userId);
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(
        `premium-tees-recently-viewed:${previous ?? "guest"}`
      );
      if (userId) {
        localStorage.removeItem(`premium-tees-recently-viewed:${userId}`);
      }
      localStorage.removeItem("premium-tees-recently-viewed");
    } catch {
      /* ignore */
    }
  }
}

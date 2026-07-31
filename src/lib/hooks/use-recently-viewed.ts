"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { ProductCardData } from "@/types";

const STORAGE_PREFIX = "premium-tees-recently-viewed";
const LEGACY_KEY = "premium-tees-recently-viewed";
const MAX_ITEMS = 8;

function storageKey(userId: string | null | undefined) {
  return `${STORAGE_PREFIX}:${userId ?? "guest"}`;
}

export function clearRecentlyViewedForUser(userId: string | null) {
  try {
    localStorage.removeItem(storageKey(userId));
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
}

export function useRecentlyViewed() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? null;
  const [items, setItems] = useState<ProductCardData[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    try {
      const key = storageKey(userId);
      const raw = localStorage.getItem(key);
      if (raw) {
        setItems(JSON.parse(raw) as ProductCardData[]);
      } else if (!userId) {
        // One-time migrate legacy unscoped guest key
        const legacy = localStorage.getItem(LEGACY_KEY);
        if (legacy) {
          localStorage.setItem(key, legacy);
          localStorage.removeItem(LEGACY_KEY);
          setItems(JSON.parse(legacy) as ProductCardData[]);
        } else {
          setItems([]);
        }
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    }
    setHydrated(true);
  }, [status, userId]);

  const addItem = useCallback(
    (product: ProductCardData) => {
      setItems((prev) => {
        const filtered = prev.filter((p) => p.id !== product.id);
        const next = [product, ...filtered].slice(0, MAX_ITEMS);
        try {
          localStorage.setItem(storageKey(userId), JSON.stringify(next));
        } catch {
          /* storage full or unavailable */
        }
        return next;
      });
    },
    [userId]
  );

  const clearItems = useCallback(() => {
    setItems([]);
    clearRecentlyViewedForUser(userId);
  }, [userId]);

  return { items, addItem, clearItems, hydrated };
}

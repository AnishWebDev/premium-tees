"use client";

import { useEffect } from "react";
import type { ProductCardData } from "@/types";
import { useRecentlyViewed } from "@/lib/hooks/use-recently-viewed";

type ProductViewTrackerProps = {
  product: ProductCardData;
};

export function ProductViewTracker({ product }: ProductViewTrackerProps) {
  const { addItem } = useRecentlyViewed();

  useEffect(() => {
    addItem(product);
  }, [addItem, product]);

  return null;
}

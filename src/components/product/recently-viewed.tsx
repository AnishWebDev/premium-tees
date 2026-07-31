"use client";

import type { ProductCardData } from "@/types";
import { useRecentlyViewed } from "@/lib/hooks/use-recently-viewed";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/shared/section-heading";

type RecentlyViewedProps = {
  excludeId?: string;
};

export function RecentlyViewed({ excludeId }: RecentlyViewedProps) {
  const { items, hydrated } = useRecentlyViewed();

  const visible = items.filter((p) => p.id !== excludeId);

  if (!hydrated || visible.length === 0) return null;

  return (
    <section className="section-padding border-t border-[var(--border)]">
      <div className="container-tight">
        <SectionHeading title="Recently viewed" />
        <div className="product-grid mt-10">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product as ProductCardData} />
          ))}
        </div>
      </div>
    </section>
  );
}

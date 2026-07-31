"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ProductCardData } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export function WishlistContent() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      setLoading(false);
      return;
    }

    fetch("/api/wishlist")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load wishlist");
        const data = await res.json();
        const mapped: ProductCardData[] = (data.wishlist ?? []).map(
          (item: {
            product: {
              id: string;
              name: string;
              slug: string;
              price: number;
              compareAt: number | null;
              shortDesc: string | null;
              featured: boolean;
              bestSeller: boolean;
              newArrival: boolean;
              images: { url: string; alt: string | null }[];
              category: { name: string; slug: string };
            };
          }) => ({
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            price: item.product.price,
            compareAt: item.product.compareAt,
            shortDesc: item.product.shortDesc,
            featured: item.product.featured,
            bestSeller: item.product.bestSeller,
            newArrival: item.product.newArrival,
            images: item.product.images,
            category: item.product.category,
          })
        );
        setProducts(mapped);
      })
      .catch(() => toast.error("Could not load wishlist"))
      .finally(() => setLoading(false));
  }, [session, status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <EmptyState
        icon={Heart}
        title="Sign in to view your wishlist"
        description="Save your favorite pieces and come back to them anytime."
        actionLabel="Sign in"
        actionHref="/login"
      />
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Tap the heart on any product to save it here."
        actionLabel="Browse shop"
        actionHref="/shop"
      />
    );
  }

  return (
    <>
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Wishlist
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {products.length} saved {products.length === 1 ? "item" : "items"}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}

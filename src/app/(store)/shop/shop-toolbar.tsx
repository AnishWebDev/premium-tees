"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
};

type ShopToolbarProps = {
  categories: Category[];
  total: number;
};

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "new", label: "Newest" },
  { value: "best", label: "Best sellers" },
  { value: "price-asc", label: "Price: Low to high" },
  { value: "price-desc", label: "Price: High to low" },
];

export function ShopToolbar({ categories, total }: ShopToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "featured";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      if (!("page" in updates)) {
        params.delete("page");
      }

      startTransition(() => {
        router.push(`/shop?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: query.trim() || null });
  };

  return (
    <div className={cn("space-y-6", isPending && "opacity-60")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Shop
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {total} {total === 1 ? "product" : "products"}
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex w-full max-w-sm gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select
            value={category || "all"}
            onValueChange={(value) =>
              updateParams({ category: value === "all" ? null : value })
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                  {cat._count ? ` (${cat._count.products})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(value) => updateParams({ sort: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(category || searchParams.get("q") || sort !== "featured") && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
                startTransition(() => router.push("/shop"));
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

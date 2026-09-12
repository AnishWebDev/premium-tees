"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  AUDIENCE_LABELS,
  DEFAULT_AUDIENCE,
  type AudienceId,
} from "@/lib/audience";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  enabledAudiences: AudienceId[];
};

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "new", label: "Newest" },
  { value: "best", label: "Best sellers" },
  { value: "price-asc", label: "Price: Low to high" },
  { value: "price-desc", label: "Price: High to low" },
];

export function ShopToolbar({ categories, total, enabledAudiences }: ShopToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "featured";
  const audienceParam = searchParams.get("audience");
  const audience =
    audienceParam && enabledAudiences.includes(audienceParam as AudienceId)
      ? (audienceParam as AudienceId)
      : DEFAULT_AUDIENCE;

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

  const hasActiveFilters =
    category ||
    searchParams.get("q") ||
    sort !== "featured" ||
    (enabledAudiences.length > 1 && audience !== DEFAULT_AUDIENCE);

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
            <Label htmlFor="shop-search" className="sr-only">
              Search products
            </Label>
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
              aria-hidden
            />
            <Input
              id="shop-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="pl-9"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          <span>Filters</span>
        </div>

        <div className="flex flex-wrap gap-3">
          {enabledAudiences.length > 1 && (
            <div className="space-y-1.5">
              <Label htmlFor="shop-audience" className="sr-only">
                Shop by audience
              </Label>
              <Select
                value={audience}
                onValueChange={(value) =>
                  updateParams({
                    audience: value === DEFAULT_AUDIENCE ? null : value,
                  })
                }
              >
                <SelectTrigger id="shop-audience" className="w-[140px]" aria-label="Shop by audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {enabledAudiences.map((id) => (
                    <SelectItem key={id} value={id}>
                      {AUDIENCE_LABELS[id]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Select
            value={category || "all"}
            onValueChange={(value) =>
              updateParams({ category: value === "all" ? null : value })
            }
          >
            <SelectTrigger className="w-[160px]" aria-label="Filter by category">
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

          <Select value={sort} onValueChange={(value) => updateParams({ sort: value })}>
            <SelectTrigger className="w-[180px]" aria-label="Sort products">
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

          {hasActiveFilters && (
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

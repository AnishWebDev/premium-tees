"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  AUDIENCE_LABELS,
  DEFAULT_AUDIENCE,
  isKidsAudience,
  KIDS_AGE_IDS,
  KIDS_AGE_LABELS,
  resolveKidsAge,
  type AudienceId,
} from "@/lib/audience";
import { SIZES } from "@/lib/constants";
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
  const [minPriceInput, setMinPriceInput] = useState(searchParams.get("minPrice") ?? "");
  const [maxPriceInput, setMaxPriceInput] = useState(searchParams.get("maxPrice") ?? "");

  const category = searchParams.get("category") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const selectedSizes = (searchParams.get("size") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const sort = searchParams.get("sort") ?? "featured";
  const audienceParam = searchParams.get("audience");
  const audience =
    audienceParam && enabledAudiences.includes(audienceParam as AudienceId)
      ? (audienceParam as AudienceId)
      : DEFAULT_AUDIENCE;
  const ageParam = searchParams.get("age");
  const kidsAge = resolveKidsAge(ageParam ?? undefined, audience);
  const showKidsAgeFilter = isKidsAudience(audience);

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

  const toggleSize = (size: string) => {
    const next = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    updateParams({ size: next.length ? next.join(",") : null });
  };

  const applyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({
      minPrice: minPriceInput.trim() || null,
      maxPrice: maxPriceInput.trim() || null,
    });
  };

  const hasActiveFilters =
    category ||
    searchParams.get("q") ||
    minPrice ||
    maxPrice ||
    selectedSizes.length > 0 ||
    sort !== "featured" ||
    (enabledAudiences.length > 1 && audience !== DEFAULT_AUDIENCE) ||
    kidsAge !== null;

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
                onValueChange={(value) => {
                  const nextAudience = value as AudienceId;
                  updateParams({
                    audience: value === DEFAULT_AUDIENCE ? null : value,
                    age: isKidsAudience(nextAudience) ? ageParam : null,
                  });
                }}
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

          {showKidsAgeFilter && (
            <div className="space-y-1.5">
              <Label htmlFor="shop-age" className="sr-only">
                Filter by age
              </Label>
              <Select
                value={kidsAge ?? "all"}
                onValueChange={(value) =>
                  updateParams({ age: value === "all" ? null : value })
                }
              >
                <SelectTrigger id="shop-age" className="w-[150px]" aria-label="Filter by age">
                  <SelectValue placeholder="All ages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ages</SelectItem>
                  {KIDS_AGE_IDS.map((id) => (
                    <SelectItem key={id} value={id}>
                      {KIDS_AGE_LABELS[id]}
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
                setMinPriceInput("");
                setMaxPriceInput("");
                startTransition(() => router.push("/shop"));
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 rounded-2xl border border-[var(--border)] p-4 sm:grid-cols-2">
        <form onSubmit={applyPriceFilter} className="space-y-3">
          <p className="text-sm font-medium text-[var(--foreground)]">Price range (₹)</p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="shop-min-price">Min price</Label>
              <Input
                id="shop-min-price"
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="0"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-28"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shop-max-price">Max price</Label>
              <Input
                id="shop-max-price"
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="5000"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-28"
              />
            </div>
            <Button type="submit" size="sm">
              Apply
            </Button>
          </div>
        </form>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-[var(--foreground)]">Sizes</legend>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => {
              const active = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleSize(size)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "border-[var(--foreground)] bg-[var(--muted)] font-medium"
                      : "border-[var(--border)] hover:border-neutral-300"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
  );
}

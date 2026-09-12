"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "new", label: "Newest" },
  { value: "best", label: "Best sellers" },
  { value: "price-asc", label: "Price: Low to high" },
  { value: "price-desc", label: "Price: High to low" },
];

type CollectionSortToolbarProps = {
  slug: string;
};

export function CollectionSortToolbar({ slug }: CollectionSortToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const sort = searchParams.get("sort") ?? "featured";

  const updateSort = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "featured") {
        params.delete("sort");
      } else {
        params.set("sort", value);
      }
      params.delete("page");
      startTransition(() => {
        const qs = params.toString();
        router.push(qs ? `/collections/${slug}?${qs}` : `/collections/${slug}`);
      });
    },
    [router, searchParams, slug]
  );

  return (
    <div className={cn("mt-8 flex justify-end", isPending && "opacity-60")}>
      <div className="space-y-1.5">
        <Label htmlFor="collection-sort" className="sr-only">
          Sort products
        </Label>
        <Select value={sort} onValueChange={updateSort}>
          <SelectTrigger id="collection-sort" className="w-[180px]" aria-label="Sort products">
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
      </div>
    </div>
  );
}

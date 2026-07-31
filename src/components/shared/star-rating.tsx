"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  showValue?: boolean;
  className?: string;
};

export function StarRating({
  rating,
  max = 5,
  size = "sm",
  showValue = false,
  className,
}: StarRatingProps) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${rating.toFixed(1)} out of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = rating >= i + 1;
        const partial = !filled && rating > i && rating < i + 1;

        return (
          <Star
            key={i}
            className={cn(
              iconSize,
              filled || partial
                ? "fill-[var(--foreground)] text-[var(--foreground)]"
                : "fill-[var(--border)] text-[var(--border)]"
            )}
            aria-hidden
          />
        );
      })}
      {showValue && (
        <span className="ml-1 text-xs text-[var(--muted-foreground)]">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";

type MarqueeProps = {
  items: string[];
  className?: string;
  /** Seconds for one full loop */
  durationSec?: number;
  pauseOnHover?: boolean;
};

/** Endless horizontal ticker — great for lookbook tags or brand words. */
export function Marquee({
  items,
  className,
  durationSec = 28,
  pauseOnHover = true,
}: MarqueeProps) {
  const label = items.join(", ");

  return (
    <div
      role="region"
      aria-label={label}
      className={cn(
        "group relative overflow-hidden border-y border-[var(--border)] bg-[var(--muted)] py-4",
        className
      )}
    >
      {/* Screen-reader friendly static copy; visual track is decorative */}
      <p className="sr-only">{label}</p>
      <div
        aria-hidden
        className={cn(
          "flex w-max gap-10 whitespace-nowrap motion-safe:[animation:effects-marquee_linear_infinite] motion-reduce:animate-none",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{ animationDuration: `${durationSec}s` }}
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-[var(--foreground)] sm:text-base"
          >
            {item}
            <span className="ml-10 text-[var(--muted-foreground)]">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

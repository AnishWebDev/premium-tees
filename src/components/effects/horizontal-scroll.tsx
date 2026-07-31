"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type HorizontalScrollProps = {
  children: React.ReactNode;
  className?: string;
  edgePadding?: boolean;
  label?: string;
  showArrows?: boolean;
};

function getItems(scroller: HTMLElement) {
  return Array.from(
    scroller.querySelectorAll<HTMLElement>("[data-h-scroll-item]")
  );
}

function getPaddingLeft(scroller: HTMLElement) {
  return Number.parseFloat(getComputedStyle(scroller).paddingLeft) || 0;
}

/** Index of the item closest to the scroll viewport start. */
function getActiveIndex(scroller: HTMLElement) {
  const items = getItems(scroller);
  if (items.length === 0) return 0;

  const pad = getPaddingLeft(scroller);
  const mark = scroller.scrollLeft + pad;
  let best = 0;
  let bestDist = Number.POSITIVE_INFINITY;

  items.forEach((item, i) => {
    const dist = Math.abs(item.offsetLeft - mark);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  });

  return best;
}

function scrollToIndex(scroller: HTMLElement, index: number) {
  const items = getItems(scroller);
  if (items.length === 0) return;

  const clamped = Math.max(0, Math.min(items.length - 1, index));
  const pad = getPaddingLeft(scroller);
  const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
  const target = Math.min(max, Math.max(0, items[clamped].offsetLeft - pad));

  scroller.scrollTo({ left: target, behavior: "smooth" });
}

/** Native snap scroller for product cards / lookbook tiles. */
export function HorizontalScroll({
  children,
  className,
  edgePadding = true,
  label = "Horizontal product list",
  showArrows = true,
}: HorizontalScrollProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  const syncFromDom = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const items = getItems(el);
    setItemCount(items.length);
    setActiveIndex(getActiveIndex(el));
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const frame = window.requestAnimationFrame(syncFromDom);
    el.addEventListener("scroll", syncFromDom, { passive: true });
    el.addEventListener("scrollend", syncFromDom);
    const ro = new ResizeObserver(() => {
      window.requestAnimationFrame(syncFromDom);
    });
    ro.observe(el);

    return () => {
      window.cancelAnimationFrame(frame);
      el.removeEventListener("scroll", syncFromDom);
      el.removeEventListener("scrollend", syncFromDom);
      ro.disconnect();
    };
  }, [syncFromDom, children]);

  const canPrev = activeIndex > 0;
  const canNext = itemCount > 0 && activeIndex < itemCount - 1;

  const scrollBySlide = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(itemCount - 1, activeIndex + dir));
    setActiveIndex(next);
    scrollToIndex(el, next);
    window.setTimeout(syncFromDom, 400);
  };

  return (
    <div className="relative">
      {showArrows && (
        <>
          <button
            type="button"
            aria-label="Previous item"
            aria-disabled={!canPrev}
            disabled={!canPrev}
            onClick={() => scrollBySlide(-1)}
            className={cn(
              "absolute left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] shadow-sm sm:flex",
              "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-25",
              "hover:bg-[var(--muted)]"
            )}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next item"
            aria-disabled={!canNext}
            disabled={!canNext}
            onClick={() => scrollBySlide(1)}
            className={cn(
              "absolute right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] shadow-sm sm:flex",
              "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-25",
              "hover:bg-[var(--muted)]"
            )}
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </>
      )}

      <div
        ref={scrollerRef}
        role="region"
        aria-label={label}
        tabIndex={0}
        className={cn(
          "flex gap-4 overflow-x-auto pb-2 scroll-smooth",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          "snap-x snap-mandatory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
          showArrows
            ? "px-4 sm:px-14 lg:px-16"
            : edgePadding
              ? "px-4 sm:px-6 lg:px-8"
              : null,
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

type HorizontalScrollItemProps = {
  children: React.ReactNode;
  className?: string;
};

export function HorizontalScrollItem({
  children,
  className,
}: HorizontalScrollItemProps) {
  return (
    <div
      data-h-scroll-item
      className={cn(
        "w-[72vw] max-w-sm shrink-0 snap-start sm:w-[40vw] lg:w-[28vw]",
        className
      )}
    >
      {children}
    </div>
  );
}

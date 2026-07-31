"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CarouselSlide = {
  id: string;
  image: string;
  alt?: string;
  title?: string;
  subtitle?: string;
};

type CarouselProps = {
  slides: CarouselSlide[];
  className?: string;
  /** Auto-advance interval in ms (0 = off) */
  autoPlayMs?: number;
  aspectClassName?: string;
};

/** Full-bleed image carousel with optional captions. */
export function Carousel({
  slides,
  className,
  autoPlayMs = 5000,
  aspectClassName = "aspect-[16/10] sm:aspect-[21/9]",
}: CarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const count = slides.length;

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => (i + dir + count) % count);
    },
    [count]
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!autoPlayMs || count < 2 || paused || reduceMotion) return;
    const id = window.setInterval(() => go(1), autoPlayMs);
    return () => window.clearInterval(id);
  }, [autoPlayMs, count, go, index, paused, reduceMotion]);

  if (count === 0) return null;

  const slide = slides[index];
  const imageAlt = slide.alt ?? slide.title ?? "Campaign slide";

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Campaign carousel"
      className={cn(
        "relative overflow-hidden bg-[var(--muted)] text-[var(--foreground)]",
        className
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div
        className={cn("relative w-full", aspectClassName)}
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}${slide.title ? `: ${slide.title}` : ""}`}
            initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={slide.image}
              alt={imageAlt}
              fill
              sizes="100vw"
              className="object-cover"
              priority={index === 0}
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
              aria-hidden
            />
            {(slide.title || slide.subtitle) && (
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                {slide.title && (
                  <p className="font-display text-2xl font-semibold text-white sm:text-4xl">
                    {slide.title}
                  </p>
                )}
                {slide.subtitle && (
                  <p className="mt-2 max-w-xl text-sm text-white/90 sm:text-base">
                    {slide.subtitle}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(-1)}
            className="focus-ring absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/65 sm:left-5"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(1)}
            className="focus-ring absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/65 sm:right-5"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
          <div
            className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2"
            role="tablist"
            aria-label="Slide indicators"
          >
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to slide ${i + 1}${s.title ? `: ${s.title}` : ""}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "focus-ring h-2.5 min-w-2.5 rounded-full transition-all",
                  i === index ? "w-7 bg-white" : "w-2.5 bg-white/50 hover:bg-white/75"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

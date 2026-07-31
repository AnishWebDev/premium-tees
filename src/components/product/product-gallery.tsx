"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

type GalleryImage = {
  url: string;
  alt: string | null;
};

type ProductGalleryProps = {
  images: GalleryImage[];
  name: string;
};

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const activeImage = images[activeIndex] ?? images[0];

  const goTo = useCallback(
    (index: number) => {
      if (images.length === 0) return;
      setActiveIndex((index + images.length) % images.length);
    },
    [images.length]
  );

  useEffect(() => {
    if (!zoomOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(activeIndex - 1);
      if (e.key === "ArrowRight") goTo(activeIndex + 1);
      if (e.key === "Escape") setZoomOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zoomOpen, activeIndex, goTo]);

  if (!activeImage) {
    return (
      <div className="aspect-[3/4] rounded-2xl bg-[var(--muted)]" aria-hidden />
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      {images.length > 1 && (
        <div
          className="order-2 flex gap-2 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-visible"
          role="tablist"
          aria-label="Product images"
        >
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`View image ${index + 1} of ${images.length}`}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] lg:h-20 lg:w-20",
                index === activeIndex
                  ? "border-[var(--foreground)]"
                  : "border-transparent hover:border-neutral-300"
              )}
            >
              <Image
                src={image.url}
                alt={image.alt ?? `${name} thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="relative order-1 flex-1 lg:order-2">
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="group relative block aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
          aria-label="Zoom image"
        >
          <Image
            src={activeImage.url}
            alt={activeImage.alt ?? name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            priority
          />
          <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <ZoomIn className="h-4 w-4" aria-hidden />
          </span>
        </button>
      </div>

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">{name} — enlarged view</DialogTitle>
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[var(--muted)]">
            <Image
              src={activeImage.url}
              alt={activeImage.alt ?? name}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--background)] shadow-sm hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-[var(--muted-foreground)]">
                {activeIndex + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--background)] shadow-sm hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

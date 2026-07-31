"use client";

import Link from "next/link";
import { ParallaxSection, Reveal } from "@/components/effects";
import { Button } from "@/components/ui/button";

type ChapterBandProps = {
  image: string;
  chapter: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  align?: "left" | "right";
};

/** Full-viewport cinematic chapter — sparse, slow scroll. */
export function ChapterBand({
  image,
  chapter,
  title,
  body,
  ctaLabel,
  ctaHref,
  align = "left",
}: ChapterBandProps) {
  return (
    <ParallaxSection
      backgroundSrc={image}
      overlayClassName="bg-black/60"
      className="min-h-[100svh]"
    >
      <div
        className={`container-tight flex min-h-[100svh] items-center py-24 ${
          align === "right" ? "justify-end" : "justify-start"
        }`}
      >
        <Reveal
          className={`max-w-lg text-white ${align === "right" ? "text-right" : ""}`}
        >
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/85">
            {chapter}
          </p>
          <h2 className="font-display mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
            {title}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/90 sm:text-lg">
            {body}
          </p>
          <div
            className={`mt-10 ${align === "right" ? "flex justify-end" : ""}`}
          >
            <Button
              size="lg"
              asChild
              className="bg-[var(--background)] text-[var(--foreground)] hover:bg-neutral-200"
            >
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </ParallaxSection>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import type { HeroData } from "@/lib/site-content";
import { Button } from "@/components/ui/button";
import { VideoBackground } from "@/components/effects";

type MediaHeroProps = {
  content: HeroData;
};

/**
 * Nike-style media hero — shorter than cinematic, CTA-forward,
 * optional video with static image fallback.
 */
export function MediaHero({ content }: MediaHeroProps) {
  const copy = (
    <div className="container-tight flex min-h-[68vh] flex-col justify-end pb-14 pt-28 sm:min-h-[72vh] sm:pb-16">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/85">
        {content.brand}
      </p>
      <h1
        id="media-hero-heading"
        className="font-display mt-3 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
      >
        {content.headline}
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
        {content.subheadline}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          size="lg"
          asChild
          className="bg-[var(--background)] text-[var(--foreground)] hover:bg-neutral-200"
        >
          <Link href={content.primaryCtaHref}>{content.primaryCtaLabel}</Link>
        </Button>
        {content.secondaryCtaLabel ? (
          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-white/50 bg-transparent text-white hover:bg-white/10"
          >
            <Link href={content.secondaryCtaHref}>
              {content.secondaryCtaLabel}
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );

  if (content.videoUrl?.trim()) {
    return (
      <VideoBackground
        src={content.videoUrl}
        poster={content.imageUrl}
        minHeightClassName="min-h-[68vh] sm:min-h-[72vh]"
        overlayClassName="bg-black/55"
      >
        {copy}
      </VideoBackground>
    );
  }

  return (
    <section
      className="relative min-h-[68vh] overflow-hidden text-white sm:min-h-[72vh]"
      aria-labelledby="media-hero-heading"
    >
      <Image
        src={content.imageUrl}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/55" aria-hidden />
      <div className="relative z-10">{copy}</div>
    </section>
  );
}

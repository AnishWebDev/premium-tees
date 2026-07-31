"use client";

import Link from "next/link";
import type { HeroData } from "@/lib/site-content";
import { Button } from "@/components/ui/button";
import { ParallaxImage, VideoBackground } from "@/components/effects";

type HeroProps = {
  content: HeroData;
};

export function Hero({ content }: HeroProps) {
  const copy = (
    <div className="container-tight flex min-h-[92vh] flex-col justify-end pb-20 pt-32 sm:pb-28 sm:pt-40">
      <p className="fade-up font-display text-sm font-medium uppercase tracking-[0.22em] text-white/85">
        {content.brand}
      </p>
      <h1
        id="hero-heading"
        className="fade-up font-display mt-4 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl [animation-delay:100ms]"
      >
        {content.headline}
      </h1>
      <p className="fade-up mt-5 max-w-md text-base leading-relaxed text-white/90 sm:text-lg [animation-delay:200ms]">
        {content.subheadline}
      </p>
      <div className="fade-up mt-10 flex flex-wrap gap-3 [animation-delay:320ms]">
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
            className="border-white/35 bg-transparent text-white hover:bg-white/10"
          >
            <Link href={content.secondaryCtaHref}>{content.secondaryCtaLabel}</Link>
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
        minHeightClassName="min-h-[92vh]"
        overlayClassName="bg-black/55"
      >
        {copy}
      </VideoBackground>
    );
  }

  return (
    <section
      className="relative min-h-[92vh] overflow-hidden text-white"
      aria-labelledby="hero-heading"
    >
      <ParallaxImage
        src={content.imageUrl}
        alt=""
        className="absolute inset-0 h-full w-full"
        overflowPercent={36}
        strength={0.45}
        priority
      />
      <div className="absolute inset-0 bg-black/55" aria-hidden />
      <div className="relative z-10">{copy}</div>
    </section>
  );
}

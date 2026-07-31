"use client";

import Link from "next/link";
import type { HomeStoryData } from "@/lib/site-content";
import { ParallaxSection, Reveal, StickySplit } from "@/components/effects";
import { Button } from "@/components/ui/button";

type HomeStoryProps = {
  content: HomeStoryData;
  /** Use sticky split instead of full-bleed parallax */
  variant?: "parallax" | "split";
};

/** Mid-page story — copy always comes from CMS (`home.story`). */
export function HomeStory({ content, variant = "parallax" }: HomeStoryProps) {
  if (variant === "split") {
    return (
      <StickySplit
        image={content.imageUrl}
        imageAlt={content.title}
        eyebrow={content.eyebrow}
        title={content.title}
        body={content.body}
      >
        <Button size="lg" asChild>
          <Link href={content.ctaHref}>{content.ctaLabel}</Link>
        </Button>
      </StickySplit>
    );
  }

  return (
    <ParallaxSection
      backgroundSrc={content.imageUrl}
      overlayClassName="bg-black/55"
      className="min-h-[78vh]"
    >
      <div className="container-tight flex min-h-[78vh] items-center py-20">
        <Reveal className="max-w-lg text-white">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/70">
            {content.eyebrow}
          </p>
          <h2 className="font-display mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {content.title}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/75">
            {content.body}
          </p>
          <Button
            size="lg"
            asChild
            className="mt-8 bg-[var(--background)] text-[var(--foreground)] hover:bg-neutral-200"
          >
            <Link href={content.ctaHref}>{content.ctaLabel}</Link>
          </Button>
        </Reveal>
      </div>
    </ParallaxSection>
  );
}

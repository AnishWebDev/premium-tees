"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ContentCardLayout = "top" | "bottom" | "left" | "right";
export type ContentCardAnimation =
  | "none"
  | "fadeIn"
  | "fadeUp"
  | "fadeDown"
  | "fadeLeft"
  | "fadeRight"
  | "zoomIn";
export type ContentCardRadius = "none" | "sm" | "md" | "lg" | "xl" | "full";
export type ContentCardBg = "theme" | "muted" | "accent" | "custom";
export type ContentCardPadding = "sm" | "md" | "lg";
export type ContentCardAspect = "auto" | "video" | "square" | "portrait";

export type ContentCardProps = {
  eyebrow?: string;
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Image, GIF, or poster URL */
  imageUrl?: string;
  /** Optional looping video (.mp4 / .webm). Wins over image when set. */
  videoUrl?: string;
  layout?: ContentCardLayout;
  animation?: ContentCardAnimation;
  borderRadius?: ContentCardRadius;
  background?: ContentCardBg;
  backgroundColor?: string;
  textColor?: string;
  padding?: ContentCardPadding;
  mediaAspect?: ContentCardAspect;
  className?: string;
  /** When false, skip section/container chrome (for grids). */
  framed?: boolean;
};

const RADIUS: Record<ContentCardRadius, string> = {
  none: "rounded-none",
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  xl: "rounded-3xl",
  full: "rounded-[2rem]",
};

const PADDING: Record<ContentCardPadding, string> = {
  sm: "p-4 sm:p-5",
  md: "p-6 sm:p-8",
  lg: "p-8 sm:p-12",
};

const ASPECT: Record<ContentCardAspect, string> = {
  auto: "aspect-[4/3]",
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
};

function animationProps(kind: ContentCardAnimation) {
  switch (kind) {
    case "fadeIn":
      return { initial: { opacity: 0 }, animate: { opacity: 1 } };
    case "fadeUp":
      return { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 } };
    case "fadeDown":
      return { initial: { opacity: 0, y: -28 }, animate: { opacity: 1, y: 0 } };
    case "fadeLeft":
      return { initial: { opacity: 0, x: 32 }, animate: { opacity: 1, x: 0 } };
    case "fadeRight":
      return { initial: { opacity: 0, x: -32 }, animate: { opacity: 1, x: 0 } };
    case "zoomIn":
      return {
        initial: { opacity: 0, scale: 0.94 },
        animate: { opacity: 1, scale: 1 },
      };
    case "none":
    default:
      return null;
  }
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url) || url.includes("video");
}

function isGifUrl(url: string) {
  return /\.gif(\?|$)/i.test(url);
}

/**
 * Flexible media + copy card for the homepage builder.
 * Layout: media top / bottom / left / right with style + entrance animation.
 */
export function ContentCard({
  eyebrow,
  title,
  body,
  ctaLabel,
  ctaHref,
  imageUrl,
  videoUrl,
  layout = "left",
  animation = "fadeUp",
  borderRadius = "lg",
  background = "muted",
  backgroundColor,
  textColor,
  padding = "md",
  mediaAspect = "video",
  className,
  framed = true,
}: ContentCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const motionConfig = animationProps(animation);

  const mediaSrc = videoUrl?.trim() || imageUrl?.trim() || "";
  const useVideo =
    Boolean(videoUrl?.trim()) || (mediaSrc && isVideoUrl(mediaSrc));
  const horizontal = layout === "left" || layout === "right";
  const showMediaFirst = layout === "top" || layout === "left";

  const bgClass =
    background === "custom"
      ? undefined
      : background === "muted"
        ? "bg-[var(--muted)]"
        : background === "accent"
          ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
          : "bg-[var(--background)]";

  const style: React.CSSProperties = {};
  if (background === "custom" && backgroundColor?.trim()) {
    style.backgroundColor = backgroundColor.trim();
  }
  if (textColor?.trim() && background !== "accent") {
    style.color = textColor.trim();
  }

  const media = mediaSrc ? (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-black/5",
        ASPECT[mediaAspect],
        horizontal ? "min-h-[220px] sm:min-h-full sm:h-full" : null
      )}
    >
      {useVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={videoUrl?.trim() || mediaSrc}
          poster={imageUrl?.trim() || undefined}
          autoPlay
          muted
          loop
          playsInline
          aria-label={title || "Card media"}
        />
      ) : (
        <Image
          src={mediaSrc}
          alt={title || ""}
          fill
          unoptimized={isGifUrl(mediaSrc)}
          className="object-cover"
          sizes={horizontal ? "(max-width: 768px) 100vw, 50vw" : "100vw"}
        />
      )}
    </div>
  ) : (
    <div
      className={cn(
        "flex items-center justify-center bg-[var(--border)]/40 text-sm text-[var(--muted-foreground)]",
        ASPECT[mediaAspect]
      )}
    >
      Add media URL
    </div>
  );

  const copy = (
    <div className={cn("flex flex-col justify-center", PADDING[padding])}>
      {eyebrow?.trim() ? (
        <p className="text-xs font-medium uppercase tracking-[0.2em] opacity-70">
          {eyebrow.trim()}
        </p>
      ) : null}
      {title?.trim() ? (
        <h2
          className={cn(
            "font-display text-xl font-semibold tracking-tight sm:text-2xl",
            eyebrow?.trim() ? "mt-2" : null
          )}
        >
          {title.trim()}
        </h2>
      ) : null}
      {body?.trim() ? (
        <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed opacity-80 sm:text-base">
          {body.trim()}
        </div>
      ) : null}
      {ctaLabel?.trim() && ctaHref?.trim() ? (
        <div className="relative z-10 mt-6">
          <Button asChild>
            <Link href={ctaHref.trim()}>{ctaLabel.trim()}</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );

  const inner = (
    <div
      className={cn(
        "relative h-full overflow-hidden border border-[var(--border)] transition-shadow duration-200 hover:shadow-lg after:pointer-events-none after:absolute after:inset-0 after:bg-black/0 after:transition-colors after:content-[''] hover:after:bg-black/5",
        RADIUS[borderRadius],
        bgClass,
        horizontal
          ? "grid sm:grid-cols-2 sm:items-stretch"
          : "flex flex-col",
        className
      )}
      style={style}
    >
      {showMediaFirst ? (
        <>
          {media}
          {copy}
        </>
      ) : (
        <>
          {copy}
          {media}
        </>
      )}
    </div>
  );

  const animated = motionConfig ? (
    <motion.div
      initial={motionConfig.initial}
      animate={inView ? motionConfig.animate : motionConfig.initial}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      {inner}
    </motion.div>
  ) : (
    inner
  );

  if (!framed) {
    return (
      <div ref={ref} className="h-full">
        {animated}
      </div>
    );
  }

  return (
    <section className="section-padding">
      <div className="container-tight" ref={ref}>
        {animated}
      </div>
    </section>
  );
}

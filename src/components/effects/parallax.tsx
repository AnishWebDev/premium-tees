"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type ParallaxImageProps = {
  src: string;
  alt?: string;
  className?: string;
  /** Extra height % so the image can move (default 30) */
  overflowPercent?: number;
  /** Parallax travel strength 0–1 (default 0.35) */
  strength?: number;
  priority?: boolean;
};

/** Image that drifts slower than scroll — wrap in a fixed-height container. */
export function ParallaxImage({
  src,
  alt = "",
  className,
  overflowPercent = 30,
  strength = 0.35,
  priority,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`-${overflowPercent * strength}%`, `${overflowPercent * strength}%`]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        style={{ y, height: `${100 + overflowPercent}%`, top: `-${overflowPercent / 2}%` }}
        className="absolute inset-x-0"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          className="object-cover"
          priority={priority}
        />
      </motion.div>
    </div>
  );
}

type ParallaxSectionProps = {
  children: React.ReactNode;
  className?: string;
  /** Background image (optional) */
  backgroundSrc?: string;
  overlayClassName?: string;
};

/** Full-width section with optional parallax background + foreground content. */
export function ParallaxSection({
  children,
  className,
  backgroundSrc,
  overlayClassName = "bg-black/40",
}: ParallaxSectionProps) {
  return (
    <section className={cn("relative min-h-[70vh] overflow-hidden", className)}>
      {backgroundSrc ? (
        <ParallaxImage
          src={backgroundSrc}
          className="absolute inset-0 h-full w-full"
          overflowPercent={40}
          strength={0.4}
        />
      ) : null}
      <div className={cn("absolute inset-0", overlayClassName)} aria-hidden />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

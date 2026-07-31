"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type VideoBackgroundProps = {
  /** MP4/WebM URL (Cloudinary, CDN, or /public file) */
  src: string;
  poster?: string;
  className?: string;
  /** Overlay for readability */
  overlayClassName?: string;
  children?: React.ReactNode;
  /** min-h classes */
  minHeightClassName?: string;
};

/**
 * Muted looping video as a full-bleed background with content on top.
 * Prefer compressed MP4 (~720p). Always provide a poster for LCP.
 * Falls back to poster image when the user prefers reduced motion.
 */
export function VideoBackground({
  src,
  poster,
  className,
  overlayClassName = "bg-black/45",
  children,
  minHeightClassName = "min-h-[85vh]",
}: VideoBackgroundProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section
      className={cn(
        "relative flex w-full items-end overflow-hidden text-white",
        minHeightClassName,
        className
      )}
    >
      {reduceMotion && poster ? (
        <Image
          src={poster}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
      )}
      <div className={cn("absolute inset-0", overlayClassName)} aria-hidden />
      <div className="relative z-10 w-full">{children}</div>
    </section>
  );
}

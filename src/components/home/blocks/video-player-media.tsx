"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  toEmbedSrc,
  withEmbedPlayback,
} from "@/components/home/blocks/embed-frame";
import { RemoteImage } from "@/components/shared/remote-image";
import { cn } from "@/lib/utils";

type VideoPlayerMediaProps = {
  title: string;
  videoUrl?: string;
  embedUrl?: string;
  posterImageUrl?: string;
  aspectClass: string;
  roundedClass: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  showControls?: boolean;
};

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url.trim());
}

export function VideoPlayerMedia({
  title,
  videoUrl = "",
  embedUrl = "",
  posterImageUrl = "",
  aspectClass,
  roundedClass,
  autoplay = false,
  muted = true,
  loop = false,
  showControls = true,
}: VideoPlayerMediaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  const directSrc = videoUrl.trim();
  const embedSrcRaw = embedUrl.trim();
  const direct = directSrc ? isDirectVideo(directSrc) : false;
  const baseIframeSrc =
    !direct && embedSrcRaw
      ? toEmbedSrc(embedSrcRaw)
      : !direct && directSrc
        ? toEmbedSrc(directSrc)
        : null;
  const nativeSrc = direct ? directSrc : null;

  const iframeSrc = useMemo(() => {
    if (!baseIframeSrc) return null;
    return withEmbedPlayback(baseIframeSrc, {
      autoplay: autoplay && inView,
      muted: muted || autoplay,
      loop,
    });
  }, [autoplay, baseIframeSrc, inView, loop, muted]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !autoplay) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setInView(entry.isIntersecting && entry.intersectionRatio >= 0.35);
      },
      { threshold: [0, 0.35, 0.6] }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [autoplay, baseIframeSrc, nativeSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !nativeSrc || !autoplay) return;

    if (inView) {
      void video.play().catch(() => {
        /* autoplay blocked */
      });
    } else {
      video.pause();
    }
  }, [autoplay, inView, nativeSrc]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-[var(--muted)]",
        aspectClass,
        roundedClass
      )}
    >
      {nativeSrc ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={nativeSrc}
          poster={posterImageUrl.trim() || undefined}
          controls={showControls}
          muted={muted || autoplay}
          loop={loop}
          playsInline
          preload={autoplay ? "metadata" : "none"}
          title={title}
        />
      ) : iframeSrc ? (
        <iframe
          key={iframeSrc}
          src={iframeSrc}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : posterImageUrl.trim() ? (
        <RemoteImage
          src={posterImageUrl}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1200px"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-[var(--muted-foreground)]">
          Add a video file URL (.mp4) or a YouTube / Vimeo link in Page content.
        </div>
      )}
    </div>
  );
}

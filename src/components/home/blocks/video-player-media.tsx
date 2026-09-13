"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  toEmbedSrc,
  withEmbedPlayback,
} from "@/components/home/blocks/embed-frame";
import { RemoteImage } from "@/components/shared/remote-image";
import {
  activateVideoPlayer,
  isYoutubePlayingMessage,
  pauseEmbedIframe,
  registerVideoPlayer,
} from "@/lib/video-playback-coordinator";
import { cn } from "@/lib/utils";

type VideoPlayerMediaProps = {
  playerId?: string;
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
  playerId: playerIdProp,
  title,
  videoUrl = "",
  embedUrl = "",
  posterImageUrl = "",
  aspectClass,
  roundedClass,
  autoplay = false,
  muted = true,
  loop = true,
  showControls = true,
}: VideoPlayerMediaProps) {
  const generatedId = useId();
  const playerId = playerIdProp ?? generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [inView, setInView] = useState(false);
  const [embedOrigin, setEmbedOrigin] = useState("");

  useEffect(() => {
    setEmbedOrigin(window.location.origin);
  }, []);

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
      muted,
      loop,
      origin: embedOrigin || undefined,
    });
  }, [autoplay, baseIframeSrc, embedOrigin, inView, loop, muted]);

  const pausePlayback = useCallback(() => {
    const video = videoRef.current;
    if (video && !video.paused) {
      video.pause();
    }
    const iframe = iframeRef.current;
    if (iframe && iframeSrc) {
      pauseEmbedIframe(iframe, iframeSrc);
    }
  }, [iframeSrc]);

  const claimPlayback = useCallback(() => {
    activateVideoPlayer(playerId);
  }, [playerId]);

  useEffect(() => {
    return registerVideoPlayer(playerId, pausePlayback);
  }, [pausePlayback, playerId]);

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
    if (!video || !nativeSrc) return;
    video.muted = muted;
    video.loop = loop;
  }, [loop, muted, nativeSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !nativeSrc) return;

    const onPlay = () => claimPlayback();
    video.addEventListener("play", onPlay);
    return () => video.removeEventListener("play", onPlay);
  }, [claimPlayback, nativeSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !nativeSrc || !autoplay) return;

    if (inView) {
      claimPlayback();
      void video.play().catch(() => {
        /* autoplay blocked */
      });
    } else {
      video.pause();
    }
  }, [autoplay, claimPlayback, inView, nativeSrc]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframeSrc || !autoplay || !inView) return;
    claimPlayback();
  }, [autoplay, claimPlayback, iframeSrc, inView]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframeSrc?.includes("youtube")) return;

    const onMessage = (event: MessageEvent) => {
      if (!isYoutubePlayingMessage(event, iframe)) return;
      claimPlayback();
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [claimPlayback, iframeSrc]);

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
          muted={muted}
          loop={loop}
          playsInline
          preload={autoplay ? "metadata" : "none"}
          title={title}
        />
      ) : iframeSrc ? (
        <iframe
          ref={iframeRef}
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

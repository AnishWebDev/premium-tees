import Link from "next/link";
import {
  galleryAspectClass,
  galleryBandClass,
  galleryRoundedClass,
} from "@/components/home/blocks/image-gallery";
import { toEmbedSrc } from "@/components/home/blocks/embed-frame";
import { RemoteImage } from "@/components/shared/remote-image";
import { isSettingEnabled } from "@/lib/promo-schedule";
import { cn } from "@/lib/utils";

type VideoPlayerBlockProps = {
  title: string;
  subtitle?: string;
  /** Direct .mp4 / .webm file */
  videoUrl?: string;
  /** YouTube / Vimeo URL */
  embedUrl?: string;
  posterImageUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
  mediaAspect?: string;
  borderRadius?: string;
  bgStyle?: string;
  backgroundColor?: string;
  textColor?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  showControls?: boolean;
};

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url.trim());
}

export function VideoPlayerBlock({
  title,
  subtitle,
  videoUrl = "",
  embedUrl = "",
  posterImageUrl = "",
  ctaLabel,
  ctaHref,
  mediaAspect = "video",
  borderRadius = "lg",
  bgStyle = "theme",
  backgroundColor = "",
  textColor = "",
  autoplay = false,
  muted = true,
  loop = false,
  showControls = true,
}: VideoPlayerBlockProps) {
  const directSrc = videoUrl.trim();
  const embedSrc = embedUrl.trim();
  const direct = directSrc ? isDirectVideo(directSrc) : false;
  const iframeSrc =
    !direct && embedSrc ? toEmbedSrc(embedSrc) : !direct && directSrc ? toEmbedSrc(directSrc) : null;
  const nativeSrc = direct ? directSrc : null;
  const aspectClass = galleryAspectClass(mediaAspect);
  const roundedClass = galleryRoundedClass(borderRadius);
  const bandClass = galleryBandClass(bgStyle, backgroundColor);
  const customBg = backgroundColor?.trim();
  const customColor = textColor?.trim();

  return (
    <section
      className={cn("section-padding", bandClass)}
      style={customBg ? { backgroundColor: customBg } : undefined}
      aria-labelledby="video-player-heading"
    >
      <div className="container-tight">
        <h2
          id="video-player-heading"
          className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
          style={customColor ? { color: customColor } : undefined}
        >
          {title}
        </h2>
        {subtitle?.trim() ? (
          <p
            className="mt-2 max-w-2xl text-sm text-[var(--muted-foreground)]"
            style={customColor ? { color: customColor, opacity: 0.85 } : undefined}
          >
            {subtitle}
          </p>
        ) : null}

        <div
          className={cn(
            "relative mt-8 overflow-hidden bg-[var(--muted)]",
            aspectClass,
            roundedClass
          )}
        >
          {nativeSrc ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={nativeSrc}
              poster={posterImageUrl.trim() || undefined}
              controls={showControls}
              autoPlay={autoplay}
              muted={muted || autoplay}
              loop={loop}
              playsInline
              title={title}
            />
          ) : iframeSrc ? (
            <iframe
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

        {ctaLabel?.trim() && ctaHref?.trim() ? (
          <div className="mt-6">
            <Link href={ctaHref} className="theme-link text-sm font-medium">
              {ctaLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function videoPlayerSettingsFromProps(props: {
  settingAutoplay?: string;
  settingMuted?: string;
  settingLoop?: string;
  settingShowControls?: string;
}) {
  return {
    autoplay: isSettingEnabled(props.settingAutoplay),
    muted: isSettingEnabled(props.settingMuted),
    loop: isSettingEnabled(props.settingLoop),
    showControls: props.settingShowControls
      ? isSettingEnabled(props.settingShowControls)
      : true,
  };
}

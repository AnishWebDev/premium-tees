import Link from "next/link";
import {
  galleryAspectClass,
  galleryBandClass,
  galleryRoundedClass,
} from "@/components/home/blocks/image-gallery";
import { VideoPlayerMedia } from "@/components/home/blocks/video-player-media";
import { isSettingEnabled } from "@/lib/promo-schedule";
import { cn } from "@/lib/utils";

type VideoPlayerBlockProps = {
  title: string;
  subtitle?: string;
  videoUrl?: string;
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

        <div className="mt-8">
          <VideoPlayerMedia
            title={title}
            videoUrl={videoUrl}
            embedUrl={embedUrl}
            posterImageUrl={posterImageUrl}
            aspectClass={aspectClass}
            roundedClass={roundedClass}
            autoplay={autoplay}
            muted={muted}
            loop={loop}
            showControls={showControls}
          />
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
    muted:
      props.settingMuted?.trim()
        ? isSettingEnabled(props.settingMuted)
        : true,
    loop: isSettingEnabled(props.settingLoop),
    showControls: props.settingShowControls
      ? isSettingEnabled(props.settingShowControls)
      : true,
  };
}

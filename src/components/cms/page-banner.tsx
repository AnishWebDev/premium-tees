import { RemoteImage } from "@/components/shared/remote-image";
import {
  pageBannerPaddingStyle,
  pageBannerTextAlignClass,
  type ResolvedPageBanner,
} from "@/lib/page-banner";
import { cn } from "@/lib/utils";

type PageBannerProps = {
  banner: ResolvedPageBanner;
};

export function PageBanner({ banner }: PageBannerProps) {
  if (!banner.enabled) return null;

  const hasBgImage = banner.backgroundImageUrl.trim().length > 0;
  const hasBgColor = banner.backgroundColor.trim().length > 0;
  const alignClass = pageBannerTextAlignClass(banner.textAlign);

  return (
    <section
      className="relative border-b border-[var(--border)] overflow-hidden"
      style={{
        backgroundColor: hasBgColor ? banner.backgroundColor : undefined,
        ...(!hasBgImage ? pageBannerPaddingStyle(banner) : undefined),
      }}
      aria-labelledby="page-banner-heading"
    >
      {hasBgImage ? (
        <>
          <RemoteImage
            src={banner.backgroundImageUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0 bg-[var(--background)]/75"
            aria-hidden
          />
        </>
      ) : !hasBgColor ? (
        <div className="absolute inset-0 bg-[var(--muted)]/35" aria-hidden />
      ) : null}

      <div
        className={cn(
          "container-tight relative z-10 flex flex-col",
          alignClass,
          hasBgImage && "py-10 md:py-14"
        )}
        style={hasBgImage ? pageBannerPaddingStyle(banner) : undefined}
      >
        <div
          className={cn(
            "flex w-full max-w-3xl flex-col",
            alignClass,
            banner.textAlign === "center" && "mx-auto",
            banner.textAlign === "right" && "ml-auto mr-0"
          )}
        >
          <h1
            id="page-banner-heading"
            className="font-display text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl"
          >
            {banner.displayTitle}
          </h1>
          {banner.displayDescription ? (
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
              {banner.displayDescription}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

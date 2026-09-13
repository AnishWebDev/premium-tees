import Link from "next/link";
import { RemoteImage } from "@/components/shared/remote-image";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";

export type GalleryImage = {
  id: string;
  image: string;
  alt: string;
  title?: string;
  caption?: string;
  href?: string;
};

type ImageGalleryProps = {
  title?: string;
  subtitle?: string;
  images: GalleryImage[];
  columns?: number;
  aspectClass?: string;
  roundedClass?: string;
  bandClass?: string;
  backgroundColor?: string;
};

const ROUNDED: Record<string, string> = {
  none: "rounded-none",
  sm: "rounded-md",
  md: "rounded-xl",
  lg: "rounded-2xl",
  xl: "rounded-3xl",
  full: "rounded-[2rem]",
};

export function ImageGallery({
  title,
  subtitle,
  images,
  columns = 3,
  aspectClass = "aspect-square",
  roundedClass = "rounded-xl",
  bandClass,
  backgroundColor,
}: ImageGalleryProps) {
  const visible = images.filter((img) => img.image.trim());
  if (visible.length === 0) return null;

  const colCount = Math.min(6, Math.max(2, columns));
  const gridClass =
    colCount === 2
      ? "grid-cols-2"
      : colCount === 3
        ? "grid-cols-2 sm:grid-cols-3"
        : colCount === 4
          ? "grid-cols-2 sm:grid-cols-4"
          : colCount === 5
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6";

  return (
    <section
      className={cn("section-padding", bandClass)}
      style={
        backgroundColor?.trim()
          ? { backgroundColor: backgroundColor.trim() }
          : undefined
      }
    >
      <div className="container-tight">
        {title || subtitle ? (
          <SectionHeading
            title={title ?? ""}
            subtitle={subtitle}
            align="center"
            className="justify-center"
          />
        ) : null}

        <div
          className={cn(
            "grid gap-2 sm:gap-3",
            gridClass,
            (title || subtitle) && "mt-10"
          )}
        >
          {visible.map((item) => {
            const inner = (
              <>
                <RemoteImage
                  src={item.image}
                  alt={item.alt || item.title || "Gallery image"}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {(item.title || item.caption) && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950/80 to-transparent p-3 sm:p-4">
                    {item.title ? (
                      <p className="font-display text-sm font-semibold text-white sm:text-base">
                        {item.title}
                      </p>
                    ) : null}
                    {item.caption ? (
                      <p className="mt-0.5 text-xs text-white/85">{item.caption}</p>
                    ) : null}
                  </div>
                )}
              </>
            );

            const tileClass = cn(
              "group relative overflow-hidden bg-[var(--muted)]",
              aspectClass,
              roundedClass
            );

            if (item.href?.trim()) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    tileClass,
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  )}
                  aria-label={item.title || item.alt || "Gallery image"}
                >
                  {inner}
                </Link>
              );
            }

            return (
              <div key={item.id} className={tileClass}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function galleryAspectClass(mediaAspect?: string): string {
  switch (mediaAspect) {
    case "video":
      return "aspect-video";
    case "portrait":
      return "aspect-[3/4]";
    case "auto":
      return "aspect-[4/3]";
    default:
      return "aspect-square";
  }
}

export function galleryRoundedClass(borderRadius?: string): string {
  return ROUNDED[borderRadius ?? "md"] ?? ROUNDED.md;
}

export { galleryBandClass } from "@/lib/surface-context";

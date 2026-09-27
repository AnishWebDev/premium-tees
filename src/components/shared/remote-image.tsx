import Image, { type ImageProps } from "next/image";
import { cloudinaryDisplayUrl, normalizeImageUrl } from "@/lib/image-url";

/** Hosts allowed through Next.js image optimization (see next.config.ts). */
const OPTIMIZED_HOSTS = new Set([
  "images.unsplash.com",
  "images.pexels.com",
  "res.cloudinary.com",
  "lh3.googleusercontent.com",
]);

function deliveryWidthFromSizes(sizes: string | undefined): number {
  if (!sizes) return 1920;
  if (sizes.includes("100vw")) return 2560;
  const match = sizes.match(/(\d+)px/);
  if (match) return Math.min(3840, Math.max(640, Number.parseInt(match[1], 10) * 2));
  return 1920;
}

function resolveSrc(
  src: ImageProps["src"],
  sizes: string | undefined
): ImageProps["src"] {
  if (typeof src !== "string") return src;
  const trimmed = src.trim();
  if (!trimmed) return src;
  const normalized = normalizeImageUrl(trimmed);
  if (normalized.includes("res.cloudinary.com")) {
    return cloudinaryDisplayUrl(normalized, {
      width: deliveryWidthFromSizes(sizes),
      quality: "auto:good",
    });
  }
  return normalized;
}

function shouldOptimize(src: ImageProps["src"]): boolean {
  if (typeof src !== "string") return true;
  if (src.startsWith("/")) return true;
  try {
    const { protocol, hostname } = new URL(src);
    if (protocol !== "https:" && protocol !== "http:") return false;
    return OPTIMIZED_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

/** Image that accepts any https URL — unknown hosts load directly (unoptimized). */
export function RemoteImage({
  src,
  unoptimized,
  alt = "",
  ...props
}: ImageProps) {
  const resolved = resolveSrc(src, props.sizes);
  const isCloudinary =
    typeof resolved === "string" && resolved.includes("res.cloudinary.com");
  const optimize =
    !isCloudinary &&
    typeof resolved === "string" &&
    resolved.startsWith("http")
      ? shouldOptimize(resolved)
      : !isCloudinary;

  return (
    <Image
      {...props}
      src={resolved}
      alt={alt}
      quality={props.quality ?? (isCloudinary ? undefined : 85)}
      unoptimized={unoptimized ?? !optimize}
    />
  );
}

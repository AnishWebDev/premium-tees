import Image, { type ImageProps } from "next/image";
import { normalizeImageUrl } from "@/lib/image-url";

/** Hosts allowed through Next.js image optimization (see next.config.ts). */
const OPTIMIZED_HOSTS = new Set([
  "images.unsplash.com",
  "images.pexels.com",
  "res.cloudinary.com",
  "lh3.googleusercontent.com",
]);

function resolveSrc(src: ImageProps["src"]): ImageProps["src"] {
  if (typeof src !== "string") return src;
  const trimmed = src.trim();
  return trimmed ? normalizeImageUrl(trimmed) : src;
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
export function RemoteImage({ src, unoptimized, ...props }: ImageProps) {
  const resolved = resolveSrc(src);
  const optimize =
    typeof resolved === "string" && resolved.startsWith("http")
      ? shouldOptimize(resolved)
      : true;

  return (
    <Image
      {...props}
      src={resolved}
      unoptimized={unoptimized ?? !optimize}
    />
  );
}

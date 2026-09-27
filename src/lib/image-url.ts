/** Known dead Unsplash IDs → working replacements (avoids Next image 404 overlay). */
const UNSPLASH_REPLACEMENTS: Record<string, string> = {
  "photo-1622445275463-afa12ab34d44":
    "photo-1556821840-3a63f95609a7",
  "photo-1586367262704-6587a398b0f1":
    "photo-1571019614242-c5c5dee9f50b",
};

/** Pexels photo page URL → CDN image URL (Next.js cannot load pexels.com pages as images). */
function pexelsPageToCdn(url: string): string | null {
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?pexels\.com\/photo\/(?:[\w%-]*-)?(\d+)\/?(?:\?.*)?$/i
  );
  if (!match) return null;
  const id = match[1];
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1920`;
}

type CloudinaryDisplayOptions = {
  /** Max width for delivery (long edge for limit crop). */
  width?: number;
  quality?: "auto" | "auto:good" | "auto:best" | "90";
};

/** Apply Cloudinary delivery transforms (format, quality, max width). */
export function cloudinaryDisplayUrl(
  url: string,
  { width = 2560, quality = "auto:good" }: CloudinaryDisplayOptions = {}
): string {
  const trimmed = url.trim();
  if (!trimmed.includes("res.cloudinary.com") || !trimmed.includes("/upload/")) {
    return trimmed;
  }
  if (/\/upload\/[^/]*(?:f_|q_|w_|c_)/.test(trimmed)) {
    return trimmed;
  }
  const qualityToken = quality === "90" ? "q_90" : `q_${quality}`;
  const transform = `f_auto,${qualityToken},w_${width},c_limit`;
  return trimmed.replace(/\/upload\/((?:v\d+\/)?)/, `/upload/${transform}/$1`);
}

export function normalizeImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  const pexelsCdn = pexelsPageToCdn(trimmed);
  if (pexelsCdn) return pexelsCdn;

  let next = trimmed;
  for (const [broken, replacement] of Object.entries(UNSPLASH_REPLACEMENTS)) {
    if (next.includes(broken)) {
      next = next.replace(broken, replacement);
    }
  }
  return next;
}

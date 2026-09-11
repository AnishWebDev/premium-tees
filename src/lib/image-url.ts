/** Known dead Unsplash IDs → working replacements (avoids Next image 404 overlay). */
const UNSPLASH_REPLACEMENTS: Record<string, string> = {
  "photo-1622445275463-afa12ab34d44":
    "photo-1556821840-3a63f95609a7",
  "photo-1586367262704-6587a398b0f1":
    "photo-1571019614242-c5c5dee9f50b",
};

export function normalizeImageUrl(url: string): string {
  let next = url;
  for (const [broken, replacement] of Object.entries(UNSPLASH_REPLACEMENTS)) {
    if (next.includes(broken)) {
      next = next.replace(broken, replacement);
    }
  }
  return next;
}

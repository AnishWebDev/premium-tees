type ProductImage = { url: string; alt: string | null };
type VariantColor = { color: string; colorHex?: string | null; colorImageUrl?: string | null };

/** Thumbnail for a color swatch — variant URL, alt-text match, then image order, then null. */
export function resolveColorThumbnail(
  color: string,
  colorOrder: string[],
  variants: VariantColor[],
  images: ProductImage[]
): string | null {
  const variant = variants.find((v) => v.color === color);
  if (variant?.colorImageUrl?.trim()) {
    return variant.colorImageUrl.trim();
  }

  const colorLower = color.toLowerCase();
  const byAlt = images.find((img) => img.alt?.toLowerCase().includes(colorLower));
  if (byAlt?.url) return byAlt.url;

  const index = colorOrder.indexOf(color);
  if (index >= 0 && images[index]?.url) {
    return images[index]!.url;
  }

  return images[0]?.url ?? null;
}

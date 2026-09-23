"use client";

import { useCallback, useMemo, useState } from "react";
import type { SizeGuideData } from "@/lib/cms-content";
import { resolveColorThumbnail } from "@/lib/product-color-image";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";

type ProductDetailShellProps = {
  product: React.ComponentProps<typeof ProductInfo>["product"];
  sizeGuide?: SizeGuideData;
  pincodeDeliveryDays?: string;
};

export function ProductDetailShell({
  product,
  sizeGuide,
  pincodeDeliveryDays,
}: ProductDetailShellProps) {
  const colors = useMemo(
    () => [...new Set(product.variants.map((v) => v.color))],
    [product.variants]
  );

  const [galleryIndex, setGalleryIndex] = useState(0);

  const onColorChange = useCallback(
    (color: string) => {
      const thumb = resolveColorThumbnail(color, colors, product.variants, product.images);
      if (!thumb) return;
      const index = product.images.findIndex((img) => img.url === thumb);
      if (index >= 0) setGalleryIndex(index);
    },
    [colors, product.images, product.variants]
  );

  return (
    <>
      <ProductGallery
        images={product.images.map((img) => ({ url: img.url, alt: img.alt }))}
        name={product.name}
        activeIndex={galleryIndex}
        onActiveIndexChange={setGalleryIndex}
      />
      <ProductInfo
        product={product}
        sizeGuide={sizeGuide}
        pincodeDeliveryDays={pincodeDeliveryDays}
        onColorChange={onColorChange}
      />
    </>
  );
}

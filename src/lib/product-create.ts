import { toPrismaAudience, toPrismaKidsAge } from "@/lib/audience";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { ProductInput } from "@/lib/validations/product";

export class ProductCreateError extends Error {
  constructor(
    public code: "CONFLICT" | "VALIDATION",
    message: string
  ) {
    super(message);
    this.name = "ProductCreateError";
  }
}

export async function createProduct(data: ProductInput) {
  const slug = data.slug ?? slugify(data.name);

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    throw new ProductCreateError("CONFLICT", `Product slug "${slug}" already exists`);
  }

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      shortDesc: data.shortDesc,
      price: data.price,
      compareAt: data.compareAt,
      featured: data.featured,
      bestSeller: data.bestSeller,
      newArrival: data.newArrival,
      active: data.active,
      audience: toPrismaAudience(data.audience),
      kidsAge: data.kidsAge ? toPrismaKidsAge(data.kidsAge) : null,
      material: data.material,
      fit: data.fit,
      care: data.care,
      origin: data.origin,
      tags: data.tags,
      metaTitle: data.metaTitle,
      metaDesc: data.metaDesc,
      categoryId: data.categoryId,
      images: {
        create: data.images.map((img, index) => ({
          url: img.url,
          alt: img.alt,
          publicId: img.publicId,
          sortOrder: img.sortOrder ?? index,
        })),
      },
      variants: {
        create: data.variants.map((variant) => ({
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex,
          sku:
            variant.sku ??
            `${slug.toUpperCase().replace(/-/g, "")}-${variant.color.toUpperCase().slice(0, 3)}-${variant.size}`,
          price: variant.price,
          inventory: {
            create: {
              quantity: variant.quantity,
              lowStock: 5,
            },
          },
        })),
      },
    },
    include: {
      images: true,
      variants: { include: { inventory: true } },
      category: true,
    },
  });

  return {
    ...product,
    price: Number(product.price),
    compareAt: product.compareAt ? Number(product.compareAt) : null,
    variants: product.variants.map((v) => ({
      ...v,
      price: v.price ? Number(v.price) : null,
    })),
  };
}

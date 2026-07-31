import { prisma } from "@/lib/prisma";
import type { ProductCardData } from "@/types";
import { Prisma } from "@prisma/client";

function toCard(
  product: {
    id: string;
    name: string;
    slug: string;
    price: Prisma.Decimal | number;
    compareAt: Prisma.Decimal | number | null;
    shortDesc: string | null;
    featured: boolean;
    bestSeller: boolean;
    newArrival: boolean;
    images: { url: string; alt: string | null }[];
    category: { name: string; slug: string };
    reviews?: { rating: number }[];
    _count?: { reviews: number };
  }
): ProductCardData {
  const reviews = product.reviews ?? [];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : undefined;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    compareAt: product.compareAt ? Number(product.compareAt) : null,
    shortDesc: product.shortDesc,
    featured: product.featured,
    bestSeller: product.bestSeller,
    newArrival: product.newArrival,
    images: product.images,
    category: product.category,
    averageRating,
    reviewCount: product._count?.reviews ?? reviews.length,
  };
}

const cardInclude = {
  images: { orderBy: { sortOrder: "asc" as const }, take: 2 },
  category: { select: { name: true, slug: true } },
  reviews: { where: { approved: true }, select: { rating: true } },
  _count: { select: { reviews: true } },
};

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error("[products]", error);
    return fallback;
  }
}

export async function getFeaturedProducts(limit = 8) {
  return safeQuery(async () => {
    const products = await prisma.product.findMany({
      where: { active: true, featured: true },
      include: cardInclude,
      take: limit,
      orderBy: { updatedAt: "desc" },
    });
    return products.map(toCard);
  }, []);
}

export async function getBestSellers(limit = 8) {
  return safeQuery(async () => {
    const products = await prisma.product.findMany({
      where: { active: true, bestSeller: true },
      include: cardInclude,
      take: limit,
      orderBy: { updatedAt: "desc" },
    });
    return products.map(toCard);
  }, []);
}

export async function getNewArrivals(limit = 8) {
  return safeQuery(async () => {
    const products = await prisma.product.findMany({
      where: { active: true, newArrival: true },
      include: cardInclude,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return products.map(toCard);
  }, []);
}

export async function getProducts(params: {
  category?: string;
  sort?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}) {
  const { category, sort = "featured", q, minPrice, maxPrice, page = 1, limit = 12 } = params;

  return safeQuery(async () => {
    const where: Prisma.ProductWhereInput = {
      active: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {}),
      ...(minPrice || maxPrice
        ? {
            price: {
              ...(minPrice ? { gte: minPrice } : {}),
              ...(maxPrice ? { lte: maxPrice } : {}),
            },
          }
        : {}),
      ...(sort === "best" ? { bestSeller: true } : {}),
      ...(sort === "new" ? { newArrival: true } : {}),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === "price-asc"
        ? { price: "asc" }
        : sort === "price-desc"
          ? { price: "desc" }
          : sort === "new"
            ? { createdAt: "desc" }
            : { featured: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: cardInclude,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map(toCard),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }, { products: [], total: 0, page, totalPages: 0 });
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, active: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        include: { inventory: true },
        orderBy: [{ color: "asc" }, { size: "asc" }],
      },
      category: true,
      reviews: {
        where: { approved: true },
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) return null;

  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  return {
    ...product,
    price: Number(product.price),
    compareAt: product.compareAt ? Number(product.compareAt) : null,
    variants: product.variants.map((v) => ({
      ...v,
      price: v.price ? Number(v.price) : null,
    })),
    averageRating,
  };
}

export async function getRelatedProducts(categoryId: string, productId: string, limit = 4) {
  const products = await prisma.product.findMany({
    where: { active: true, categoryId, id: { not: productId } },
    include: cardInclude,
    take: limit,
  });
  return products.map(toCard);
}

export async function getCategories() {
  return safeQuery(
    () =>
      prisma.category.findMany({
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { products: true } } },
      }),
    []
  );
}

export async function getFeaturedCategories() {
  return safeQuery(
    () =>
      prisma.category.findMany({
        where: { featured: true },
        orderBy: { sortOrder: "asc" },
      }),
    []
  );
}

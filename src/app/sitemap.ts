import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, { products }] = await Promise.all([
    getCategories(),
    getProducts({ limit: 500 }),
  ]);

  const staticRoutes = [
    "",
    "/shop",
    "/collections",
    "/about",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...categories.map((category) => ({
      url: `${SITE_URL}/collections/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/product/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}

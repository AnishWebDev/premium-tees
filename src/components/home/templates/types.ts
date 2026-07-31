import type { AllSiteContent } from "@/lib/site-content";
import type { ProductCardData } from "@/types";

export type HomeTemplateProps = {
  content: AllSiteContent;
  featured: ProductCardData[];
  bestSellers: ProductCardData[];
  newArrivals: ProductCardData[];
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
  }>;
};

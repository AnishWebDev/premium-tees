import { HomeTemplate } from "@/components/home/templates";
import {
  getBestSellers,
  getFeaturedCategories,
  getFeaturedProducts,
  getNewArrivals,
} from "@/lib/products";
import { getAllSiteContent } from "@/lib/site-content";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, bestSellers, newArrivals, categories, content] =
    await Promise.all([
      getFeaturedProducts(8),
      getBestSellers(8),
      getNewArrivals(8),
      getFeaturedCategories(),
      getAllSiteContent(),
    ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: content.site.name,
    url: SITE_URL,
    description: content.site.description,
    logo: `${SITE_URL}/logo.png`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeTemplate
        template={content.home.template}
        content={content}
        featured={featured}
        bestSellers={bestSellers}
        newArrivals={newArrivals}
        categories={categories}
      />
    </>
  );
}

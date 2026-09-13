import { HomeTemplate } from "@/components/home/templates";
import { getCmsPageBySlug } from "@/lib/cms-pages";
import {
  getBestSellers,
  getFeaturedCategories,
  getFeaturedProducts,
  getNewArrivals,
} from "@/lib/products";
import { resolvePageSections } from "@/lib/resolve-sections";
import { getAllSiteContent } from "@/lib/site-content";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, bestSellers, newArrivals, categories, content, homePage] =
    await Promise.all([
      getFeaturedProducts(8),
      getBestSellers(8),
      getNewArrivals(8),
      getFeaturedCategories(),
      getAllSiteContent(),
      getCmsPageBySlug("home"),
    ]);

  const sections = homePage
    ? await resolvePageSections(homePage.sections)
    : content.home.sections;

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
        template={homePage?.template ?? content.home.template}
        content={content}
        sections={sections}
        featured={featured}
        bestSellers={bestSellers}
        newArrivals={newArrivals}
        categories={categories}
      />
    </>
  );
}

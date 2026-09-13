import { notFound } from "next/navigation";
import { PageBannerSlot } from "@/components/cms/page-banner-slot";
import { CmsPageView } from "@/components/cms/cms-page-view";
import { getCmsPageBySlug } from "@/lib/cms-pages";
import {
  getBestSellers,
  getFeaturedCategories,
  getFeaturedProducts,
  getNewArrivals,
} from "@/lib/products";
import { resolvePageSections } from "@/lib/resolve-sections";
import { getAllSiteContent } from "@/lib/site-content";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = await getCmsPageBySlug(slug);
  if (!page || page.isSystem || !page.published) {
    return { title: "Page not found" };
  }
  return {
    title: page.title,
    description: page.description ?? undefined,
  };
}

/** Custom CMS pages at /{slug} (e.g. /gallery). System routes stay on their own paths. */
export default async function CustomCmsPageRoute({ params }: PageProps) {
  const { slug } = await params;
  const page = await getCmsPageBySlug(slug);

  if (!page || page.isSystem || !page.published) {
    notFound();
  }

  const [featured, bestSellers, newArrivals, categories, content, sections] =
    await Promise.all([
      getFeaturedProducts(8),
      getBestSellers(8),
      getNewArrivals(8),
      getFeaturedCategories(),
      getAllSiteContent(),
      resolvePageSections(page.sections),
    ]);

  return (
    <div className="pb-16">
      <PageBannerSlot slug={slug} />
      <CmsPageView
        content={content}
        sections={sections}
        featured={featured}
        bestSellers={bestSellers}
        newArrivals={newArrivals}
        categories={categories}
      />
    </div>
  );
}

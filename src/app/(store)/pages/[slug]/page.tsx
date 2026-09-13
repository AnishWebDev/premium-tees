import { notFound } from "next/navigation";
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
  if (!page || !page.published || page.slug === "home") {
    return { title: "Page not found" };
  }
  return {
    title: page.title,
    description: page.description ?? undefined,
  };
}

export default async function CmsPageRoute({ params }: PageProps) {
  const { slug } = await params;
  if (slug === "home") notFound();

  const page = await getCmsPageBySlug(slug);
  if (!page?.published) notFound();

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
      {page.title && page.slug !== "home" ? (
        <header className="border-b border-neutral-200 bg-neutral-50/80">
          <div className="container-narrow section-padding py-10 md:py-14">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-neutral-950 md:text-4xl">
              {page.title}
            </h1>
            {page.description ? (
              <p className="mt-3 max-w-2xl text-neutral-600">{page.description}</p>
            ) : null}
          </div>
        </header>
      ) : null}
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

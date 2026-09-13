import { getCmsPageBySlug } from "@/lib/cms-pages";
import { resolvePageBanner } from "@/lib/page-banner";
import { PageBanner } from "@/components/cms/page-banner";

type PageBannerSlotProps = {
  slug: string;
};

/** Renders the CMS page banner for a storefront slug, if enabled. */
export async function PageBannerSlot({ slug }: PageBannerSlotProps) {
  const page = await getCmsPageBySlug(slug);
  if (!page) return null;

  const banner = resolvePageBanner(
    page.banner,
    page.title,
    page.description,
    page.slug
  );

  return <PageBanner banner={banner} />;
}

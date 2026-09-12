import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getEnabledAudiences } from "@/lib/audience";
import { getProducts, getCategories } from "@/lib/products";
import { getSiteIdentity } from "@/lib/site-identity";
import { getStoreSettings } from "@/lib/store-settings";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { ShopToolbar } from "./shop-toolbar";
import { PackageSearch } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteIdentity();
  return {
    title: "Shop",
    description: `Browse our full collection of premium tees and essentials at ${site.name}.`,
    openGraph: {
      title: `Shop · ${site.name}`,
      description: `Browse our full collection of premium tees and essentials.`,
    },
  };
}

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
    audience?: string;
    sort?: string;
    q?: string;
    page?: string;
  }>;
};

function buildPageUrl(
  params: { category?: string; audience?: string; sort?: string; q?: string },
  page: number
) {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.audience && params.audience !== "men") search.set("audience", params.audience);
  if (params.sort && params.sort !== "featured") search.set("sort", params.sort);
  if (params.q) search.set("q", params.q);
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const [storeSettings, { products, total, totalPages }, categories] = await Promise.all([
    getStoreSettings(),
    getProducts({
      category: params.category,
      audience: params.audience,
      sort: params.sort,
      q: params.q,
      page,
      limit: 12,
    }),
    getCategories(),
  ]);

  const enabledAudiences = getEnabledAudiences(storeSettings.audiencesEnabled);

  const filterParams = {
    category: params.category,
    audience: params.audience,
    sort: params.sort,
    q: params.q,
  };

  return (
    <section className="section-padding">
      <div className="container-tight">
        <Suspense fallback={<div className="h-32 animate-pulse rounded-2xl bg-[var(--muted)]" />}>
          <ShopToolbar
            categories={categories}
            total={total}
            enabledAudiences={enabledAudiences}
          />
        </Suspense>

        {products.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No products found"
            description="Try adjusting your filters or search term."
            actionLabel="View all products"
            actionHref="/shop"
            className="mt-16"
          />
        ) : (
          <>
            <div className="product-grid mt-10">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 4} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                className="mt-16 flex items-center justify-center gap-4"
                aria-label="Pagination"
              >
                <Button
                  variant="outline"
                  size="sm"
                  asChild={page > 1}
                  disabled={page <= 1}
                >
                  {page > 1 ? (
                    <Link href={buildPageUrl(filterParams, page - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Link>
                  ) : (
                    <span>
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </span>
                  )}
                </Button>

                <span className="text-sm text-[var(--muted-foreground)]">
                  Page {page} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  asChild={page < totalPages}
                  disabled={page >= totalPages}
                >
                  {page < totalPages ? (
                    <Link href={buildPageUrl(filterParams, page + 1)}>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
}

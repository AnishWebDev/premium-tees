import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCategories, getProducts } from "@/lib/products";
import { SITE_NAME } from "@/lib/constants";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { PackageSearch } from "lucide-react";

export const revalidate = 60;

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
};

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return { title: "Collection not found" };
  }

  return {
    title: category.name,
    description:
      category.description ??
      `Shop ${category.name} at ${SITE_NAME}. Premium tees with refined fit and finish.`,
    openGraph: {
      title: `${category.name} · ${SITE_NAME}`,
      description: category.description ?? undefined,
      images: category.image ? [{ url: category.image }] : undefined,
    },
  };
}

function buildPageUrl(slug: string, sort: string | undefined, page: number) {
  const search = new URLSearchParams();
  if (sort && sort !== "featured") search.set("sort", sort);
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `/collections/${slug}?${qs}` : `/collections/${slug}`;
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params;
  const { page: pageParam, sort } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) notFound();

  const { products, total, totalPages } = await getProducts({
    category: slug,
    sort,
    page,
    limit: 12,
  });

  return (
    <section className="section-padding">
      <div className="container-tight">
        <div className="max-w-2xl">
          <Link
            href="/collections"
            className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <ChevronLeft className="h-4 w-4" />
            All collections
          </Link>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
              {category.description}
            </p>
          )}
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {total} {total === 1 ? "product" : "products"}
          </p>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No products in this collection"
            description="Check back soon — new pieces are added regularly."
            actionLabel="Shop all"
            actionHref="/shop"
            className="mt-16"
          />
        ) : (
          <>
            <div className="product-grid mt-12">
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
                    <Link href={buildPageUrl(slug, sort, page - 1)}>
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
                    <Link href={buildPageUrl(slug, sort, page + 1)}>
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

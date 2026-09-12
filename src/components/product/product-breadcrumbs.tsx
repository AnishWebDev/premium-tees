import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SITE_URL } from "@/lib/constants";

type ProductBreadcrumbsProps = {
  productName: string;
  productSlug: string;
  category: { name: string; slug: string };
};

export function ProductBreadcrumbs({
  productName,
  productSlug,
  category,
}: ProductBreadcrumbsProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Shop",
        item: `${SITE_URL}/shop`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: `${SITE_URL}/collections/${category.slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: productName,
        item: `${SITE_URL}/product/${productSlug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
          <li>
            <Link href="/shop" className="hover:text-[var(--foreground)]">
              Shop
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li>
            <Link
              href={`/collections/${category.slug}`}
              className="hover:text-[var(--foreground)]"
            >
              {category.name}
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li>
            <span className="text-[var(--foreground)]" aria-current="page">
              {productName}
            </span>
          </li>
        </ol>
      </nav>
    </>
  );
}

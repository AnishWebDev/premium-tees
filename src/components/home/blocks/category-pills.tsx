import Link from "next/link";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type CategoryPillsProps = {
  categories: Category[];
  title?: string;
};

/** Nike-style quick shop navigation. */
export function CategoryPills({
  categories,
  title = "Shop",
}: CategoryPillsProps) {
  if (categories.length === 0) return null;

  const headingId = "category-pills-label";

  return (
    <section
      className="border-b border-[var(--border)] bg-[var(--background)]"
      aria-labelledby={headingId}
    >
      <div className="container-tight flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p
          id={headingId}
          className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]"
        >
          {title}
        </p>
        <nav aria-label={title} className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
            >
              {category.name}
            </Link>
          ))}
          <Link
            href="/shop"
            className="border border-[var(--foreground)] bg-[var(--foreground)] px-4 py-2.5 text-sm font-medium text-[var(--background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
          >
            All products
          </Link>
        </nav>
      </div>
    </section>
  );
}

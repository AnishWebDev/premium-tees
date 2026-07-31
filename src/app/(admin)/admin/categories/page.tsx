import { adminFetch } from "@/lib/admin-api";
import { CategoriesManager } from "@/components/admin/categories-manager";

type CategoriesResponse = {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    featured: boolean;
    sortOrder: number;
    _count: { products: number };
    createdAt: string;
  }>;
};

export default async function AdminCategoriesPage() {
  const { categories } = await adminFetch<CategoriesResponse>("/api/admin/categories");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Categories</h1>
        <p className="text-sm text-neutral-500">Manage product categories</p>
      </div>
      <CategoriesManager initialCategories={categories} />
    </div>
  );
}

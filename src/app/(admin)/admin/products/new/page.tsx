import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { adminFetch } from "@/lib/admin-api";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";

type CategoriesResponse = {
  categories: Array<{ id: string; name: string }>;
};

export default async function NewProductPage() {
  const { categories } = await adminFetch<CategoriesResponse>("/api/admin/categories");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/admin/products">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Add product</h1>
          <p className="text-sm text-neutral-500">Create a new product listing</p>
        </div>
      </div>
      <ProductForm categories={categories} mode="create" />
    </div>
  );
}

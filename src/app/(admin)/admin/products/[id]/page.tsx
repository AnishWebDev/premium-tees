import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";
import { adminFetch } from "@/lib/admin-api";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";

type CategoriesResponse = {
  categories: Array<{ id: string; name: string }>;
};

type ProductResponse = {
  id: string;
  name: string;
  description: string;
  shortDesc: string | null;
  price: number;
  compareAt: number | null;
  categoryId: string;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  active: boolean;
  images: Array<{ url: string; alt: string | null }>;
  variants: Array<{
    size: string;
    color: string;
    colorHex: string | null;
    inventory: { quantity: number } | null;
  }>;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  let product: ProductResponse;
  let categories: CategoriesResponse["categories"];

  try {
    [product, { categories }] = await Promise.all([
      adminFetch<ProductResponse>(`/api/admin/products/${id}`),
      adminFetch<CategoriesResponse>("/api/admin/categories"),
    ]);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/admin/products">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Edit product</h1>
          <p className="text-sm text-neutral-500">{product.name}</p>
        </div>
      </div>
      <ProductForm
        categories={categories}
        mode="edit"
        canDelete={isSuperAdmin(session?.user?.role)}
        initialData={{
          id: product.id,
          name: product.name,
          description: product.description,
          shortDesc: product.shortDesc ?? "",
          price: String(product.price),
          compareAt: product.compareAt ? String(product.compareAt) : "",
          categoryId: product.categoryId,
          featured: product.featured,
          bestSeller: product.bestSeller,
          newArrival: product.newArrival,
          active: product.active,
          images: product.images.map((img) => ({
            url: img.url,
            alt: img.alt ?? "",
          })),
          variants: product.variants.map((v) => ({
            size: v.size,
            color: v.color,
            colorHex: v.colorHex ?? "",
            quantity: v.inventory?.quantity ?? 0,
          })),
        }}
      />
    </div>
  );
}

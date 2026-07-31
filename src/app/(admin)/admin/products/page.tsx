import { auth } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";
import { adminFetch } from "@/lib/admin-api";
import { ProductsTable } from "@/components/admin/products-table";

type ProductsResponse = {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    active: boolean;
    featured: boolean;
    category: { name: string } | null;
    variants: Array<{ inventory: { quantity: number } | null }>;
  }>;
};

export default async function AdminProductsPage() {
  const session = await auth();
  const { products } = await adminFetch<ProductsResponse>("/api/admin/products");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Products</h1>
        <p className="text-sm text-neutral-500">{products.length} products total</p>
      </div>
      <ProductsTable
        products={products}
        canDelete={isSuperAdmin(session?.user?.role)}
      />
    </div>
  );
}

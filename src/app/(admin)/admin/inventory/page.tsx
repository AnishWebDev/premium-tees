import Link from "next/link";
import { adminFetch } from "@/lib/admin-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ProductsResponse = {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    active: boolean;
    variants: Array<{
      id: string;
      size: string;
      color: string;
      colorHex: string | null;
      sku: string;
      inventory: {
        quantity: number;
        reserved: number;
        lowStock: number;
      } | null;
    }>;
  }>;
};

type InventoryRow = {
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string;
  size: string;
  color: string;
  colorHex: string | null;
  sku: string;
  quantity: number;
  reserved: number;
  available: number;
  lowStock: number;
  isLow: boolean;
};

export default async function AdminInventoryPage() {
  const { products } = await adminFetch<ProductsResponse>("/api/admin/products");

  const rows: InventoryRow[] = products.flatMap((product) =>
    product.variants.map((variant) => {
      const quantity = variant.inventory?.quantity ?? 0;
      const reserved = variant.inventory?.reserved ?? 0;
      const lowStock = variant.inventory?.lowStock ?? 5;
      const available = quantity - reserved;

      return {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        variantId: variant.id,
        size: variant.size,
        color: variant.color,
        colorHex: variant.colorHex,
        sku: variant.sku,
        quantity,
        reserved,
        available,
        lowStock,
        isLow: available <= lowStock,
      };
    })
  );

  const lowStockCount = rows.filter((r) => r.isLow && r.available > 0).length;
  const outOfStockCount = rows.filter((r) => r.available <= 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Inventory</h1>
        <p className="text-sm text-neutral-500">
          {rows.length} variants · {lowStockCount} low stock · {outOfStockCount} out of stock
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Total variants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{rows.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Low stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums text-amber-600">{lowStockCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Out of stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums text-red-600">{outOfStockCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>On hand</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-neutral-500">
                    No inventory data
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.variantId}
                    className={row.isLow ? "bg-amber-50/50" : undefined}
                  >
                    <TableCell>
                      <Link
                        href={`/admin/products/${row.productId}`}
                        className="font-medium text-neutral-900 hover:underline"
                      >
                        {row.productName}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-neutral-500">{row.sku}</TableCell>
                    <TableCell>{row.size}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {row.colorHex && (
                          <span
                            className="h-3 w-3 rounded-full border border-neutral-200"
                            style={{ backgroundColor: row.colorHex }}
                          />
                        )}
                        {row.color}
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums">{row.quantity}</TableCell>
                    <TableCell className="tabular-nums">{row.reserved}</TableCell>
                    <TableCell className="tabular-nums font-medium">{row.available}</TableCell>
                    <TableCell>
                      {row.available <= 0 ? (
                        <Badge variant="destructive">Out of stock</Badge>
                      ) : row.isLow ? (
                        <Badge variant="warning">Low stock</Badge>
                      ) : (
                        <Badge variant="success">In stock</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

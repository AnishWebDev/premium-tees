import Link from "next/link";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { adminFetch } from "@/lib/admin-api";
import { formatDate, formatPrice } from "@/lib/utils";
import { StatCard } from "@/components/admin/stat-card";
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

type Analytics = {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  revenueChange: number;
  ordersChange: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
    user: { name: string | null; email: string | null };
  }>;
  topProducts: Array<{ name: string; sold: number; revenue: number }>;
  salesByDay: Array<{ date: string; revenue: number; orders: number }>;
};

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  PENDING: "warning",
  PAID: "success",
  PROCESSING: "secondary",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
  REFUNDED: "outline",
};

export default async function AdminDashboardPage() {
  const data = await adminFetch<Analytics>("/api/admin/analytics");
  const maxRevenue = Math.max(...data.salesByDay.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500">Overview for the last 30 days</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Revenue"
          value={formatPrice(data.revenue)}
          change={data.revenueChange}
          icon={DollarSign}
        />
        <StatCard
          title="Orders"
          value={data.orders.toLocaleString()}
          change={data.ordersChange}
          icon={ShoppingCart}
        />
        <StatCard title="Customers" value={data.customers.toLocaleString()} icon={Users} />
        <StatCard title="Active products" value={data.products.toLocaleString()} icon={Package} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-lg shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sales (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-1">
              {data.salesByDay.map((day) => {
                const height = Math.max((day.revenue / maxRevenue) * 100, day.revenue > 0 ? 4 : 0);
                return (
                  <div key={day.date} className="group flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-neutral-800 transition-colors group-hover:bg-neutral-700"
                      style={{ height: `${height}%` }}
                      title={`${day.date}: ${formatPrice(day.revenue)} (${day.orders} orders)`}
                    />
                    <span className="hidden text-[10px] text-neutral-400 xl:block">
                      {day.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-neutral-500">No sales data yet</p>
            ) : (
              data.topProducts.map((product) => (
                <div key={product.name} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900">{product.name}</p>
                    <p className="text-xs text-neutral-500">{product.sold} sold</p>
                  </div>
                  <p className="shrink-0 text-sm font-medium tabular-nums text-neutral-700">
                    {formatPrice(product.revenue)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Recent orders</CardTitle>
          <Link href="/admin/orders" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
            View all
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{order.user.name ?? "Guest"}</p>
                      <p className="text-xs text-neutral-500">{order.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-neutral-500">
                    {formatDate(order.createdAt, { month: "short", day: "numeric", year: "numeric" })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[order.status] ?? "secondary"}>
                      {order.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatPrice(order.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

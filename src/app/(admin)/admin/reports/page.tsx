import { adminFetch } from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";

type Analytics = {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  revenueChange: number;
  ordersChange: number;
  topProducts: Array<{ name: string; sold: number; revenue: number }>;
  salesByDay: Array<{ date: string; revenue: number; orders: number }>;
};

export default async function AdminReportsPage() {
  const data = await adminFetch<Analytics>("/api/admin/analytics");

  const avgOrderValue = data.orders > 0 ? data.revenue / data.orders : 0;
  const totalUnitsSold = data.topProducts.reduce((sum, p) => sum + p.sold, 0);
  const bestDay = data.salesByDay.reduce(
    (best, day) => (day.revenue > best.revenue ? day : best),
    { date: "—", revenue: 0, orders: 0 }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Reports</h1>
        <p className="text-sm text-neutral-500">Sales summary for the last 30 days</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total revenue"
          value={formatPrice(data.revenue)}
          change={data.revenueChange}
          icon={DollarSign}
        />
        <StatCard
          title="Total orders"
          value={data.orders.toLocaleString()}
          change={data.ordersChange}
          icon={ShoppingCart}
        />
        <StatCard
          title="Avg order value"
          value={formatPrice(avgOrderValue)}
          icon={TrendingUp}
        />
        <StatCard title="Units sold" value={totalUnitsSold.toLocaleString()} icon={Users} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Best performing day</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{formatPrice(bestDay.revenue)}</p>
            <p className="mt-1 text-sm text-neutral-500">
              {bestDay.date} · {bestDay.orders} orders
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Catalog overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Active products</span>
              <span className="font-medium">{data.products}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Registered customers</span>
              <span className="font-medium">{data.customers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Revenue per customer</span>
              <span className="font-medium">
                {formatPrice(data.customers > 0 ? data.revenue / data.customers : 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daily sales breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...data.salesByDay].reverse().map((day) => (
                <TableRow key={day.date}>
                  <TableCell className="font-medium">{day.date}</TableCell>
                  <TableCell className="tabular-nums">{day.orders}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPrice(day.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Top products by revenue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Units sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-neutral-500">
                    No sales data yet
                  </TableCell>
                </TableRow>
              ) : (
                data.topProducts.map((product) => (
                  <TableRow key={product.name}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="tabular-nums">{product.sold}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(product.revenue)}
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

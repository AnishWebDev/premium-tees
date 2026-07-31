import { adminFetch } from "@/lib/admin-api";
import { OrdersTable } from "@/components/admin/orders-table";

type OrdersResponse = {
  orders: Array<{
    id: string;
    orderNumber: string;
    status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
    total: number;
    createdAt: string;
    user: { name: string | null; email: string | null };
    items: Array<{ name: string; quantity: number }>;
  }>;
  total: number;
};

export default async function AdminOrdersPage() {
  const { orders, total } = await adminFetch<OrdersResponse>("/api/admin/orders");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Orders</h1>
        <p className="text-sm text-neutral-500">{total} orders total</p>
      </div>
      <OrdersTable initialOrders={orders} />
    </div>
  );
}

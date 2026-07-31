import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice, cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-800",
  PAID: "bg-blue-50 text-blue-800",
  PROCESSING: "bg-indigo-50 text-indigo-800",
  SHIPPED: "bg-purple-50 text-purple-800",
  DELIVERED: "bg-green-50 text-green-800",
  CANCELLED: "bg-neutral-100 text-neutral-600",
  REFUNDED: "bg-red-50 text-red-700",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="When you place an order, it will appear here."
        actionLabel="Start shopping"
        actionHref="/shop"
      />
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-neutral-950">
        Order history
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        {orders.length} {orders.length === 1 ? "order" : "orders"}
      </p>

      <ul className="mt-8 divide-y divide-neutral-200 rounded-2xl border border-neutral-200">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/orders/${order.id}`}
              className="flex flex-col gap-4 p-5 transition-colors hover:bg-neutral-50 sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-medium text-neutral-950">
                    {order.orderNumber}
                  </p>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] uppercase tracking-wider",
                      STATUS_STYLES[order.status]
                    )}
                  >
                    {order.status.toLowerCase()}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  {formatDate(order.createdAt)} · {order.items.length}{" "}
                  {order.items.length === 1 ? "item" : "items"}
                </p>
              </div>
              <p className="text-sm font-semibold text-neutral-950">
                {formatPrice(Number(order.total))}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

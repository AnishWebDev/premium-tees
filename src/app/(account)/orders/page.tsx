import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_STYLES } from "@/lib/order-status-styles";
import { formatDate, formatPrice, cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
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
      <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
        Order history
      </h2>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        {orders.length} {orders.length === 1 ? "order" : "orders"}
      </p>

      <ul className="mt-8 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)]">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/orders/${order.id}`}
              className="flex flex-col gap-4 p-5 transition-colors hover:bg-[var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {order.orderNumber}
                  </p>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] uppercase tracking-wider",
                      ORDER_STATUS_STYLES[order.status]
                    )}
                  >
                    {order.status.toLowerCase()}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {formatDate(order.createdAt)} · {order.items.length}{" "}
                  {order.items.length === 1 ? "item" : "items"}
                </p>
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {formatPrice(Number(order.total))}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

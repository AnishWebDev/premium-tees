import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      paidOrders,
      previousPeriodOrders,
      customers,
      products,
      recentOrders,
      orderItems,
    ] = await Promise.all([
      prisma.order.findMany({
        where: {
          status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { total: true, createdAt: true },
      }),
      prisma.order.findMany({
        where: {
          status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
        select: { total: true },
      }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.product.count({ where: { active: true } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.orderItem.findMany({
        where: {
          order: {
            status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
            createdAt: { gte: thirtyDaysAgo },
          },
        },
        select: { name: true, quantity: true, price: true },
      }),
    ]);

    const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const previousRevenue = previousPeriodOrders.reduce(
      (sum, o) => sum + Number(o.total),
      0
    );
    const revenueChange =
      previousRevenue > 0
        ? Math.round(((revenue - previousRevenue) / previousRevenue) * 100)
        : revenue > 0
          ? 100
          : 0;

    const orders = paidOrders.length;
    const previousOrders = previousPeriodOrders.length;
    const ordersChange =
      previousOrders > 0
        ? Math.round(((orders - previousOrders) / previousOrders) * 100)
        : orders > 0
          ? 100
          : 0;

    const productSales = new Map<string, { sold: number; revenue: number }>();
    for (const item of orderItems) {
      const existing = productSales.get(item.name) ?? { sold: 0, revenue: 0 };
      existing.sold += item.quantity;
      existing.revenue += Number(item.price) * item.quantity;
      productSales.set(item.name, existing);
    }

    const topProducts = Array.from(productSales.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const salesByDayMap = new Map<string, { revenue: number; orders: number }>();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split("T")[0];
      salesByDayMap.set(key, { revenue: 0, orders: 0 });
    }

    for (const order of paidOrders) {
      const key = order.createdAt.toISOString().split("T")[0];
      const entry = salesByDayMap.get(key);
      if (entry) {
        entry.revenue += Number(order.total);
        entry.orders += 1;
      }
    }

    const salesByDay = Array.from(salesByDayMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));

    const stats = {
      revenue,
      orders,
      customers,
      products,
      revenueChange,
      ordersChange,
      recentOrders: recentOrders.map((order) => ({
        ...order,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        tax: Number(order.tax),
        discount: Number(order.discount),
        total: Number(order.total),
        items: order.items.map((item) => ({
          ...item,
          price: Number(item.price),
        })),
      })),
      topProducts,
      salesByDay,
    };

    return NextResponse.json(stats);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("[GET /api/admin/analytics]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

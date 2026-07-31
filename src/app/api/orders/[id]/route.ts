import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await auth();

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isOwner = session?.user?.id === order.userId;
    const isStaff =
      session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN";

    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("[GET /api/orders/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

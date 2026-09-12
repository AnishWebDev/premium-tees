import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { normalizeImageUrl } from "@/lib/image-url";
import { prisma } from "@/lib/prisma";
import { stockStatus } from "@/lib/utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const cartItems: {
      productId: string;
      variantId: string;
      name: string;
      slug: string;
      price: number;
      image: string;
      size: string;
      color: string;
      colorHex: string | null;
      quantity: number;
      maxStock: number;
    }[] = [];

    for (const item of order.items) {
      let variant = item.variantId
        ? await prisma.variant.findUnique({
            where: { id: item.variantId },
            include: {
              inventory: true,
              product: {
                include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
              },
            },
          })
        : null;

      if (!variant && item.productId) {
        variant = await prisma.variant.findFirst({
          where: {
            productId: item.productId,
            size: item.size,
            color: item.color,
          },
          include: {
            inventory: true,
            product: {
              include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
            },
          },
        });
      }

      if (!variant || !variant.product.active) continue;

      const stock = stockStatus(
        variant.inventory?.quantity ?? 0,
        variant.inventory?.reserved ?? 0,
        variant.inventory?.lowStock ?? 5
      );
      if (stock.available <= 0) continue;

      const unitPrice = variant.price
        ? Number(variant.price)
        : Number(variant.product.price);

      cartItems.push({
        productId: variant.productId,
        variantId: variant.id,
        name: variant.product.name,
        slug: variant.product.slug,
        price: unitPrice,
        image: normalizeImageUrl(
          item.image ?? variant.product.images[0]?.url ?? ""
        ),
        size: variant.size,
        color: variant.color,
        colorHex: variant.colorHex,
        quantity: Math.min(item.quantity, stock.available),
        maxStock: stock.available,
      });
    }

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "No items from this order are currently available" },
        { status: 400 }
      );
    }

    return NextResponse.json({ items: cartItems });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[POST /api/orders/[id]/buy-again]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

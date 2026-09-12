import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { normalizeImageUrl } from "@/lib/image-url";
import { prisma } from "@/lib/prisma";
import { stockStatus } from "@/lib/utils";

const syncItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  savedForLater: z.boolean().default(false),
});

const syncSchema = z.object({
  items: z.array(syncItemSchema),
});

function toClientItem(
  row: Awaited<ReturnType<typeof loadCartRows>>[number]
) {
  const variant = row.variant;
  const product = row.product;
  const inventory = variant.inventory;
  const stock = stockStatus(
    inventory?.quantity ?? 0,
    inventory?.reserved ?? 0,
    inventory?.lowStock ?? 5
  );

  return {
    id: row.id,
    productId: row.productId,
    variantId: row.variantId,
    name: product.name,
    slug: product.slug,
    price: variant.price ? Number(variant.price) : Number(product.price),
    image: normalizeImageUrl(product.images[0]?.url ?? ""),
    size: variant.size,
    color: variant.color,
    colorHex: variant.colorHex,
    quantity: row.quantity,
    savedForLater: row.savedForLater,
    maxStock: Math.max(stock.available, 1),
  };
}

async function loadCartRows(userId: string) {
  return prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      },
      variant: { include: { inventory: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function GET() {
  try {
    const session = await requireAuth();
    const rows = await loadCartRows(session.user.id);

    return NextResponse.json({ items: rows.map(toClientItem) });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/cart]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = syncSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const incoming = parsed.data.items;

    const variantIds = [...new Set(incoming.map((i) => i.variantId))];
    const variants = await prisma.variant.findMany({
      where: { id: { in: variantIds }, product: { active: true } },
      select: { id: true, productId: true },
    });
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    const validItems = incoming.filter((item) => {
      const variant = variantMap.get(item.variantId);
      return variant && variant.productId === item.productId;
    });

    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { userId } });

      for (const item of validItems) {
        await tx.cartItem.create({
          data: {
            userId,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            savedForLater: item.savedForLater,
          },
        });
      }
    });

    const rows = await loadCartRows(userId);
    return NextResponse.json({ items: rows.map(toClientItem) });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[PUT /api/cart]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

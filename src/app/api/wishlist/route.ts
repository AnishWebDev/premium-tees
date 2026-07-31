import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const toggleSchema = z.object({
  productId: z.string().min(1),
});

export async function GET() {
  try {
    const session = await requireAuth();

    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            category: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const wishlist = items.map((item) => ({
      id: item.id,
      productId: item.productId,
      createdAt: item.createdAt,
      product: {
        ...item.product,
        price: Number(item.product.price),
        compareAt: item.product.compareAt ? Number(item.product.compareAt) : null,
      },
    }));

    return NextResponse.json({ wishlist });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/wishlist]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = toggleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { productId } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: "removed", productId });
    }

    const item = await prisma.wishlistItem.create({
      data: {
        userId: session.user.id,
        productId,
      },
    });

    return NextResponse.json({ action: "added", item }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[POST /api/wishlist]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const productId = request.nextUrl.searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const item = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not in wishlist" }, { status: 404 });
    }

    await prisma.wishlistItem.delete({ where: { id: item.id } });

    return NextResponse.json({ message: "Removed from wishlist" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[DELETE /api/wishlist]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations/product";

export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId, approved: true },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({ reviews, averageRating, total: reviews.length });
  } catch (error) {
    console.error("[GET /api/reviews]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { productId, rating, title, comment } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const existing = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 409 }
      );
    }

    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id,
          status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
        },
      },
    });

    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        title,
        comment,
        verified: !!hasPurchased,
        approved: false,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    console.error("[POST /api/reviews]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

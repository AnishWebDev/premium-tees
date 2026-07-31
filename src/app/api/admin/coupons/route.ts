import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { couponSchema } from "@/lib/validations/product";

export async function GET() {
  try {
    await requireAdmin();

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    const serialized = coupons.map((coupon) => ({
      ...coupon,
      discountValue: Number(coupon.discountValue),
      minOrder: coupon.minOrder ? Number(coupon.minOrder) : null,
    }));

    return NextResponse.json({ coupons: serialized });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("[GET /api/admin/coupons]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = couponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrder: data.minOrder,
        maxUses: data.maxUses,
        active: data.active,
        startsAt: data.startsAt ?? new Date(),
        expiresAt: data.expiresAt,
      },
    });

    return NextResponse.json(
      {
        ...coupon,
        discountValue: Number(coupon.discountValue),
        minOrder: coupon.minOrder ? Number(coupon.minOrder) : null,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("[POST /api/admin/coupons]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

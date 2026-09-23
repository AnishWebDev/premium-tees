import { NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import type { Coupon } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { couponUpdateSchema } from "@/lib/validations/product";

type RouteContext = { params: Promise<{ id: string }> };

function serializeCoupon(coupon: Coupon) {
  return {
    ...coupon,
    discountValue: Number(coupon.discountValue),
    minOrder: coupon.minOrder != null ? Number(coupon.minOrder) : null,
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = couponUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const data = parsed.data;

    if (data.code && data.code !== existing.code) {
      const conflict = await prisma.coupon.findUnique({ where: { code: data.code } });
      if (conflict) {
        return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
      }
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(data.code !== undefined ? { code: data.code } : {}),
        ...(data.description !== undefined
          ? { description: data.description?.trim() || null }
          : {}),
        ...(data.discountType !== undefined ? { discountType: data.discountType } : {}),
        ...(data.discountValue !== undefined ? { discountValue: data.discountValue } : {}),
        ...(data.minOrder !== undefined ? { minOrder: data.minOrder } : {}),
        ...(data.maxUses !== undefined ? { maxUses: data.maxUses } : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
        ...(data.startsAt !== undefined ? { startsAt: data.startsAt } : {}),
        ...(data.expiresAt !== undefined ? { expiresAt: data.expiresAt } : {}),
      },
    });

    return NextResponse.json(serializeCoupon(coupon));
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("[PATCH /api/admin/coupons/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireSuperAdmin();
    const { id } = await context.params;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    await prisma.coupon.delete({ where: { id } });

    return NextResponse.json({ message: "Coupon deleted" });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("[DELETE /api/admin/coupons/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

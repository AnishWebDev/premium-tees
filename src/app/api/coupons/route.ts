import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { hasCustomerUsedCoupon } from "@/lib/coupon-usage";
import { prisma } from "@/lib/prisma";
import { getDiscountAmount } from "@/lib/utils";

const validateCouponSchema = z.object({
  code: z.string().min(1).transform((v) => v.toUpperCase().trim()),
  subtotal: z.coerce.number().min(0),
  email: z.string().email().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const parsed = validateCouponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { code, subtotal, email: emailFromBody } = parsed.data;
    const email = emailFromBody ?? session?.user?.email ?? undefined;

    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon || !coupon.active) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    const now = new Date();
    if (coupon.startsAt > now) {
      return NextResponse.json({ error: "Coupon is not yet active" }, { status: 400 });
    }

    if (coupon.expiresAt && coupon.expiresAt < now) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
    }

    if (coupon.minOrder && subtotal < Number(coupon.minOrder)) {
      return NextResponse.json(
        {
          error: `Minimum order of ₹${Number(coupon.minOrder).toFixed(0)} required`,
        },
        { status: 400 }
      );
    }

    if (email || session?.user?.id) {
      const alreadyUsed = await hasCustomerUsedCoupon(code, {
        userId: session?.user?.id,
        email,
      });
      if (alreadyUsed) {
        return NextResponse.json(
          { error: "You have already used this coupon on a previous order" },
          { status: 400 }
        );
      }
    }

    const discount = getDiscountAmount(
      subtotal,
      coupon.discountType,
      Number(coupon.discountValue)
    );

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      discount,
    });
  } catch (error) {
    console.error("[POST /api/coupons]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

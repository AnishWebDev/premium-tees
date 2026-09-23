import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const BLOCKING_STATUSES = ["CANCELLED", "REFUNDED"] as const;

/** True if this account/email already completed an order with this coupon. */
export async function hasCustomerUsedCoupon(
  couponCode: string,
  identity: { userId?: string | null; email?: string | null }
): Promise<boolean> {
  const code = couponCode.toUpperCase().trim();
  const email = identity.email?.trim().toLowerCase();
  const or: Prisma.OrderWhereInput[] = [];

  if (identity.userId) {
    or.push({ userId: identity.userId });
  }
  if (email) {
    or.push({ guestEmail: { equals: email, mode: "insensitive" } });
    or.push({ user: { email: { equals: email, mode: "insensitive" } } });
  }

  if (or.length === 0) return false;

  const count = await prisma.order.count({
    where: {
      couponCode: code,
      status: { notIn: [...BLOCKING_STATUSES] },
      OR: or,
    },
  });

  return count > 0;
}

/** Increment global coupon usedCount (same rules as fulfill-order). */
export async function incrementCouponUsedCount(
  couponCode: string,
  tx: Prisma.TransactionClient = prisma
) {
  const coupon = await tx.coupon.findUnique({ where: { code: couponCode } });
  if (!coupon) return;

  const couponUpdate = await tx.coupon.updateMany({
    where: {
      code: couponCode,
      ...(coupon.maxUses !== null ? { usedCount: { lt: coupon.maxUses } } : {}),
    },
    data: { usedCount: { increment: 1 } },
  });

  if (coupon.maxUses !== null && couponUpdate.count === 0) {
    throw new Error(`Coupon ${couponCode} has no remaining uses`);
  }
}

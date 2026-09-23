import { incrementCouponUsedCount } from "@/lib/coupon-usage";
import { syncOrderByIdSafe } from "@/lib/google-sheets";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email/order-confirmation";

/** Mark a PENDING order paid, consume reserved stock, and send invoice email. */
export async function fulfillOrder(
  orderId: string,
  payment?: { razorpayPaymentId?: string | null }
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: { select: { email: true, name: true } },
    },
  });

  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  if (order.status === "PAID") {
    return order;
  }

  if (order.status !== "PENDING") {
    throw new Error(
      `Order ${order.orderNumber} cannot be fulfilled from status ${order.status}`
    );
  }

  const newlyPaid = await prisma.$transaction(async (tx) => {
    const result = await tx.order.updateMany({
      where: { id: orderId, status: "PENDING" },
      data: {
        status: "PAID",
        ...(payment?.razorpayPaymentId
          ? { razorpayPaymentId: payment.razorpayPaymentId }
          : {}),
      },
    });

    if (result.count === 0) {
      return false;
    }

    for (const item of order.items) {
      if (!item.variantId) continue;

      const stock = await tx.inventory.updateMany({
        where: {
          variantId: item.variantId,
          quantity: { gte: item.quantity },
          reserved: { gte: item.quantity },
        },
        data: {
          quantity: { decrement: item.quantity },
          reserved: { decrement: item.quantity },
        },
      });

      if (stock.count === 0) {
        // Fallback for older PENDING orders created before reservation
        const legacy = await tx.inventory.updateMany({
          where: {
            variantId: item.variantId,
            quantity: { gte: item.quantity },
          },
          data: {
            quantity: { decrement: item.quantity },
          },
        });
        if (legacy.count === 0) {
          throw new Error(
            `Insufficient stock while fulfilling ${order.orderNumber}`
          );
        }
      }
    }

    if (order.couponCode) {
      await incrementCouponUsedCount(order.couponCode, tx);
    }

    return true;
  });

  const paidOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: { select: { email: true, name: true } },
    },
  });

  if (!paidOrder) {
    throw new Error(`Order not found after fulfill: ${orderId}`);
  }

  if (newlyPaid) {
    try {
      await sendOrderConfirmationEmail(paidOrder);
    } catch (error) {
      console.error(
        `[fulfillOrder] confirmation email failed for ${paidOrder.orderNumber}`,
        error
      );
    }
    await syncOrderByIdSafe(paidOrder.id);
  }

  return paidOrder;
}

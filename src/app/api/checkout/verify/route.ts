import { NextResponse } from "next/server";
import { z } from "zod";
import { fulfillOrder } from "@/lib/fulfill-order";
import { orderSuccessPath } from "@/lib/order-access";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/razorpay";

const schema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payment payload" }, { status: 400 });
    }

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      parsed.data;

    const valid = verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!valid) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, razorpayOrderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await fulfillOrder(order.id, { razorpayPaymentId });

    return NextResponse.json({
      ok: true,
      orderNumber: order.orderNumber,
      redirectUrl: orderSuccessPath(order.orderNumber),
    });
  } catch (error) {
    console.error("[POST /api/checkout/verify]", error);
    const message =
      error instanceof Error && error.message.includes("Insufficient stock")
        ? error.message
        : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

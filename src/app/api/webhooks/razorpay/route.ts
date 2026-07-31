import { NextRequest, NextResponse } from "next/server";
import { fulfillOrder } from "@/lib/fulfill-order";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";

type RazorpayPaymentEntity = {
  id: string;
  order_id: string;
  status: string;
  notes?: { orderId?: string };
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody) as {
      event: string;
      payload?: { payment?: { entity?: RazorpayPaymentEntity } };
    };

    if (
      event.event === "payment.captured" ||
      event.event === "payment.authorized"
    ) {
      const payment = event.payload?.payment?.entity;
      if (!payment?.order_id) {
        return NextResponse.json({ received: true });
      }

      const order =
        (payment.notes?.orderId
          ? await prisma.order.findUnique({ where: { id: payment.notes.orderId } })
          : null) ??
        (await prisma.order.findUnique({
          where: { razorpayOrderId: payment.order_id },
        }));

      if (order) {
        await fulfillOrder(order.id, { razorpayPaymentId: payment.id });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[POST /api/webhooks/razorpay]", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

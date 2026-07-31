import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fulfillOrder } from "@/lib/fulfill-order";
import { orderSuccessPath } from "@/lib/order-access";
import {
  canUseDemoCheckout,
  createRazorpayOrder,
  isRazorpayConfigured,
} from "@/lib/razorpay";
import {
  calculateShipping,
  calculateTax,
  generateOrderNumber,
  getDiscountAmount,
} from "@/lib/utils";
import { checkoutSchema, cartItemSchema } from "@/lib/validations/checkout";

const checkoutBodySchema = z.intersection(
  checkoutSchema,
  z.object({
    items: z.array(cartItemSchema).min(1, "Cart cannot be empty"),
  })
);

export async function POST(request: Request) {
  try {
    const session = await auth();
    const demoMode = canUseDemoCheckout(session?.user?.role);

    if (!isRazorpayConfigured() && !demoMode) {
      return NextResponse.json(
        { error: "Checkout isn’t available yet. Please check back soon." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = checkoutBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const variantIds = data.items.map((item) => item.variantId);
    const variants = await prisma.variant.findMany({
      where: { id: { in: variantIds } },
      include: {
        inventory: true,
        product: {
          include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
        },
      },
    });

    if (variants.length !== data.items.length) {
      return NextResponse.json({ error: "One or more items are invalid" }, { status: 400 });
    }

    const variantMap = new Map(variants.map((v) => [v.id, v]));
    let subtotal = 0;
    const orderItems: {
      quantity: number;
      price: number;
      name: string;
      size: string;
      color: string;
      image: string | null;
      productId: string;
      variantId: string;
    }[] = [];

    for (const item of data.items) {
      const variant = variantMap.get(item.variantId);
      if (!variant) {
        return NextResponse.json({ error: "Invalid variant" }, { status: 400 });
      }

      if (!variant.product.active) {
        return NextResponse.json(
          { error: `${variant.product.name} is no longer available` },
          { status: 400 }
        );
      }

      const available =
        (variant.inventory?.quantity ?? 0) - (variant.inventory?.reserved ?? 0);
      if (available < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${variant.product.name} (${variant.size}/${variant.color})`,
          },
          { status: 400 }
        );
      }

      const unitPrice = variant.price
        ? Number(variant.price)
        : Number(variant.product.price);
      subtotal += unitPrice * item.quantity;

      orderItems.push({
        quantity: item.quantity,
        price: unitPrice,
        name: variant.product.name,
        size: variant.size,
        color: variant.color,
        image: variant.product.images[0]?.url ?? null,
        productId: variant.productId,
        variantId: variant.id,
      });
    }

    let discount = 0;
    let couponCode: string | undefined;

    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase().trim() },
      });

      const now = new Date();
      const valid =
        coupon?.active &&
        coupon.startsAt <= now &&
        (!coupon.expiresAt || coupon.expiresAt >= now) &&
        (coupon.maxUses === null || coupon.usedCount < coupon.maxUses) &&
        (!coupon.minOrder || subtotal >= Number(coupon.minOrder));

      if (!valid) {
        return NextResponse.json(
          { error: "This coupon is invalid or no longer available" },
          { status: 400 }
        );
      }

      discount = getDiscountAmount(
        subtotal,
        coupon.discountType,
        Number(coupon.discountValue)
      );
      couponCode = coupon.code;
    }

    const shippingCost = calculateShipping(subtotal, data.shippingMethod);
    const tax = calculateTax(subtotal - discount, data.shippingState);
    const total = Math.max(0, subtotal + shippingCost + tax - discount);
    const orderNumber = generateOrderNumber();

    let order;
    try {
      order = await prisma.$transaction(async (tx) => {
        for (const item of orderItems) {
          const inv = await tx.inventory.findUnique({
            where: { variantId: item.variantId },
          });
          if (!inv || inv.quantity - inv.reserved < item.quantity) {
            throw new Error(
              `Insufficient stock for ${item.name} (${item.size}/${item.color})`
            );
          }

          const reserved = await tx.inventory.updateMany({
            where: {
              variantId: item.variantId,
              quantity: inv.quantity,
              reserved: inv.reserved,
            },
            data: { reserved: { increment: item.quantity } },
          });

          if (reserved.count === 0) {
            throw new Error(
              `Stock changed for ${item.name}. Please refresh and try again.`
            );
          }
        }

        return tx.order.create({
          data: {
            orderNumber,
            status: "PENDING",
            currency: "inr",
            subtotal,
            shippingCost,
            tax,
            discount,
            total,
            couponCode,
            notes: data.notes,
            guestEmail: session?.user?.email ? undefined : data.email,
            shippingName: data.shippingName,
            shippingLine1: data.shippingLine1,
            shippingLine2: data.shippingLine2,
            shippingCity: data.shippingCity,
            shippingState: data.shippingState,
            shippingZip: data.shippingZip,
            shippingCountry: data.shippingCountry || "IN",
            shippingPhone: data.shippingPhone,
            billingName: data.sameAsBilling ? data.shippingName : data.billingName,
            billingLine1: data.sameAsBilling ? data.shippingLine1 : data.billingLine1,
            billingLine2: data.sameAsBilling ? data.shippingLine2 : data.billingLine2,
            billingCity: data.sameAsBilling ? data.shippingCity : data.billingCity,
            billingState: data.sameAsBilling ? data.shippingState : data.billingState,
            billingZip: data.sameAsBilling ? data.shippingZip : data.billingZip,
            billingCountry: data.sameAsBilling
              ? data.shippingCountry || "IN"
              : data.billingCountry,
            userId: session?.user?.id,
            items: { create: orderItems },
          },
        });
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not reserve stock";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const successUrl = orderSuccessPath(order.orderNumber);

    if (demoMode) {
      const demoPaymentId = `demo_pay_${order.id.slice(-10)}`;
      await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: `demo_order_${order.id.slice(-10)}` },
      });
      await fulfillOrder(order.id, { razorpayPaymentId: demoPaymentId });

      return NextResponse.json({
        demo: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        redirectUrl: successUrl,
        subtotal,
        shippingCost,
        tax,
        discount,
        total,
      });
    }

    const razorpayOrder = await createRazorpayOrder({
      amountInRupees: total,
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    return NextResponse.json({
      demo: false,
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      name: process.env.NEXT_PUBLIC_APP_NAME ?? "Premium Tees",
      email: session?.user?.email ?? data.email,
      contact: data.shippingPhone ?? "",
      redirectUrl: successUrl,
      subtotal,
      shippingCost,
      tax,
      discount,
      total,
    });
  } catch (error) {
    console.error("[POST /api/checkout]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

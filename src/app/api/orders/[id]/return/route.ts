import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReturnRequestAdminEmail } from "@/lib/email/return-notification";

const schema = z.object({
  reason: z.string().min(3, "Please share a short reason").max(200),
  notes: z.string().max(1000).optional(),
});

const ELIGIBLE = new Set(["PAID", "PROCESSING", "SHIPPED", "DELIVERED"]);

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!ELIGIBLE.has(order.status)) {
      return NextResponse.json(
        { error: "This order is not eligible for a return request" },
        { status: 400 }
      );
    }

    const openRequest = await prisma.returnRequest.findFirst({
      where: {
        orderId: order.id,
        status: { in: ["REQUESTED", "APPROVED"] },
      },
    });
    if (openRequest) {
      return NextResponse.json(
        { error: "A return request is already open for this order" },
        { status: 409 }
      );
    }

    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId: order.id,
        userId: session.user.id,
        reason: parsed.data.reason.trim(),
        notes: parsed.data.notes?.trim() || null,
      },
      include: {
        order: { include: { user: { select: { email: true, name: true } } } },
        user: { select: { email: true, name: true } },
      },
    });

    try {
      await sendReturnRequestAdminEmail(returnRequest);
    } catch (error) {
      console.error("[POST /api/orders/[id]/return] admin email failed", error);
    }

    return NextResponse.json({
      id: returnRequest.id,
      status: returnRequest.status,
      reason: returnRequest.reason,
      notes: returnRequest.notes,
      createdAt: returnRequest.createdAt,
    });
  } catch (error) {
    console.error("[POST /api/orders/[id]/return]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

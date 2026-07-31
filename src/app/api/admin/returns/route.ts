import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ReturnStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReturnStatusEmail } from "@/lib/email/return-notification";

const updateSchema = z.object({
  returnId: z.string().min(1),
  status: z.nativeEnum(ReturnStatus),
  adminNote: z.string().max(1000).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const status = request.nextUrl.searchParams.get("status") as ReturnStatus | null;

    const returns = await prisma.returnRequest.findMany({
      where: status ? { status } : {},
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            guestEmail: true,
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      returns: returns.map((item) => ({
        ...item,
        order: {
          ...item.order,
          total: Number(item.order.total),
        },
      })),
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("[GET /api/admin/returns]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { returnId, status, adminNote } = parsed.data;
    const existing = await prisma.returnRequest.findUnique({
      where: { id: returnId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Return request not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const returnRequest = await tx.returnRequest.update({
        where: { id: returnId },
        data: {
          status,
          ...(adminNote !== undefined ? { adminNote: adminNote.trim() || null } : {}),
        },
        include: {
          order: { include: { user: { select: { email: true, name: true } } } },
          user: { select: { email: true, name: true } },
        },
      });

      if (status === "REFUNDED") {
        await tx.order.update({
          where: { id: returnRequest.orderId },
          data: { status: "REFUNDED" },
        });
      }

      return returnRequest;
    });

    if (existing.status !== status) {
      try {
        await sendReturnStatusEmail(updated);
      } catch (error) {
        console.error("[PATCH /api/admin/returns] status email failed", error);
      }
    }

    return NextResponse.json({
      ...updated,
      order: {
        ...updated.order,
        total: Number(updated.order.total),
        subtotal: Number(updated.order.subtotal),
        shippingCost: Number(updated.order.shippingCost),
        tax: Number(updated.order.tax),
        discount: Number(updated.order.discount),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("[PATCH /api/admin/returns]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

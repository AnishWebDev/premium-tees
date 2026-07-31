import { NextResponse } from "next/server";
import { z } from "zod";
import { Role } from "@prisma/client";
import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["USER", "ADMIN", "SUPERADMIN"]),
});

export async function GET() {
  try {
    await requireSuperAdmin();

    const select = {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true } },
    } as const;

    const [staff, customers] = await Promise.all([
      prisma.user.findMany({
        where: { role: { in: ["ADMIN", "SUPERADMIN"] } },
        select,
        orderBy: [{ role: "asc" }, { createdAt: "desc" }],
      }),
      prisma.user.findMany({
        where: { role: "USER" },
        select,
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return NextResponse.json({ staff, customers });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("[GET /api/admin/staff]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSuperAdmin();
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { userId, role } = parsed.data;

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (target.id === session.user.id && role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "You cannot demote your own SuperAdmin account" },
        { status: 400 }
      );
    }

    if (target.role === "SUPERADMIN" && role !== "SUPERADMIN") {
      const superCount = await prisma.user.count({
        where: { role: "SUPERADMIN" },
      });
      if (superCount <= 1) {
        return NextResponse.json(
          { error: "Cannot demote the last SuperAdmin" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: role as Role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("[PATCH /api/admin/staff]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

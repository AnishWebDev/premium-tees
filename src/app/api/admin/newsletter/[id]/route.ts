import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { removeNewsletterFromGoogleSheetsSafe } from "@/lib/google-sheets";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireSuperAdmin();
    const { id } = await context.params;

    const existing = await prisma.newsletter.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    await prisma.newsletter.delete({ where: { id } });
    await removeNewsletterFromGoogleSheetsSafe(existing.email);

    return NextResponse.json({ message: "Subscriber deleted" });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("[DELETE /api/admin/newsletter/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

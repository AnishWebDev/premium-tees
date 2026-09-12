import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const subscribers = await prisma.newsletter.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (request.nextUrl.searchParams.get("format") === "csv") {
      const header = "email,active,createdAt";
      const rows = subscribers.map((sub) => {
        const email = `"${sub.email.replace(/"/g, '""')}"`;
        const createdAt = sub.createdAt.toISOString();
        return `${email},${sub.active},${createdAt}`;
      });
      const csv = [header, ...rows].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="newsletter-subscribers.csv"',
        },
      });
    }

    return NextResponse.json({ subscribers, total: subscribers.length });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("[GET /api/admin/newsletter]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

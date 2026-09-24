import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { syncAllNewslettersFromDatabase } from "@/lib/google-sheets";
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

export async function POST() {
  try {
    await requireAdmin();
    const result = await syncAllNewslettersFromDatabase();
    return NextResponse.json({
      message: "Newsletter list synced to Google Sheets",
      ...result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (error.message === "Google Sheets is not configured") {
        return NextResponse.json({ error: error.message }, { status: 503 });
      }
    }
    console.error("[POST /api/admin/newsletter]", error);
    return NextResponse.json({ error: "Failed to sync newsletter to Google Sheets" }, { status: 500 });
  }
}

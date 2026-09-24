import { NextResponse } from "next/server";
import { syncNewsletterToGoogleSheetsSafe } from "@/lib/google-sheets";
import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validations/checkout";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();

    const existing = await prisma.newsletter.findUnique({ where: { email } });

    if (existing) {
      if (existing.active) {
        await syncNewsletterToGoogleSheetsSafe({
          email: existing.email,
          active: true,
          createdAt: existing.createdAt,
          updatedAt: new Date(),
        });
        return NextResponse.json({ message: "Already subscribed" }, { status: 200 });
      }

      const updated = await prisma.newsletter.update({
        where: { email },
        data: { active: true },
      });

      await syncNewsletterToGoogleSheetsSafe({
        email: updated.email,
        active: updated.active,
        createdAt: updated.createdAt,
        updatedAt: new Date(),
      });

      return NextResponse.json({ message: "Resubscribed successfully" });
    }

    const created = await prisma.newsletter.create({ data: { email } });

    await syncNewsletterToGoogleSheetsSafe({
      email: created.email,
      active: created.active,
      createdAt: created.createdAt,
      updatedAt: created.createdAt,
    });

    return NextResponse.json({ message: "Subscribed successfully" }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/newsletter]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

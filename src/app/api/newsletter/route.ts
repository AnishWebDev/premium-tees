import { NextResponse } from "next/server";
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
        return NextResponse.json({ message: "Already subscribed" }, { status: 200 });
      }

      await prisma.newsletter.update({
        where: { email },
        data: { active: true },
      });

      return NextResponse.json({ message: "Resubscribed successfully" });
    }

    await prisma.newsletter.create({ data: { email } });

    return NextResponse.json({ message: "Subscribed successfully" }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/newsletter]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

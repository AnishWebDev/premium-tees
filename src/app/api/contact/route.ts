import { NextResponse } from "next/server";
import { appendContactToGoogleSheets, isGoogleSheetsConfigured } from "@/lib/google-sheets";
import { contactSchema } from "@/lib/validations/checkout";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid form data" },
        { status: 400 }
      );
    }

    if (!isGoogleSheetsConfigured()) {
      return NextResponse.json(
        {
          error:
            "Contact form is not connected yet. Please email us directly or try again later.",
        },
        { status: 503 }
      );
    }

    await appendContactToGoogleSheets(parsed.data);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/contact]", error);
    return NextResponse.json(
      { error: "Could not send your message. Please try again or email us directly." },
      { status: 500 }
    );
  }
}

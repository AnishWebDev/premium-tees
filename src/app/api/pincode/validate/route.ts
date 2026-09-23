import { NextResponse } from "next/server";
import { z } from "zod";
import { validateIndiaPincode } from "@/lib/india-pincode";
import { pinCodeSchema } from "@/lib/validations/checkout";

const schema = z.object({
  pin: pinCodeSchema,
  state: z.string().min(1, "Select a state"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: parsed.error.flatten().fieldErrors.pin?.[0] ?? "Invalid PIN" },
        { status: 400 }
      );
    }

    const result = await validateIndiaPincode(parsed.data.pin, parsed.data.state);
    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/pincode/validate]", error);
    return NextResponse.json(
      { ok: false, message: "Could not verify PIN code" },
      { status: 500 }
    );
  }
}

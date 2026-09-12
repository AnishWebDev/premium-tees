import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { getGoogleSheetsUrl, isGoogleSheetsConfigured } from "@/lib/google-sheets";
import { getStoreSettings, upsertStoreSettings } from "@/lib/store-settings";

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getStoreSettings();

    return NextResponse.json({
      settings,
      sheetsConfigured: isGoogleSheetsConfigured(),
      sheetsUrl: getGoogleSheetsUrl(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("[GET /api/admin/store-settings]", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

const putSchema = z
  .object({
    paymentsEnabled: z.boolean().optional(),
    audiencesEnabled: z
      .object({
        women: z.boolean(),
        girl: z.boolean(),
        boy: z.boolean(),
      })
      .optional(),
  })
  .refine(
    (data) => data.paymentsEnabled !== undefined || data.audiencesEnabled !== undefined,
    { message: "No settings to update" }
  );

export async function PUT(request: Request) {
  try {
    await requireSuperAdmin();
    const body = await request.json();
    const parsed = putSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const settings = await upsertStoreSettings({
      ...(parsed.data.paymentsEnabled !== undefined
        ? { paymentsEnabled: parsed.data.paymentsEnabled }
        : {}),
      ...(parsed.data.audiencesEnabled
        ? { audiencesEnabled: parsed.data.audiencesEnabled }
        : {}),
    });

    revalidatePath("/checkout");
    revalidatePath("/shop");
    revalidatePath("/admin/settings");

    return NextResponse.json({
      ok: true,
      settings,
      sheetsConfigured: isGoogleSheetsConfigured(),
      sheetsUrl: getGoogleSheetsUrl(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("[PUT /api/admin/store-settings]", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}

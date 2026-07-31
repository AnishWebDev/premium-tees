import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth";
import { HOME_TEMPLATE_IDS } from "@/lib/home-templates";
import {
  applyStyleDefaults,
  getStyleDefaults,
  upsertStyleDefaults,
} from "@/lib/style-defaults";
import { normalizeTheme } from "@/lib/theme";

export async function GET() {
  try {
    await requireSuperAdmin();
    const defaults = await getStyleDefaults();
    return NextResponse.json({
      hasDefaults: Boolean(defaults),
      defaults,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("[GET /api/admin/style-defaults]", error);
    return NextResponse.json({ error: "Failed to load defaults" }, { status: 500 });
  }
}

const postSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("save"),
    theme: z.unknown().optional(),
    homeTemplate: z.enum(HOME_TEMPLATE_IDS).optional(),
  }),
  z.object({
    action: z.literal("reset"),
  }),
]);

function revalidateStorefront() {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/admin/content");
  revalidatePath("/admin/settings");
}

export async function POST(request: Request) {
  try {
    await requireSuperAdmin();
    const body = await request.json();
    const parsed = postSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (parsed.data.action === "save") {
      const defaults = await upsertStyleDefaults({
        theme:
          parsed.data.theme !== undefined
            ? normalizeTheme(parsed.data.theme)
            : undefined,
        homeTemplate: parsed.data.homeTemplate,
      });
      return NextResponse.json({
        ok: true,
        action: "save",
        defaults,
      });
    }

    const defaults = await applyStyleDefaults();
    revalidateStorefront();
    return NextResponse.json({
      ok: true,
      action: "reset",
      defaults,
      theme: defaults.theme,
      homeTemplate: defaults.homeTemplate,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (
      error instanceof Error &&
      error.message.includes("No SuperAdmin style defaults")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[POST /api/admin/style-defaults]", error);
    return NextResponse.json({ error: "Failed to update defaults" }, { status: 500 });
  }
}

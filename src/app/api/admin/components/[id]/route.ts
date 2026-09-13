import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { HOME_SECTION_TYPES } from "@/lib/home-sections";
import {
  deleteCmsComponent,
  getCmsComponentById,
  updateCmsComponent,
} from "@/lib/cms-components";

type RouteContext = { params: Promise<{ id: string }> };

const putSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  type: z.enum(HOME_SECTION_TYPES).optional(),
  props: z.record(z.unknown()).optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const component = await getCmsComponentById(id);
    if (!component) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ component });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to load component" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const existing = await getCmsComponentById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = putSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const component = await updateCmsComponent(id, parsed.data);

    revalidatePath("/", "layout");
    revalidatePath("/admin/content");

    return NextResponse.json({ component });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[PUT /api/admin/components/[id]]", error);
    return NextResponse.json({ error: "Failed to save component" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const existing = await getCmsComponentById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deleteCmsComponent(id);

    revalidatePath("/", "layout");
    revalidatePath("/admin/content");

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete component" },
      { status: 500 }
    );
  }
}

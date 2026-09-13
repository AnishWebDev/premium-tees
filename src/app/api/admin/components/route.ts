import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { HOME_SECTION_TYPES } from "@/lib/home-sections";
import { createCmsComponent, listCmsComponents } from "@/lib/cms-components";

export async function GET() {
  try {
    await requireAdmin();
    const components = await listCmsComponents();
    return NextResponse.json({ components });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/admin/components]", error);
    return NextResponse.json(
      { error: "Failed to load components" },
      { status: 500 }
    );
  }
}

const postSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(HOME_SECTION_TYPES),
  props: z.record(z.unknown()).optional(),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const component = await createCmsComponent(parsed.data);

    revalidatePath("/", "layout");
    revalidatePath("/admin/content");

    return NextResponse.json({ component });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[POST /api/admin/components]", error);
    return NextResponse.json(
      { error: "Failed to create component" },
      { status: 500 }
    );
  }
}

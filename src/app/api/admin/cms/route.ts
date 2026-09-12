import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { CMS_KEYS, upsertCmsBlock, type CmsKey } from "@/lib/cms-content";

const putSchema = z.object({
  key: z.enum(CMS_KEYS as unknown as [CmsKey, ...CmsKey[]]),
  data: z.unknown(),
});

export async function GET() {
  try {
    await requireAdmin();
    const { getAllCmsContent } = await import("@/lib/cms-content");
    const content = await getAllCmsContent();
    return NextResponse.json({ content });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to load CMS content" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = putSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await upsertCmsBlock(parsed.data.key, parsed.data.data);

    revalidatePath("/terms");
    revalidatePath("/privacy");
    revalidatePath("/shipping");
    revalidatePath("/collections");
    revalidatePath("/shop");
    revalidatePath("/login");
    revalidatePath("/register");
    revalidatePath("/admin/content");

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

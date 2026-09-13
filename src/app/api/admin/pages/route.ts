import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import {
  createCmsPage,
  listCmsPages,
  normalizeSlug,
  RESERVED_PAGE_SLUGS,
} from "@/lib/cms-pages";

export async function GET() {
  try {
    await requireAdmin();
    const pages = await listCmsPages();
    return NextResponse.json({ pages });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/admin/pages]", error);
    return NextResponse.json({ error: "Failed to load pages" }, { status: 500 });
  }
}

const postSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  published: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const slug = normalizeSlug(parsed.data.slug);
    if (!slug || RESERVED_PAGE_SLUGS.has(slug)) {
      return NextResponse.json({ error: "Invalid or reserved slug" }, { status: 400 });
    }

    const page = await createCmsPage({
      slug,
      title: parsed.data.title,
      description: parsed.data.description,
      published: parsed.data.published,
    });

    revalidatePath("/admin/content");
    revalidatePath(`/pages/${slug}`);

    return NextResponse.json({ page });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }
    console.error("[POST /api/admin/pages]", error);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";
import {
  deleteCmsPage,
  getCmsPageById,
  normalizeSlug,
  RESERVED_PAGE_SLUGS,
  updateCmsPage,
} from "@/lib/cms-pages";
import type { HomeSectionItem } from "@/lib/home-sections";
import { pageBannerSchema } from "@/lib/page-banner";

type RouteContext = { params: Promise<{ id: string }> };

const putSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  published: z.boolean().optional(),
  template: z.string().nullable().optional(),
  sections: z.array(z.unknown()).optional(),
  banner: pageBannerSchema.optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const page = await getCmsPageById(id);
    if (!page) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ page });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to load page" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;
    const existing = await getCmsPageById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = putSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const superAdmin = isSuperAdmin(session.user.role);
    const data = parsed.data;

    if (data.slug !== undefined && !existing.isSystem) {
      const slug = normalizeSlug(data.slug);
      if (!slug || RESERVED_PAGE_SLUGS.has(slug)) {
        return NextResponse.json({ error: "Invalid or reserved slug" }, { status: 400 });
      }
    }

    if (data.template !== undefined && !superAdmin) {
      return NextResponse.json(
        { error: "Only SuperAdmin can change the homepage template" },
        { status: 403 }
      );
    }

    const nextSections =
      data.sections !== undefined
        ? (data.sections as HomeSectionItem[])
        : existing.sections;

    const page = await updateCmsPage(id, {
      slug: data.slug,
      title: data.title,
      description: data.description,
      published: data.published,
      template: data.template,
      sections: data.sections !== undefined ? nextSections : undefined,
      ...(data.banner !== undefined ? { banner: data.banner } : {}),
    });

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin/content");
    revalidatePath("/shop");
    revalidatePath("/collections");
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/faq");
    revalidatePath("/privacy");
    revalidatePath("/terms");
    revalidatePath("/shipping");
    if (page.slug !== "home" && !page.isSystem) {
      revalidatePath(`/${page.slug}`);
    }

    return NextResponse.json({ page });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[PUT /api/admin/pages/[id]]", error);
    return NextResponse.json({ error: "Failed to save page" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const existing = await getCmsPageById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deleteCmsPage(id);

    revalidatePath("/admin/content");
    revalidatePath(`/${existing.slug}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("System pages")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}

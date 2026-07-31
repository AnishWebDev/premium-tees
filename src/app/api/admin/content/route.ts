import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";
import {
  CONTENT_KEYS,
  getContentBlock,
  getAllSiteContent,
  type ContentKey,
  type HomeData,
  upsertContentBlock,
} from "@/lib/site-content";

export async function GET() {
  try {
    await requireAdmin();
    const content = await getAllSiteContent();
    return NextResponse.json(content);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("[GET /api/admin/content]", error);
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
  }
}

const putSchema = z.object({
  key: z.enum(CONTENT_KEYS),
  data: z.unknown(),
});

export async function PUT(request: Request) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const parsed = putSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { key, data } = parsed.data;

    if (key === "footerCredit" && !isSuperAdmin(session.user.role)) {
      return NextResponse.json(
        { error: "Only SuperAdmin can edit the footer credit" },
        { status: 403 }
      );
    }

    let payload = data;
    if (key === "home") {
      const existing = await getContentBlock("home");
      const incoming = data as HomeData;
      if (
        incoming.template &&
        incoming.template !== existing.template &&
        !isSuperAdmin(session.user.role)
      ) {
        return NextResponse.json(
          { error: "Only SuperAdmin can change the homepage template" },
          { status: 403 }
        );
      }
      const superAdmin = isSuperAdmin(session.user.role);
      let nextSections = existing.sections;
      if (superAdmin) {
        nextSections = incoming.sections ?? existing.sections;
      } else if (Array.isArray(incoming.sections)) {
        // Admin may update props on existing sections only (no reorder/add/remove)
        const incomingById = new Map(
          incoming.sections.map((s) => [s.id, s] as const)
        );
        nextSections = existing.sections.map((s) => {
          const patch = incomingById.get(s.id);
          if (!patch) return s;
          return {
            ...s,
            props: patch.props ?? s.props,
          };
        });
      }

      payload = {
        ...existing,
        ...incoming,
        story: { ...existing.story, ...incoming.story },
        essentials: { ...existing.essentials, ...incoming.essentials },
        bestSellers: { ...existing.bestSellers, ...incoming.bestSellers },
        newArrivals: { ...existing.newArrivals, ...incoming.newArrivals },
        categories: { ...existing.categories, ...incoming.categories },
        template: superAdmin
          ? incoming.template ?? existing.template
          : existing.template,
        sections: nextSections,
      };
    }

    await upsertContentBlock(key as ContentKey, payload);
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/faq");
    revalidatePath("/admin/content");
    revalidatePath("/admin/settings");
    return NextResponse.json({ ok: true, key });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("[PUT /api/admin/content]", error);
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import type { HomeSectionItem } from "@/lib/home-sections";
import { getContentBlock, upsertContentBlock } from "@/lib/site-content";

export type CmsPageRecord = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  published: boolean;
  isSystem: boolean;
  template: string | null;
  sections: HomeSectionItem[];
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

function parseSections(raw: unknown): HomeSectionItem[] {
  if (!Array.isArray(raw)) return [];
  return raw as HomeSectionItem[];
}

function toRecord(row: {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  published: boolean;
  isSystem: boolean;
  template: string | null;
  sections: unknown;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): CmsPageRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    published: row.published,
    isSystem: row.isSystem,
    template: row.template,
    sections: parseSections(row.sections),
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Seed homepage from legacy SiteContent on first run. */
export async function ensureCmsPagesSeeded(): Promise<void> {
  const count = await prisma.cmsPage.count();
  if (count > 0) return;

  const home = await getContentBlock("home");
  await prisma.cmsPage.create({
    data: {
      slug: "home",
      title: "Homepage",
      description: "Main storefront landing page",
      published: true,
      isSystem: true,
      template: home.template,
      sections: home.sections,
      sortOrder: 0,
    },
  });
}

export async function listCmsPages(): Promise<CmsPageRecord[]> {
  await ensureCmsPagesSeeded();
  const rows = await prisma.cmsPage.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return rows.map(toRecord);
}

export async function getCmsPageBySlug(
  slug: string
): Promise<CmsPageRecord | null> {
  await ensureCmsPagesSeeded();
  const row = await prisma.cmsPage.findUnique({ where: { slug } });
  return row ? toRecord(row) : null;
}

export async function getCmsPageById(
  id: string
): Promise<CmsPageRecord | null> {
  const row = await prisma.cmsPage.findUnique({ where: { id } });
  return row ? toRecord(row) : null;
}

export async function createCmsPage(input: {
  slug: string;
  title: string;
  description?: string | null;
  published?: boolean;
}): Promise<CmsPageRecord> {
  const slug = normalizeSlug(input.slug);
  const row = await prisma.cmsPage.create({
    data: {
      slug,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      published: input.published ?? false,
      isSystem: false,
      sections: [],
      sortOrder: 100,
    },
  });
  return toRecord(row);
}

export async function updateCmsPage(
  id: string,
  input: {
    slug?: string;
    title?: string;
    description?: string | null;
    published?: boolean;
    template?: string | null;
    sections?: HomeSectionItem[];
  }
): Promise<CmsPageRecord> {
  const existing = await prisma.cmsPage.findUnique({ where: { id } });
  if (!existing) throw new Error("Page not found");

  const slug =
    input.slug !== undefined && !existing.isSystem
      ? normalizeSlug(input.slug)
      : undefined;

  const row = await prisma.cmsPage.update({
    where: { id },
    data: {
      ...(slug !== undefined ? { slug } : {}),
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      ...(input.published !== undefined ? { published: input.published } : {}),
      ...(input.template !== undefined ? { template: input.template } : {}),
      ...(input.sections !== undefined ? { sections: input.sections } : {}),
    },
  });

  if (row.slug === "home" && input.sections !== undefined) {
    const home = await getContentBlock("home");
    await upsertContentBlock("home", {
      ...home,
      sections: input.sections,
      ...(input.template !== undefined && input.template
        ? { template: input.template as typeof home.template }
        : {}),
    });
  }

  return toRecord(row);
}

export async function deleteCmsPage(id: string): Promise<void> {
  const page = await prisma.cmsPage.findUnique({ where: { id } });
  if (!page) throw new Error("Page not found");
  if (page.isSystem) throw new Error("System pages cannot be deleted");
  await prisma.cmsPage.delete({ where: { id } });
}

export function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const RESERVED_PAGE_SLUGS = new Set([
  "home",
  "admin",
  "api",
  "shop",
  "cart",
  "checkout",
  "login",
  "register",
  "account",
  "collections",
  "product",
  "pages",
]);

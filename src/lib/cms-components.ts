import { prisma } from "@/lib/prisma";
import type { HomeSectionProps, HomeSectionType } from "@/lib/home-sections";

export type CmsComponentRecord = {
  id: string;
  name: string;
  description: string | null;
  type: HomeSectionType;
  props: HomeSectionProps;
  createdAt: Date;
  updatedAt: Date;
};

function parseProps(raw: unknown): HomeSectionProps {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as HomeSectionProps;
  }
  return {};
}

function toRecord(row: {
  id: string;
  name: string;
  description: string | null;
  type: string;
  props: unknown;
  createdAt: Date;
  updatedAt: Date;
}): CmsComponentRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type as HomeSectionType,
    props: parseProps(row.props),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listCmsComponents(): Promise<CmsComponentRecord[]> {
  const rows = await prisma.cmsComponent.findMany({
    orderBy: [{ name: "asc" }],
  });
  return rows.map(toRecord);
}

export async function getCmsComponentById(
  id: string
): Promise<CmsComponentRecord | null> {
  const row = await prisma.cmsComponent.findUnique({ where: { id } });
  return row ? toRecord(row) : null;
}

export async function createCmsComponent(input: {
  name: string;
  description?: string | null;
  type: HomeSectionType;
  props?: HomeSectionProps;
}): Promise<CmsComponentRecord> {
  const row = await prisma.cmsComponent.create({
    data: {
      name: input.name.trim(),
      description: input.description?.trim() || null,
      type: input.type,
      props: input.props ?? {},
    },
  });
  return toRecord(row);
}

export async function updateCmsComponent(
  id: string,
  input: {
    name?: string;
    description?: string | null;
    type?: HomeSectionType;
    props?: HomeSectionProps;
  }
): Promise<CmsComponentRecord> {
  const row = await prisma.cmsComponent.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.props !== undefined ? { props: input.props } : {}),
    },
  });
  return toRecord(row);
}

export async function deleteCmsComponent(id: string): Promise<void> {
  await prisma.cmsComponent.delete({ where: { id } });
}

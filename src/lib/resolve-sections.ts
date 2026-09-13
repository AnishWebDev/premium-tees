import { prisma } from "@/lib/prisma";
import type { HomeSectionItem, HomeSectionProps } from "@/lib/home-sections";

function parseProps(raw: unknown): HomeSectionProps {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as HomeSectionProps;
  }
  return {};
}

/** Merge library component props with page-level overrides. */
export async function resolvePageSections(
  sections: HomeSectionItem[]
): Promise<HomeSectionItem[]> {
  const refIds = [
    ...new Set(
      sections
        .map((s) => s.componentRefId)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  if (refIds.length === 0) return sections;

  const components = await prisma.cmsComponent.findMany({
    where: { id: { in: refIds } },
  });
  const byId = new Map(components.map((c) => [c.id, c]));

  return sections.map((section) => {
    if (!section.componentRefId) return section;
    const component = byId.get(section.componentRefId);
    if (!component) return section;
    return {
      ...section,
      type: component.type as HomeSectionItem["type"],
      props: {
        ...parseProps(component.props),
        ...(section.props ?? {}),
      },
    };
  });
}

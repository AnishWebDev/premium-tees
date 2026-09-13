import { PageSectionsView } from "@/components/home/templates/section-home";
import type { HomeTemplateProps } from "@/components/home/templates/types";
import type { HomeSectionItem } from "@/lib/home-sections";

type CmsPageViewProps = HomeTemplateProps & {
  sections: HomeSectionItem[];
};

export function CmsPageView({ sections, ...props }: CmsPageViewProps) {
  return <PageSectionsView sections={sections} {...props} />;
}

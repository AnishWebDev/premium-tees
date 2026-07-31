import type { HomeTemplateProps } from "@/components/home/templates/types";
import { SectionHome } from "@/components/home/templates/section-home";

/** Homepage always renders from the SuperAdmin section list (templates seed that list). */
export function HomeTemplate(props: HomeTemplateProps & { template?: string }) {
  return <SectionHome {...props} />;
}

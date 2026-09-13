import { auth } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";
import { listCmsComponents } from "@/lib/cms-components";
import { listCmsPages } from "@/lib/cms-pages";
import { getAllSiteContent } from "@/lib/site-content";
import { CmsStudio } from "@/components/admin/cms-studio";
import type { SectionContentSource } from "@/lib/home-sections";

export const dynamic = "force-dynamic";

function toSectionContentSource(
  content: Awaited<ReturnType<typeof getAllSiteContent>>
): SectionContentSource {
  return {
    site: content.site,
    hero: content.hero,
    home: content.home,
    about: content.about,
    testimonials: content.testimonials,
    faq: content.faq,
    instagram: content.instagram,
    newsletter: content.newsletter,
  };
}

export default async function AdminContentPage() {
  const [pages, components, content, session] = await Promise.all([
    listCmsPages(),
    listCmsComponents(),
    getAllSiteContent(),
    auth(),
  ]);
  const superAdmin = isSuperAdmin(session?.user?.role);

  return (
    <CmsStudio
      initialPages={pages}
      initialComponents={components}
      contentSource={toSectionContentSource(content)}
      canManageLayout={superAdmin}
      canSelectHomeTemplate={superAdmin}
    />
  );
}

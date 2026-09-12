import { auth } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";
import { getAllCmsContent } from "@/lib/cms-content";
import { getAllSiteContent } from "@/lib/site-content";
import { getStyleDefaults } from "@/lib/style-defaults";
import { CmsExtraEditor } from "@/components/admin/cms-extra-editor";
import { SiteContentEditor } from "@/components/admin/site-content-editor";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const [content, cmsContent, session, styleDefaults] = await Promise.all([
    getAllSiteContent(),
    getAllCmsContent(),
    auth(),
    getStyleDefaults(),
  ]);
  const superAdmin = isSuperAdmin(session?.user?.role);

  return (
    <div className="space-y-8">
      <SiteContentEditor
        initialContent={content}
        canSelectHomeTemplate={superAdmin}
        hasStyleDefaults={Boolean(styleDefaults)}
        canEditFooterCredit={superAdmin}
      />
      <CmsExtraEditor initialContent={cmsContent} />
    </div>
  );
}

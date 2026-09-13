import { auth } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";
import { getAllCmsContent } from "@/lib/cms-content";
import { getAllSiteContent } from "@/lib/site-content";
import { getStyleDefaults } from "@/lib/style-defaults";
import { CmsExtraEditor } from "@/components/admin/cms-extra-editor";
import { SiteContentEditor } from "@/components/admin/site-content-editor";

export const dynamic = "force-dynamic";

const GLOBAL_TABS = [
  "site",
  "header",
  "footer",
  "about",
  "contact",
  "testimonials",
  "faq",
  "instagram",
  "newsletter",
  "footerCredit",
] as const;

export default async function AdminSiteGlobalPage() {
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
        canSelectHomeTemplate={false}
        hasStyleDefaults={Boolean(styleDefaults)}
        canEditFooterCredit={superAdmin}
        visibleTabs={[...GLOBAL_TABS.filter((t) => t !== "footerCredit" || superAdmin)]}
        title="Site & global content"
        description="Logo, navigation, footer, and legacy page copy (about, FAQ, etc.)."
      />
      <CmsExtraEditor initialContent={cmsContent} />
    </div>
  );
}

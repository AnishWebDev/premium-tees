import { auth } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";
import { getAllSiteContent } from "@/lib/site-content";
import { getStyleDefaults } from "@/lib/style-defaults";
import { SiteContentEditor } from "@/components/admin/site-content-editor";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const [content, session, styleDefaults] = await Promise.all([
    getAllSiteContent(),
    auth(),
    getStyleDefaults(),
  ]);
  const superAdmin = isSuperAdmin(session?.user?.role);

  return (
    <SiteContentEditor
      initialContent={content}
      canSelectHomeTemplate={superAdmin}
      hasStyleDefaults={Boolean(styleDefaults)}
      canEditFooterCredit={superAdmin}
    />
  );
}

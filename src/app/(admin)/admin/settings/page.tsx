import { auth } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";
import { getContentBlock } from "@/lib/site-content";
import { getStyleDefaults } from "@/lib/style-defaults";
import { getSystemStatus } from "@/lib/system-status";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { ThemeEditor } from "@/components/admin/theme-editor";
import { SystemStatusCard } from "@/components/admin/system-status-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();
  const [theme, styleDefaults] = await Promise.all([
    getContentBlock("theme"),
    getStyleDefaults(),
  ]);
  const showSystem = isSuperAdmin(session?.user?.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-neutral-950">
          Settings
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Change your password, pick a theme, or customize buttons and links.
        </p>
      </div>

      <Tabs defaultValue="style">
        <TabsList>
          <TabsTrigger value="style">Site style</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          {showSystem && <TabsTrigger value="system">System</TabsTrigger>}
        </TabsList>
        <TabsContent value="style" className="mt-6">
          <ThemeEditor
            initialTheme={theme}
            isSuperAdmin={showSystem}
            hasStyleDefaults={Boolean(styleDefaults)}
          />
        </TabsContent>
        <TabsContent value="password" className="mt-6">
          <ChangePasswordForm />
        </TabsContent>
        {showSystem && (
          <TabsContent value="system" className="mt-6">
            <SystemStatusCard status={getSystemStatus()} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

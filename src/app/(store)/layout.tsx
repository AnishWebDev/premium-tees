import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SkipLink } from "@/components/layout/skip-link";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { getContentBlock } from "@/lib/site-content";
import { getStoreSettings } from "@/lib/store-settings";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [header, storeSettings] = await Promise.all([
    getContentBlock("header"),
    getStoreSettings(),
  ]);

  const { announcement } = storeSettings;

  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <AnnouncementBar
        enabled={announcement.enabled}
        message={announcement.message}
        linkHref={announcement.linkHref}
        linkLabel={announcement.linkLabel}
      />
      <Header
        navLinks={header.navLinks}
        logoImageUrl={header.logoImageUrl}
        logoImageAlt={header.logoImageAlt}
      />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SkipLink } from "@/components/layout/skip-link";
import { PromoHelloBar } from "@/components/home/blocks/promo-hello-bar";
import { getContentBlock } from "@/lib/site-content";
import { helloBarIsVisible } from "@/lib/hello-bar";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const header = await getContentBlock("header");
  const bar = header.helloBar;

  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <PromoHelloBar
        sectionId="site-header"
        enabled={bar.enabled}
        message={bar.message}
        linkHref={bar.linkHref}
        linkLabel={bar.linkLabel}
        scheduleStartAt={bar.scheduleStartAt}
        scheduleEndAt={bar.scheduleEndAt}
        bgStyle={bar.bgStyle}
        backgroundColor={bar.backgroundColor}
        textColor={bar.textColor}
        settingSticky={bar.settingSticky}
        settingDismissible={bar.settingDismissible}
        initiallyVisible={helloBarIsVisible(bar)}
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

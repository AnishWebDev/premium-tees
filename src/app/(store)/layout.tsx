import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getContentBlock } from "@/lib/site-content";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const header = await getContentBlock("header");

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        navLinks={header.navLinks}
        logoImageUrl={header.logoImageUrl}
        logoImageAlt={header.logoImageAlt}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

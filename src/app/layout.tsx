import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { ThemeStyle } from "@/components/theme/theme-style";
import { fontVariableClassName } from "@/lib/fonts";
import { SITE_URL } from "@/lib/constants";
import { getSiteIdentity } from "@/lib/site-identity";
import { getStoreSettings } from "@/lib/store-settings";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const [site, storeSettings] = await Promise.all([getSiteIdentity(), getStoreSettings()]);
  const suffix = storeSettings.seo.titleSuffix;
  const ogImage = storeSettings.seo.ogImageUrl || "/og.jpg";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${site.name} — ${suffix}`,
      template: `%s · ${site.name}`,
    },
    description: site.description,
    keywords: [...storeSettings.seo.keywords, site.name],
    authors: [{ name: site.name }],
    creator: site.name,
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: SITE_URL,
      siteName: site.name,
      title: `${site.name} — ${suffix}`,
      description: site.description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: site.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.name} — ${suffix}`,
      description: site.description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: SITE_URL,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#fafafa",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [site, storeSettings] = await Promise.all([
    getSiteIdentity(),
    getStoreSettings(),
  ]);

  return (
    <html lang="en" className={fontVariableClassName} suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)] antialiased">
        <GoogleAnalytics analyticsId={storeSettings.seo.analyticsId} />
        <ThemeStyle />
        <AppProviders site={site}>{children}</AppProviders>
      </body>
    </html>
  );
}

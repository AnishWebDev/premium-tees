import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { ThemeStyle } from "@/components/theme/theme-style";
import { fontVariableClassName } from "@/lib/fonts";
import { SITE_URL } from "@/lib/constants";
import { getSiteFaviconUrl } from "@/lib/site-branding";
import { getSiteIdentity } from "@/lib/site-identity";
import { getContentBlock } from "@/lib/site-content";
import { getStoreSettings } from "@/lib/store-settings";
import { normalizeTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import "./globals.css";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [site, faviconUrl, storeSettings] = await Promise.all([
    getSiteIdentity(),
    getSiteFaviconUrl(),
    getStoreSettings(),
  ]);
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
    ...(faviconUrl
      ? {
          icons: {
            icon: [{ url: faviconUrl }],
            shortcut: [{ url: faviconUrl }],
            apple: [{ url: faviconUrl }],
          },
        }
      : {}),
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
  const [site, faviconUrl, storeSettings, theme] = await Promise.all([
    getSiteIdentity(),
    getSiteFaviconUrl(),
    getStoreSettings(),
    getContentBlock("theme"),
  ]);
  const normalizedTheme = normalizeTheme(theme);

  return (
    <html
      lang="en"
      className={cn(
        fontVariableClassName,
        normalizedTheme.hideScrollbar && "hide-scrollbar"
      )}
      data-button-style={normalizedTheme.buttonStyle}
      suppressHydrationWarning
    >
      <head>
        {faviconUrl ? (
          <>
            <link rel="icon" href={faviconUrl} type="image/png" sizes="any" />
            <link rel="shortcut icon" href={faviconUrl} type="image/png" />
            <link rel="apple-touch-icon" href={faviconUrl} />
          </>
        ) : null}
        <ThemeStyle />
      </head>
      <body className="min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)] antialiased">
        <GoogleAnalytics analyticsId={storeSettings.seo.analyticsId} />
        <AppProviders site={site}>{children}</AppProviders>
      </body>
    </html>
  );
}

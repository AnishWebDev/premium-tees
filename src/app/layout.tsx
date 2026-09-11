import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import { ThemeStyle } from "@/components/theme/theme-style";
import { fontVariableClassName } from "@/lib/fonts";
import { SITE_URL } from "@/lib/constants";
import { getSiteIdentity } from "@/lib/site-identity";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteIdentity();

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${site.name} — Premium Essential Tees`,
      template: `%s · ${site.name}`,
    },
    description: site.description,
    keywords: [
      "premium t-shirts",
      "organic cotton tee",
      "minimal apparel",
      "essential wardrobe",
      site.name,
    ],
    authors: [{ name: site.name }],
    creator: site.name,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      siteName: site.name,
      title: `${site.name} — Premium Essential Tees`,
      description: site.description,
      images: [
        {
          url: "/og.jpg",
          width: 1200,
          height: 630,
          alt: site.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.name} — Premium Essential Tees`,
      description: site.description,
      images: ["/og.jpg"],
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
  const site = await getSiteIdentity();

  return (
    <html lang="en" className={fontVariableClassName} suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)] antialiased">
        <ThemeStyle />
        <AppProviders site={site}>{children}</AppProviders>
      </body>
    </html>
  );
}

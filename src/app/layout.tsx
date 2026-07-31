import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import { ThemeStyle } from "@/components/theme/theme-style";
import { fontVariableClassName } from "@/lib/fonts";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Premium Essential Tees`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "premium t-shirts",
    "organic cotton tee",
    "minimal apparel",
    "essential wardrobe",
    SITE_NAME,
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Premium Essential Tees`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Premium Essential Tees`,
    description: SITE_DESCRIPTION,
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

export const viewport: Viewport = {
  themeColor: "#fafafa",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariableClassName} suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)] antialiased">
        <ThemeStyle />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

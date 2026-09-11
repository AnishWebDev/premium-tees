"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "sonner";
import { CartSessionSync } from "@/components/providers/cart-session-sync";
import { SiteIdentityProvider } from "@/components/providers/site-identity-provider";
import { WishlistSessionSync } from "@/components/providers/wishlist-session-sync";
import type { SiteIdentity } from "@/lib/site-identity";

export function AppProviders({
  site,
  children,
}: {
  site: SiteIdentity;
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        storageKey="premium-tees-color-mode"
        disableTransitionOnChange={false}
      >
        <QueryClientProvider client={queryClient}>
          <SiteIdentityProvider site={site}>
            <CartSessionSync />
            <WishlistSessionSync />
            {children}
          </SiteIdentityProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className:
                "rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] shadow-lg",
            }}
          />
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

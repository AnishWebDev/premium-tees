"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "sonner";
import { CartSessionSync } from "@/components/providers/cart-session-sync";
import { WishlistSessionSync } from "@/components/providers/wishlist-session-sync";

export function AppProviders({ children }: { children: React.ReactNode }) {
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
          <CartSessionSync />
          <WishlistSessionSync />
          {children}
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

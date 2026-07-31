"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, Heart, User, Search } from "lucide-react";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { resetCartForUser, useCartStore } from "@/lib/stores/cart-store";
import { cn } from "@/lib/utils";
import { ColorModeToggle } from "@/components/theme/color-mode-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const itemCount = useCartStore((s) => s.getItemCount());
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const count = mounted ? itemCount : 0;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_85%,transparent)] backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="container-tight flex h-16 items-center justify-between gap-4 lg:h-20">
        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            className="rounded-full p-2 text-[var(--foreground)] hover:bg-[var(--muted)]"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl"
        >
          {SITE_NAME}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-[var(--foreground)]",
                pathname.startsWith(link.href)
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ColorModeToggle />
          <Button variant="ghost" size="icon" asChild aria-label="Search">
            <Link href="/shop">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Wishlist">
            <Link href="/wishlist">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Cart" className="relative">
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-medium text-[var(--accent-foreground)]">
                  {count}
                </span>
              )}
            </Link>
          </Button>

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account menu">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-medium">{session.user.name}</p>
                  <p className="truncate text-[var(--muted-foreground)]">
                    {session.user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wishlist">Wishlist</Link>
                </DropdownMenuItem>
                {(session.user.role === "ADMIN" ||
                  session.user.role === "SUPERADMIN") && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    resetCartForUser(null);
                    void signOut({ callbackUrl: "/" });
                  }}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[var(--border)] bg-[var(--background)] lg:hidden"
            aria-label="Mobile"
          >
            <div className="container-tight flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-3 py-3 text-base font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
                >
                  {link.label}
                </Link>
              ))}
              {!session?.user && (
                <Link
                  href="/login"
                  className="rounded-xl px-3 py-3 text-base font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
                >
                  Sign in
                </Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
